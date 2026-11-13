// Nota de voz → texto. POST /api/brief/transcribir con el audio en el cuerpo.
import { MODELOS, json, llaveOpenAI, usuarioDe } from "../lib/comun.mjs";

export const config = { path: "/api/brief/transcribir" };

const MAX_BYTES = 5 * 1024 * 1024; // límite de Netlify Functions ~6 MB

const manejar = async (req) => {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const usuario = await usuarioDe(req);
  if (!usuario) return json({ error: "Inicia sesión para mandar notas de voz." }, 401);

  const tipo = req.headers.get("content-type") || "audio/webm";
  const audio = await req.arrayBuffer();
  if (!audio.byteLength) return json({ error: "No llegó audio." }, 400);
  if (audio.byteLength > MAX_BYTES) return json({ error: "La nota es muy larga. Intenta con una más corta." }, 413);

  const extension = tipo.includes("mp4") ? "mp4" : tipo.includes("ogg") ? "ogg" : tipo.includes("wav") ? "wav" : "webm";
  const form = new FormData();
  form.append("file", new Blob([audio], { type: tipo }), `nota.${extension}`);
  form.append("model", MODELOS.transcribir);
  form.append("language", "es");

  try {
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${llaveOpenAI()}` },
      body: form,
    });
    const d = await r.json();
    if (!r.ok) {
      console.error("OpenAI respondió", r.status, JSON.stringify(d.error ?? d));
      return json({ error: "No pudimos convertir tu nota a texto." }, 502);
    }
    return json({ texto: d.text ?? "" });
  } catch (e) {
    console.error("Error al transcribir:", e);
    return json({ error: "No pudimos convertir tu nota a texto." }, 502);
  }
};

export default manejar;
