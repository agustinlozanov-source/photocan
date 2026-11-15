// POST /api/radar/escanear  { zona, rubro } → arranca un escaneo (solo equipo de Phot8can).
// La lectura de escaneos y negocios la hace la pantalla directo en Supabase (RLS: solo staff).
import { json, usuarioDe } from "../lib/comun.mjs";
import { admin } from "../lib/sitios.mjs";

export const config = { path: "/api/radar/escanear" };

export async function esStaff(req) {
  const u = await usuarioDe(req);
  if (!u) return null;
  const { data } = await admin().from("perfiles").select("es_staff").eq("id", u.id).maybeSingle();
  return data?.es_staff ? u : null;
}

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
  const zona = String(d.zona ?? "").trim().slice(0, 120);
  const rubro = String(d.rubro ?? "").trim().slice(0, 80);
  if (!zona || !rubro) return json({ error: "Escribe la zona y el rubro." }, 400);
  if (!process.env.GOOGLE_RADAR_API_KEY) return json({ error: "Falta GOOGLE_RADAR_API_KEY en Netlify." }, 500);

  const { data: esc, error } = await admin().from("radar_escaneos").insert({ zona, rubro, creado_por: u.id }).select("id").single();
  if (error) return json({ error: `No se pudo crear el escaneo: ${error.message}` }, 500);

  const base = process.env.URL ?? new URL(req.url).origin;
  await fetch(`${base}/.netlify/functions/radar-escanear-background`, {
    method: "POST",
    headers: { Authorization: req.headers.get("authorization"), "Content-Type": "application/json" },
    body: JSON.stringify({ escaneo_id: esc.id }),
  });
  return json({ escaneo_id: esc.id }, 202);
};
