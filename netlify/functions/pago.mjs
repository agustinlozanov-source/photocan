// POST /api/pago/crear  → { url } de Stripe Checkout con el total exacto.
// Cuerpo: { modo: "unico" | "mensual", ids: [producto_id], codigo?, metodo?, nombre, correo, negocio?, origen? }
// Desde el portal manda el token de sesión: el cobro queda ligado a su organización.
import { json, usuarioDe } from "../lib/comun.mjs";
import { crearCobro } from "../lib/pagos.mjs";
import { admin, miembroDe } from "../lib/sitios.mjs";

export const config = { path: ["/api/pago/crear", "/api/pago/estado"] };

const correoValido = (c) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c);

const manejar = async (req) => {
  // GET /api/pago/estado?sesion=cs_… → estado del pago (el id de sesión no se puede adivinar).
  if (req.method === "GET") {
    const sesion = new URL(req.url).searchParams.get("sesion") ?? "";
    if (!/^cs_[A-Za-z0-9_]+$/.test(sesion)) return json({ error: "Sesión inválida." }, 400);
    const { data } = await admin().from("pagos").select("estado, correo, modo, total_mxn").eq("stripe_sesion_id", sesion).maybeSingle();
    return data ? json({ estado: data.estado, correo: data.correo, modo: data.modo, total: data.total_mxn }) : json({ error: "No encontramos el pago." }, 404);
  }
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  let d;
  try {
    d = await req.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }

  const modo = d.modo === "mensual" ? "mensual" : "unico";
  const ids = [...new Set((Array.isArray(d.ids) ? d.ids : []).map(String))].slice(0, 80);
  if (!ids.length) return json({ error: "Elige al menos un concepto." }, 400);

  // Con sesión del portal, el pago es de su organización y su correo.
  const usuario = req.headers.get("authorization") ? await usuarioDe(req) : null;
  const miembro = usuario ? await miembroDe(usuario.id) : null;
  const correo = String(usuario?.email ?? d.correo ?? "").trim().toLowerCase();
  if (!correoValido(correo)) return json({ error: "Escribe un correo válido: ahí te llega el acceso a tu portal." }, 400);

  try {
    const r = await crearCobro({
      modo,
      ids,
      codigo: d.codigo,
      metodo: d.metodo === "transferencia" ? "transferencia" : "tarjeta",
      nombre: String(d.nombre ?? "").trim().slice(0, 120),
      correo,
      negocio: String(d.negocio ?? "").trim().slice(0, 120),
      organizacionId: miembro?.organizacion_id ?? null,
      origen: d.origen === "portal" ? "portal" : "cotizador",
    });
    if (r.error) return json(r, 400);
    return json(r);
  } catch (e) {
    console.error("No se pudo crear el cobro:", e);
    return json({ error: "No pudimos abrir el pago. Intenta de nuevo o escríbenos por WhatsApp." }, 500);
  }
};

export default manejar;
