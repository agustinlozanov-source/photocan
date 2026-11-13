"use client";

// Sesión real del portal (Supabase Auth con enlace mágico). Si no hay sesión, el
// portal muestra la demostración con datos de ejemplo.

import { useSyncExternalStore } from "react";
import { sb } from "./supabase";

export type Organizacion = { id: string; nombre: string; dominio: string | null; fase: "briefing" | "diseno" | "revision" | "en_linea" };
export type ContratadoReal = { id: string; nombre: string; estado: "pendiente_pago" | "preparacion" | "activo" | "cancelado"; precio_mxn: number | null; cobro: string };

export type Sesion =
  | { estado: "cargando" }
  | { estado: "fuera" }
  | {
      estado: "dentro";
      usuario: { id: string; correo: string };
      nombre: string;
      org: Organizacion | null;
      rol: "dueno" | "editor" | "soporte" | null;
      contratados: ContratadoReal[];
    };

const CARGANDO: Sesion = { estado: "cargando" };
let actual: Sesion = CARGANDO;
let iniciado = false;
const oyentes = new Set<() => void>();
const emitir = (s: Sesion) => {
  actual = s;
  oyentes.forEach((f) => f());
};

async function cargar(usuarioId: string, correo: string) {
  const cliente = sb();
  const [{ data: perfil }, { data: miembro }] = await Promise.all([
    cliente.from("perfiles").select("nombre").eq("id", usuarioId).maybeSingle(),
    cliente
      .from("miembros")
      .select("rol, organizaciones(id, nombre, dominio, fase)")
      .eq("usuario_id", usuarioId)
      .order("creado")
      .limit(1)
      .maybeSingle(),
  ]);
  const org = (miembro?.organizaciones as unknown as Organizacion | null) ?? null;
  let contratados: ContratadoReal[] = [];
  if (org) {
    const { data } = await cliente
      .from("contratados")
      .select("id, nombre, estado, precio_mxn, cobro")
      .eq("organizacion_id", org.id)
      .neq("estado", "cancelado")
      .order("creado");
    contratados = (data as ContratadoReal[]) ?? [];
  }
  emitir({
    estado: "dentro",
    usuario: { id: usuarioId, correo },
    nombre: perfil?.nombre || correo.split("@")[0],
    org,
    rol: (miembro?.rol as "dueno" | "editor" | "soporte" | undefined) ?? null,
    contratados,
  });
}

function iniciar() {
  if (iniciado) return;
  iniciado = true;
  const cliente = sb();
  cliente.auth.onAuthStateChange((evento, sesion) => {
    if (!sesion) {
      emitir({ estado: "fuera" });
      return;
    }
    if (evento === "INITIAL_SESSION" || evento === "SIGNED_IN" || evento === "USER_UPDATED") {
      // Fuera del callback para no bloquear al cliente de auth.
      setTimeout(() => cargar(sesion.user.id, sesion.user.email ?? ""), 0);
    }
  });
}

function suscribir(fn: () => void) {
  oyentes.add(fn);
  iniciar();
  return () => {
    oyentes.delete(fn);
  };
}

/** Estado actual de la sesión, fuera de React. */
export const sesionActual = () => actual;

export function useSesion() {
  return useSyncExternalStore(
    suscribir,
    () => actual,
    () => CARGANDO,
  );
}

/** Vuelve a leer organización y contratados (p. ej. después de crear la organización). */
export async function recargarSesion() {
  const { data } = await sb().auth.getUser();
  if (data.user) await cargar(data.user.id, data.user.email ?? "");
}

export async function salir() {
  await sb().auth.signOut();
}

export async function pedirEnlace(correo: string) {
  const { error } = await sb().auth.signInWithOtp({
    email: correo,
    options: { emailRedirectTo: `${window.location.origin}/portal/`, shouldCreateUser: true },
  });
  if (!error) return null;
  if (error.status === 429 || /rate limit/i.test(error.message))
    return "Ya se mandaron varios enlaces en poco tiempo. Revisa tu correo (y spam) o vuelve a intentarlo en un rato.";
  if (/invalid/i.test(error.message)) return "Revisa que tu correo esté bien escrito.";
  return "No pudimos mandar el enlace. Intenta de nuevo en un momento.";
}

/** Entra con el código de 8 dígitos que llega en el correo. */
export async function entrarConCodigo(correo: string, codigo: string) {
  const { error } = await sb().auth.verifyOtp({ email: correo, token: codigo.replace(/\s/g, ""), type: "email" });
  if (!error) return null;
  if (/expired|invalid/i.test(error.message)) return "El código no es válido o ya venció. Pide uno nuevo.";
  return "No pudimos entrar con ese código. Intenta de nuevo.";
}

export async function crearOrganizacion(nombre: string) {
  const { error } = await sb().rpc("crear_mi_organizacion", { nombre });
  if (error) return error.message;
  await recargarSesion();
  return null;
}
