// Chat del brief: responde como entrevistador y extrae los datos de lo que dice el cliente.
// POST /api/brief/chat  { mensajes, campos: [{id, etiqueta, obligatorio}], conocidos, contexto }
import { MODELOS, instrucciones, json, llaveOpenAI, usuarioDe } from "../lib/comun.mjs";

export const config = { path: "/api/brief/chat" };

const MAX_MENSAJES = 60;

const manejar = async (req) => {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const usuario = await usuarioDe(req);
  if (!usuario) return json({ error: "Inicia sesión para usar el asistente." }, 401);

  let datos;
  try {
    datos = await req.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }
  const mensajes = Array.isArray(datos.mensajes) ? datos.mensajes.slice(-MAX_MENSAJES) : [];
  const campos = Array.isArray(datos.campos) ? datos.campos.slice(0, 40) : [];
  const conocidos = datos.conocidos && typeof datos.conocidos === "object" ? datos.conocidos : {};
  const ids = campos.map((c) => String(c.id));

  const pendientes = campos
    .filter((c) => !conocidos[c.id])
    .map((c) => `- ${c.etiqueta}${c.obligatorio ? " *" : ""} (id: ${c.id})`)
    .join("\n");
  const conocidosTexto = Object.entries(conocidos)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const esquema = {
    type: "object",
    additionalProperties: false,
    required: ["mensaje", "campos", "nota"],
    properties: {
      mensaje: { type: "string", description: "Lo que le respondes al cliente." },
      campos: {
        type: "object",
        additionalProperties: false,
        required: ids,
        properties: Object.fromEntries(ids.map((id) => [id, { type: "string", description: "Valor dicho por el cliente; cadena vacía si no lo dijo." }])),
      },
      nota: { type: "string", description: "Información útil extra que dio el cliente en su último mensaje; vacía si no hay." },
    },
  };

  const entrada = [
    { role: "system", content: instrucciones({ contexto: String(datos.contexto ?? ""), conocidos: conocidosTexto, pendientes }) },
    ...mensajes.map((m) => ({
      role: m.de === "cliente" ? "user" : "assistant",
      content: `${String(m.texto ?? "").slice(0, 4000)}${m.adjuntos?.length ? `\n[Adjuntó: ${m.adjuntos.join(", ")}]` : ""}`,
    })),
  ];

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${llaveOpenAI()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODELOS.chat,
        input: entrada,
        safety_identifier: usuario.id,
        text: { format: { type: "json_schema", name: "brief", strict: true, schema: esquema } },
      }),
    });
    const d = await r.json();
    if (!r.ok) {
      console.error("OpenAI respondió", r.status, JSON.stringify(d.error ?? d));
      return json({ error: "El asistente no está disponible. Intenta en un momento." }, 502);
    }
    const partes = (d.output ?? []).filter((i) => i.type === "message").flatMap((i) => i.content ?? []);
    const texto = d.output_text ?? partes.filter((c) => c.type === "output_text").map((c) => c.text).join("");
    const salida = JSON.parse(texto);
    const extraidos = Object.fromEntries(Object.entries(salida.campos ?? {}).filter(([k, v]) => ids.includes(k) && typeof v === "string" && v.trim()));
    return json({ mensaje: salida.mensaje, campos: extraidos, nota: salida.nota ?? "" });
  } catch (e) {
    console.error("Error del chat del brief:", e);
    return json({ error: "El asistente no está disponible. Intenta en un momento." }, 502);
  }
};

export default manejar;
