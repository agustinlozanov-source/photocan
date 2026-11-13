"use client";

// Conexión del brief con el asistente (funciones de Netlify → OpenAI) y modo voz.

import { camposAplicables, contextoClics, faltantes, type MensajeChat, type Respuestas } from "./briefing";
import { sb } from "./supabase";

async function token() {
  const { data } = await sb().auth.getSession();
  return data.session?.access_token ?? null;
}

const conocidosDe = (r: Respuestas) =>
  Object.fromEntries(camposAplicables(r).map((c) => [c.id, typeof r[c.id] === "string" ? (r[c.id] as string) : ""]).filter(([, v]) => v));

export async function preguntarAsistente(r: Respuestas, mensajes: MensajeChat[]) {
  const t = await token();
  if (!t) throw new Error("sin sesión");
  const res = await fetch("/api/brief/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
    body: JSON.stringify({
      mensajes: mensajes.map(({ de, texto, adjuntos }) => ({ de, texto, adjuntos })),
      campos: camposAplicables(r).map(({ id, etiqueta, obligatorio }) => ({ id, etiqueta, obligatorio: Boolean(obligatorio) })),
      conocidos: conocidosDe(r),
      contexto: contextoClics(r),
    }),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error ?? "El asistente no respondió.");
  return d as { mensaje: string; campos: Record<string, string>; nota: string };
}

export async function transcribir(audio: Blob) {
  const t = await token();
  if (!t) throw new Error("Entra con tu correo para mandar notas de voz.");
  const res = await fetch("/api/brief/transcribir", {
    method: "POST",
    headers: { "Content-Type": audio.type || "audio/webm", Authorization: `Bearer ${t}` },
    body: audio,
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error ?? "No pudimos convertir tu nota a texto.");
  return String(d.texto ?? "");
}

/** Respuesta local cuando no hay asistente (demostración o falla): pide el siguiente dato. */
export function respuestaLocal(r: Respuestas) {
  const siguiente = faltantes(r)[0];
  return siguiente
    ? `Gracias, lo anoté. ${siguiente.pregunta}`
    : "¡Gracias! Ya tengo lo necesario. Puedes tocar “Enviar mi brief” o seguir contándome lo que quieras.";
}

/* ---------------- Modo voz (Realtime por WebRTC) ---------------- */

export type SesionVoz = { colgar: () => void };

export async function iniciarVoz(
  r: Respuestas,
  eventos: {
    alHablarCliente: (texto: string) => void;
    alHablarAsistente: (texto: string) => void;
    alCambiarEstado: (e: "conectando" | "escuchando" | "hablando" | "error", detalle?: string) => void;
  },
): Promise<SesionVoz> {
  const t = await token();
  if (!t) throw new Error("Entra con tu correo para usar el modo voz.");
  eventos.alCambiarEstado("conectando");

  const pendientes = camposAplicables(r)
    .filter((c) => !r[c.id])
    .map((c) => `- ${c.etiqueta}${c.obligatorio ? " *" : ""}`)
    .join("\n");
  const conocidos = Object.entries(conocidosDe(r))
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const res = await fetch("/api/brief/voz", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
    body: JSON.stringify({ contexto: contextoClics(r), conocidos, pendientes }),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || !d.llave) throw new Error(d.error ?? "El modo voz no está disponible.");

  const pc = new RTCPeerConnection();
  const bocina = document.createElement("audio");
  bocina.autoplay = true;
  pc.ontrack = (e) => {
    bocina.srcObject = e.streams[0];
  };
  const micro = await navigator.mediaDevices.getUserMedia({ audio: true });
  micro.getTracks().forEach((pista) => pc.addTrack(pista, micro));

  const dc = pc.createDataChannel("oai-events");
  dc.onopen = () => {
    eventos.alCambiarEstado("hablando");
    dc.send(JSON.stringify({ type: "response.create" })); // que salude y haga la primera pregunta
  };
  dc.onmessage = (m) => {
    let ev: { type?: string; transcript?: string; response?: { output?: { content?: { transcript?: string; text?: string }[] }[] }; error?: { message?: string } };
    try {
      ev = JSON.parse(m.data);
    } catch {
      return;
    }
    if (ev.type === "conversation.item.input_audio_transcription.completed" && ev.transcript?.trim()) eventos.alHablarCliente(ev.transcript.trim());
    if (ev.type === "input_audio_buffer.speech_started") eventos.alCambiarEstado("escuchando");
    if (ev.type === "response.created") eventos.alCambiarEstado("hablando");
    if (ev.type === "response.done") {
      const texto = (ev.response?.output ?? [])
        .flatMap((o) => o.content ?? [])
        .map((c) => c.transcript ?? c.text ?? "")
        .join(" ")
        .trim();
      if (texto) eventos.alHablarAsistente(texto);
      eventos.alCambiarEstado("escuchando");
    }
    if (ev.type === "error") eventos.alCambiarEstado("error", ev.error?.message);
  };

  const oferta = await pc.createOffer();
  await pc.setLocalDescription(oferta);
  const sdp = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    body: oferta.sdp,
    headers: { Authorization: `Bearer ${d.llave}`, "Content-Type": "application/sdp" },
  });
  if (!sdp.ok) {
    micro.getTracks().forEach((p) => p.stop());
    pc.close();
    throw new Error("No se pudo conectar la llamada.");
  }
  await pc.setRemoteDescription({ type: "answer", sdp: await sdp.text() });

  return {
    colgar: () => {
      try {
        dc.close();
      } catch {}
      micro.getTracks().forEach((p) => p.stop());
      pc.close();
      bocina.srcObject = null;
    },
  };
}
