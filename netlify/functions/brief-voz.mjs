// Modo voz: crea una llave temporal (10 min, una sola sesión) para que el navegador
// hable directo con la API Realtime por WebRTC sin conocer la llave real.
// POST /api/brief/voz  { contexto, conocidos, pendientes }
import { MODELOS, instrucciones, json, llaveOpenAI, usuarioDe } from "../lib/comun.mjs";

export const config = { path: "/api/brief/voz" };

const manejar = async (req) => {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const usuario = await usuarioDe(req);
  if (!usuario) return json({ error: "Inicia sesión para usar el modo voz." }, 401);

  let datos = {};
  try {
    datos = await req.json();
  } catch {}

  try {
    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${llaveOpenAI()}`,
        "Content-Type": "application/json",
        "OpenAI-Safety-Identifier": usuario.id,
      },
      body: JSON.stringify({
        expires_after: { anchor: "created_at", seconds: 600 },
        session: {
          type: "realtime",
          model: MODELOS.voz,
          instructions: instrucciones({
            contexto: String(datos.contexto ?? "").slice(0, 4000),
            conocidos: String(datos.conocidos ?? "").slice(0, 4000),
            pendientes: String(datos.pendientes ?? "").slice(0, 4000),
            modoVoz: true,
          }),
          audio: {
            input: {
              transcription: { model: MODELOS.transcribir, language: "es" },
              turn_detection: { type: "semantic_vad" },
            },
            output: { voice: "marin" },
          },
        },
      }),
    });
    const d = await r.json();
    if (!r.ok) {
      console.error("OpenAI respondió", r.status, JSON.stringify(d.error ?? d));
      return json({ error: "El modo voz no está disponible ahora." }, 502);
    }
    return json({ llave: d.value, modelo: MODELOS.voz, vence: d.expires_at });
  } catch (e) {
    console.error("Error al crear la sesión de voz:", e);
    return json({ error: "El modo voz no está disponible ahora." }, 502);
  }
};

export default manejar;
