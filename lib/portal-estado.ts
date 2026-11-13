"use client";

// Estado de la DEMO del portal. Vive en el navegador (localStorage) para que se pueda
// recorrer el portal completo sin backend. Al conectar Supabase, este archivo se
// reemplaza por consultas a la base de datos de la organización del cliente.

import { useSyncExternalStore } from "react";
import type { BaseId, PlanId } from "./portal";

export type EstadoContrato = "preparacion" | "activo";

export type Contratado = {
  id: string;
  nombre: string;
  tipo: "plan" | "base" | "complemento" | "dominio" | "hospedaje";
  estado: EstadoContrato;
  /** Precio mensual, único o null si está por definir. */
  precio: number | null;
  cobro: "mensual" | "unico" | "anual";
  fecha: string;
};

export type EstadoPortal = {
  fase: "nuevo" | "enlinea";
  plan: PlanId | null;
  base: BaseId | null;
  uso: { simple: number; mediano: number; complejo: number };
  contratados: Contratado[];
  briefing: {
    modo: "yo" | "asistido" | null;
    paso: number;
    respuestas: Record<string, string | string[]>;
    archivos: Record<string, string[]>;
    llamada: { dia: string; horario: string; telefono: string } | null;
    enviado: boolean;
  };
};

export const inicial: EstadoPortal = {
  fase: "enlinea",
  plan: "basico",
  base: "inicial",
  uso: { simple: 3, mediano: 0, complejo: 0 },
  contratados: [
    { id: "hospedaje", nombre: "Hospedaje Página Viva", tipo: "hospedaje", estado: "activo", precio: null, cobro: "mensual", fecha: "15 sep 2026" },
    { id: "dominio-clinicasonrisa.mx", nombre: "clinicasonrisa.mx", tipo: "dominio", estado: "activo", precio: 780, cobro: "anual", fecha: "15 sep 2026" },
    { id: "plan-basico", nombre: "Plan de cambios Básico", tipo: "plan", estado: "activo", precio: 390, cobro: "mensual", fecha: "01 oct 2026" },
    { id: "base-inicial", nombre: "Base de datos Inicial", tipo: "base", estado: "activo", precio: 290, cobro: "mensual", fecha: "01 oct 2026" },
    { id: "modulo-citas", nombre: "Citas en línea", tipo: "complemento", estado: "preparacion", precio: null, cobro: "unico", fecha: "11 nov 2026" },
  ],
  briefing: { modo: null, paso: 0, respuestas: {}, archivos: {}, llamada: null, enviado: false },
};

const CLAVE = "phot8can-portal-demo-v1";
const oyentes = new Set<() => void>();
let cache: EstadoPortal | null = null;

function cargar(): EstadoPortal {
  try {
    const s = localStorage.getItem(CLAVE);
    if (s) {
      const d = JSON.parse(s);
      return { ...inicial, ...d, briefing: { ...inicial.briefing, ...d.briefing } };
    }
  } catch {}
  return inicial;
}

function leer(): EstadoPortal {
  if (!cache) cache = cargar();
  return cache;
}

function suscribir(fn: () => void) {
  oyentes.add(fn);
  const alCambiarOtraPestana = (e: StorageEvent) => {
    if (e.key === CLAVE) {
      cache = cargar();
      fn();
    }
  };
  window.addEventListener("storage", alCambiarOtraPestana);
  return () => {
    oyentes.delete(fn);
    window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

export function guardar(cambio: (e: EstadoPortal) => EstadoPortal) {
  cache = cambio(leer());
  try {
    localStorage.setItem(CLAVE, JSON.stringify(cache));
  } catch {}
  oyentes.forEach((fn) => fn());
}

export function reiniciarDemo(fase: EstadoPortal["fase"] = "enlinea") {
  guardar(() =>
    fase === "nuevo"
      ? { ...inicial, fase: "nuevo", plan: null, base: null, uso: { simple: 0, mediano: 0, complejo: 0 }, contratados: inicial.contratados.slice(0, 2) }
      : inicial,
  );
}

export function usePortal() {
  return useSyncExternalStore(suscribir, leer, () => inicial);
}

const sinSuscripcion = () => () => {};

/** Lee un parámetro de la URL sin romper el prerender estático. */
export function useParametro(nombre: string) {
  return useSyncExternalStore(
    sinSuscripcion,
    () => new URLSearchParams(window.location.search).get(nombre),
    () => null,
  );
}

export const hoy = () => new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
