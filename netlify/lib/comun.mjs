// Utilidades compartidas por las funciones del brief.
//
// Variables de entorno (Netlify → Site configuration → Environment variables):
//   OPENAI_API_KEY          obligatoria. Nunca se manda al navegador.
//   OPENAI_MODELO_CHAT      opcional (por defecto gpt-6.1-terra)
//   OPENAI_MODELO_VOZ       opcional (por defecto gpt-realtime-2.1)
//   OPENAI_MODELO_TRANSCRIBIR opcional (por defecto gpt-transcribe)

export const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://udeegsqqmnjbdridlhrh.supabase.co";
const SUPABASE_LLAVE = process.env.SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_3t97mAi7bfbO16mmr3Gl-g_G4hDuHp7";

export const MODELOS = {
  chat: process.env.OPENAI_MODELO_CHAT ?? "gpt-6.1-terra",
  voz: process.env.OPENAI_MODELO_VOZ ?? "gpt-realtime-2.1",
  transcribir: process.env.OPENAI_MODELO_TRANSCRIBIR ?? "gpt-transcribe",
};

export const json = (cuerpo, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

/** Solo usuarios con sesión del portal pueden gastar la llave de OpenAI. */
export async function usuarioDe(req) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_LLAVE, Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  const u = await r.json();
  return u?.id ? u : null;
}

export function llaveOpenAI() {
  const k = process.env.OPENAI_API_KEY;
  if (!k) throw new Error("Falta OPENAI_API_KEY en las variables de entorno de Netlify.");
  return k;
}

/** Instrucciones del entrevistador (chat y voz usan las mismas). */
export function instrucciones({ contexto, conocidos, pendientes, modoVoz = false }) {
  return `Eres el asistente de Phot8can, una agencia creativa en México. Estás entrevistando a un cliente para crear su página web (Página Viva).
Habla en español de México, cálido, claro y breve. Tutea al cliente.
${modoVoz ? "Estás en una llamada de voz: frases cortas y naturales, una pregunta a la vez." : "Responde en 1 a 3 frases cortas, sin listas ni formato."}

Lo que el cliente ya eligió con clics:
${contexto || "(nada todavía)"}

Datos que ya tenemos:
${conocidos || "(ninguno)"}

Datos que faltan, en orden (los marcados con * son necesarios):
${pendientes || "(ninguno: ya tenemos lo necesario)"}

Cómo entrevistar:
- Haz UNA pregunta a la vez, empezando por el primer dato que falte. Si el cliente da varios datos juntos, tómalos todos.
- Deja que el cliente se exprese: si cuenta algo útil que no está en la lista (historia, diferenciadores, clientes, promociones), agradécelo y guárdalo como nota.
- Si el cliente manda archivos, confirma que los recibiste.
- No inventes datos. Si algo no queda claro, pregunta de nuevo con otras palabras.
- No prometas precios, fechas ni funciones; di que el equipo de Phot8can lo confirma.
- Si comparte una página de referencia, pregunta qué le gusta de ella. Aclara con naturalidad que tomamos su estilo (estructura, colores, sensación) pero con los textos, fotos y marca de su negocio.
- Cuando ya no falten datos necesarios, dile que puede tocar "Enviar mi brief" o seguir contando lo que quiera.`;
}
