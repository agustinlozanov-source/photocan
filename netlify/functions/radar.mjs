// POST /api/radar/escanear  { zona, rubro } → arranca un escaneo (solo equipo de Phot8can).
// La lectura de escaneos y negocios la hace la pantalla directo en Supabase (RLS: solo staff).
import { json } from "../lib/comun.mjs";
import { delEquipo } from "../lib/equipo.mjs";
import { admin } from "../lib/sitios.mjs";

export const config = { path: "/api/radar/escanear" };

export const esStaff = delEquipo;

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
    const { data: e } = await admin().from("radar_escaneos").select("id, estado").eq("id", id).maybeSingle();
    if (!e) return json({ error: "No encontramos ese escaneo." }, 404);
    if (e.estado === "escaneando") return json({ error: "Ese escaneo sigue trabajando." }, 409);
    await fondo({ escaneo_id: id, reintentar: true });
    return json({ escaneo_id: id }, 202);
  }

  const zona = String(d.zona ?? "").trim().slice(0, 120);
  const rubro = String(d.rubro ?? "").trim().slice(0, 80);
  if (!zona || !rubro) return json({ error: "Escribe la zona y el rubro." }, 400);
  if (!process.env.GOOGLE_RADAR_API_KEY) return json({ error: "Falta GOOGLE_RADAR_API_KEY en Netlify." }, 500);

  const { data: esc, error } = await admin().from("radar_escaneos").insert({ zona, rubro, creado_por: u.id }).select("id").single();
  if (error) return json({ error: `No se pudo crear el escaneo: ${error.message}` }, 500);

  await fondo({ escaneo_id: esc.id });
  return json({ escaneo_id: esc.id }, 202);
};
