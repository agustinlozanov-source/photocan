// Radar de prospección (solo equipo de Phot8can).
//   POST /api/radar/escanear  { zona, rubro, responsable? }      → arranca un escaneo
//   POST /api/radar/escanear  { reintentar: true, escaneo_id }    → vuelve a revisar las páginas que no abrieron
//   POST /api/radar/accion    { accion: "verificar", negocio_id, abre: true|false|null }
//   POST /api/radar/accion    { accion: "estado", negocio_id, estado }
// Las lecturas las hace la pantalla directo en Supabase (RLS: solo equipo).
import { json } from "../lib/comun.mjs";
import { delEquipo } from "../lib/equipo.mjs";
import { recalcular } from "../lib/radar.mjs";
import { admin } from "../lib/sitios.mjs";

export const config = { path: ["/api/radar/escanear", "/api/radar/accion"] };
export const esStaff = delEquipo;

const ESTADOS = ["detectado", "elegido", "propuesta_enviada", "abrio", "respondio", "convertido", "descartado"];

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const u = await esStaff(req);
  if (!u) return json({ error: "Solo el equipo de Phot8can puede usar el Radar." }, 403);
  let d;
  try {
    d = await req.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }
  const db = admin();
  const yo = String(u.email ?? "").toLowerCase();

  if (new URL(req.url).pathname.endsWith("/accion")) {
    const { data: n } = await db.from("radar_negocios").select("id, escaneo_id, estado, responsable").eq("id", String(d.negocio_id ?? "")).maybeSingle();
    if (!n) return json({ error: "No encontramos ese negocio." }, 404);

    if (d.accion === "verificar") {
      const { data: perfil } = await db.from("equipo").select("nombre").eq("correo", yo).maybeSingle();
      const verificacion = d.abre === true || d.abre === false ? { abre: d.abre, por: yo, nombre: perfil?.nombre ?? yo, fecha: new Date().toISOString() } : null;
      await db.from("radar_negocios").update({ verificacion }).eq("id", n.id);
      await db.from("radar_eventos").insert({ negocio_id: n.id, tipo: "verificacion", a: verificacion ? (d.abre ? "abre" : "no_abre") : "sin_verificar", por: yo });
      const { data: esc } = await db.from("radar_escaneos").select("rubro").eq("id", n.escaneo_id).single();
      await recalcular(db, n.escaneo_id, esc.rubro);
      return json({ ok: true });
    }

    if (d.accion === "estado") {
      const estado = String(d.estado ?? "");
      if (!ESTADOS.includes(estado)) return json({ error: "Estado inválido." }, 400);
      if (estado === n.estado) return json({ ok: true });
      // Al elegirlo, si no tiene responsable, queda a nombre de quien lo eligió.
      const cambios = { estado, estado_desde: new Date().toISOString(), ...(!n.responsable && estado !== "descartado" ? { responsable: yo } : {}) };
      await db.from("radar_negocios").update(cambios).eq("id", n.id);
      await db.from("radar_eventos").insert({ negocio_id: n.id, tipo: "estado", de: n.estado, a: estado, por: yo });
      return json({ ok: true });
    }
    return json({ error: "Acción desconocida." }, 400);
  }

  const base = process.env.URL ?? new URL(req.url).origin;
  const fondo = (cuerpo) =>
    fetch(`${base}/.netlify/functions/radar-escanear-background`, {
      method: "POST",
      headers: { Authorization: req.headers.get("authorization"), "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });

  // Volver a revisar las páginas que no abrieron en un escaneo ya hecho.
  if (d.reintentar) {
    const id = String(d.escaneo_id ?? "");
    const { data: e } = await db.from("radar_escaneos").select("id, estado").eq("id", id).maybeSingle();
    if (!e) return json({ error: "No encontramos ese escaneo." }, 404);
    if (e.estado === "escaneando") return json({ error: "Ese escaneo sigue trabajando." }, 409);
    await fondo({ escaneo_id: id, reintentar: true });
    return json({ escaneo_id: id }, 202);
  }

  const zona = String(d.zona ?? "").trim().slice(0, 120);
  const rubro = String(d.rubro ?? "").trim().slice(0, 80);
  if (!zona || !rubro) return json({ error: "Escribe la zona y el rubro." }, 400);
  if (!process.env.GOOGLE_RADAR_API_KEY) return json({ error: "Falta GOOGLE_RADAR_API_KEY en Netlify." }, 500);
  // Un admin puede asignar el escaneo a otra persona; el resto, a sí mismo.
  const pedido = String(d.responsable ?? "").toLowerCase();
  const responsable = u.rol === "admin" && pedido ? pedido : yo;

  const { data: esc, error } = await db.from("radar_escaneos").insert({ zona, rubro, creado_por: u.id, responsable }).select("id").single();
  if (error) return json({ error: `No se pudo crear el escaneo: ${error.message}` }, 500);
  await fondo({ escaneo_id: esc.id });
  return json({ escaneo_id: esc.id }, 202);
};
