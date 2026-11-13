"use client";

// De dónde sale el briefing: de Supabase si hay sesión con organización, o de la
// demostración (navegador) si no. Las pantallas usan useFuenteBriefing() y no
// necesitan saber cuál es.

import { useSyncExternalStore } from "react";
import { avanceBriefing } from "./briefing";
import { guardar as guardarDemo, usePortal, type EstadoPortal } from "./portal-estado";
import { sesionActual, useSesion } from "./sesion";
import { BUCKET_BRIEFING, sb } from "./supabase";

type B = EstadoPortal["briefing"];

type Real = {
  orgId: string | null;
  cargado: boolean;
  b: B;
  ids: Record<string, string[]>; // id de briefing_archivos, en el mismo orden que b.archivos
  subiendo: Record<string, number>;
  error: string | null;
  guardado: "listo" | "guardando" | "error";
  enviadoEn: string | null;
};

const VACIO: B = { modo: null, paso: 0, respuestas: {}, archivos: {}, llamada: null, enviado: false };
let real: Real = { orgId: null, cargado: false, b: VACIO, ids: {}, subiendo: {}, error: null, guardado: "listo", enviadoEn: null };
const oyentes = new Set<() => void>();
const poner = (r: Partial<Real>) => {
  real = { ...real, ...r };
  oyentes.forEach((f) => f());
};
const suscribir = (f: () => void) => {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
};

const tamano = (bytes: number | null) => `${((bytes ?? 0) / 1024 / 1024).toFixed(1)} MB`;

/** Lee el briefing y sus archivos de la organización. */
export async function cargarBriefing(orgId: string) {
  if (real.orgId === orgId && real.cargado) return;
  poner({ orgId, cargado: false, error: null });
  const cliente = sb();
  const [{ data: fila, error }, { data: archivos }] = await Promise.all([
    cliente.from("briefings").select("modo, respuestas, llamada, enviado_en").eq("organizacion_id", orgId).maybeSingle(),
    cliente.from("briefing_archivos").select("id, pregunta, nombre, tamano_bytes").eq("organizacion_id", orgId).order("creado"),
  ]);
  if (error) {
    poner({ cargado: true, error: "No pudimos leer tu briefing. Recarga la página." });
    return;
  }
  const porPregunta: Record<string, string[]> = {};
  const ids: Record<string, string[]> = {};
  for (const a of archivos ?? []) {
    (porPregunta[a.pregunta] ??= []).push(`${a.nombre} · ${tamano(a.tamano_bytes)}`);
    (ids[a.pregunta] ??= []).push(a.id);
  }
  poner({
    cargado: true,
    ids,
    enviadoEn: (fila?.enviado_en as string | null) ?? null,
    b: {
      modo: (fila?.modo as B["modo"]) ?? null,
      paso: 0,
      respuestas: (fila?.respuestas as B["respuestas"]) ?? {},
      archivos: porPregunta,
      llamada: (fila?.llamada as B["llamada"]) ?? null,
      enviado: Boolean(fila?.enviado_en),
    },
  });
}

let temporizador: ReturnType<typeof setTimeout> | null = null;
let ultimoGuardado = "";

function programarGuardado() {
  if (temporizador) clearTimeout(temporizador);
  poner({ guardado: "guardando" });
  temporizador = setTimeout(async () => {
    const { orgId, b } = real;
    if (!orgId) return;
    const cuerpo = {
      organizacion_id: orgId,
      modo: b.modo,
      respuestas: b.respuestas,
      llamada: b.llamada,
      avance: avanceBriefing(b.respuestas, b.archivos),
      enviado_en: b.enviado ? (real.enviadoEn ?? new Date().toISOString()) : null,
    };
    const huella = JSON.stringify(cuerpo);
    if (huella === ultimoGuardado) return poner({ guardado: "listo" });
    const { data: u } = await sb().auth.getUser();
    const { error } = await sb()
      .from("briefings")
      .upsert({ ...cuerpo, actualizado_por: u.user?.id ?? null }, { onConflict: "organizacion_id" });
    if (error) return poner({ guardado: "error" });
    ultimoGuardado = huella;
    poner({ guardado: "listo", enviadoEn: cuerpo.enviado_en });
  }, 700);
}

function setReal(fn: (b: B) => B) {
  const antes = real.b;
  const despues = fn(antes);
  poner({ b: despues });
  // Cambiar de paso no se guarda en la base.
  const sinPaso = (b: B) => JSON.stringify({ ...b, paso: 0 });
  if (sinPaso(antes) !== sinPaso(despues)) programarGuardado();
}

const limpiarNombre = (n: string) =>
  n
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(-80);

async function subirReal(clave: string, archivos: File[]) {
  const { orgId } = real;
  if (!orgId) return;
  const { data: u } = await sb().auth.getUser();
  for (const f of archivos) {
    poner({ subiendo: { ...real.subiendo, [clave]: (real.subiendo[clave] ?? 0) + 1 }, error: null });
    const ruta = `${orgId}/${clave}/${Date.now()}-${limpiarNombre(f.name)}`;
    const { error: e1 } = await sb().storage.from(BUCKET_BRIEFING).upload(ruta, f, { contentType: f.type || undefined, upsert: false });
    let id: string | null = null;
    if (!e1) {
      const { data, error: e2 } = await sb()
        .from("briefing_archivos")
        .insert({ organizacion_id: orgId, pregunta: clave, ruta, nombre: f.name, tamano_bytes: f.size, tipo_mime: f.type || null, subido_por: u.user?.id })
        .select("id")
        .single();
      if (!e2) id = data.id;
    }
    const sub = { ...real.subiendo, [clave]: Math.max(0, (real.subiendo[clave] ?? 1) - 1) };
    if (!id) {
      poner({ subiendo: sub, error: f.size > 50 * 1024 * 1024 ? `${f.name} pesa más de 50 MB.` : `No se pudo subir ${f.name}. Intenta de nuevo.` });
      continue;
    }
    poner({
      subiendo: sub,
      ids: { ...real.ids, [clave]: [...(real.ids[clave] ?? []), id] },
      b: { ...real.b, archivos: { ...real.b.archivos, [clave]: [...(real.b.archivos[clave] ?? []), `${f.name} · ${tamano(f.size)}`] } },
    });
  }
  programarGuardado(); // actualiza el avance
}

async function quitarReal(clave: string, i: number) {
  const id = real.ids[clave]?.[i];
  if (!id) return;
  const { data } = await sb().from("briefing_archivos").select("ruta").eq("id", id).single();
  const { error } = await sb().from("briefing_archivos").delete().eq("id", id);
  if (error) return poner({ error: "No se pudo quitar el archivo." });
  if (data?.ruta) await sb().storage.from(BUCKET_BRIEFING).remove([data.ruta]);
  poner({
    ids: { ...real.ids, [clave]: real.ids[clave].filter((_, j) => j !== i) },
    b: { ...real.b, archivos: { ...real.b.archivos, [clave]: real.b.archivos[clave].filter((_, j) => j !== i) } },
  });
  programarGuardado();
}

const setDemo = (fn: (b: B) => B) => guardarDemo((s) => ({ ...s, briefing: fn(s.briefing) }));

/** Cambia el briefing en la fuente que corresponda (para usar fuera de los hooks). */
export function setBriefing(fn: (b: B) => B) {
  if (sesionActual().estado === "fuera") setDemo(fn);
  else if (real.cargado) setReal(fn);
}

export type FuenteBriefing = {
  modo: "cargando" | "real" | "demo" | "sin-organizacion";
  b: B;
  setB: (fn: (b: B) => B) => void;
  subir: (clave: string, archivos: File[]) => void;
  quitar: (clave: string, i: number) => void;
  subiendo: Record<string, number>;
  error: string | null;
  guardado: Real["guardado"];
  orgId: string | null;
};

export function useFuenteBriefing(): FuenteBriefing {
  const sesion = useSesion();
  const demo = usePortal();
  const r = useSyncExternalStore(suscribir, () => real, () => real);

  if (sesion.estado === "fuera")
    return {
      modo: "demo",
      b: demo.briefing,
      setB: setDemo,
      subir: (clave, archivos) =>
        setDemo((b) => ({
          ...b,
          archivos: { ...b.archivos, [clave]: [...(b.archivos[clave] ?? []), ...archivos.map((f) => `${f.name} · ${tamano(f.size)}`)] },
        })),
      quitar: (clave, i) => setDemo((b) => ({ ...b, archivos: { ...b.archivos, [clave]: b.archivos[clave].filter((_, j) => j !== i) } })),
      subiendo: {},
      error: null,
      guardado: "listo",
      orgId: null,
    };

  const base = { setB: setReal, subir: subirReal, quitar: quitarReal, subiendo: r.subiendo, error: r.error, guardado: r.guardado };
  if (sesion.estado === "dentro" && !sesion.org) return { ...base, modo: "sin-organizacion", b: VACIO, orgId: null };
  if (sesion.estado === "dentro" && sesion.org && r.orgId === sesion.org.id && r.cargado)
    return { ...base, modo: "real", b: r.b, orgId: r.orgId };
  return { ...base, modo: "cargando", b: VACIO, orgId: sesion.estado === "dentro" ? (sesion.org?.id ?? null) : null };
}
