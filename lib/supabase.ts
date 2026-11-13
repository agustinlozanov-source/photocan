"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// La URL y la llave publicable son públicas por diseño: lo que protege los datos son
// las reglas por fila (RLS) de la base. La llave secreta nunca va en el navegador.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://udeegsqqmnjbdridlhrh.supabase.co";
const LLAVE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_3t97mAi7bfbO16mmr3Gl-g_G4hDuHp7";

let cliente: SupabaseClient | null = null;

/** Cliente de Supabase del navegador (se crea al primer uso). */
export function sb() {
  if (!cliente) {
    cliente = createClient(URL, LLAVE, {
      // "implicit": el enlace del correo abre la sesión aunque se abra en otro navegador o dispositivo.
      auth: { flowType: "implicit", detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
    });
  }
  return cliente;
}

export const BUCKET_BRIEFING = "briefing";
