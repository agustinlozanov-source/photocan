// ¿Quien llama es del equipo de Phot8can? Por correo (tabla equipo) o por la marca del perfil.
import { usuarioDe } from "./comun.mjs";
import { admin } from "./sitios.mjs";

export async function delEquipo(req) {
  const u = await usuarioDe(req);
  if (!u) return null;
  const correo = String(u.email ?? "").toLowerCase();
  const [{ data: e }, { data: p }] = await Promise.all([
    admin().from("equipo").select("rol").eq("correo", correo).maybeSingle(),
    admin().from("perfiles").select("es_staff").eq("id", u.id).maybeSingle(),
  ]);
  const rol = e?.rol ?? (p?.es_staff ? "equipo" : null);
  return rol ? { ...u, rol } : null;
}
