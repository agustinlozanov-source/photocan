"use client";

// Sitio del cliente en el portal: estado de la construcción, vista previa y publicación.

import { useEffect, useState } from "react";
import { sb } from "./supabase";

export type SitioCliente = {
  estado: "preparando" | "construyendo" | "revision" | "publicando" | "en_linea" | "error";
  detalle: string | null;
  vista_previa_url: string | null;
  produccion_url: string | null;
  netlify_url: string | null;
  repo: string | null;
  pr_numero: number | null;
  resumen_agente: string | null;
  costo_centavos_usd: number | null;
  actualizado: string;
};

async function llamar(accion: "iniciar" | "estado" | "ajustar" | "aprobar", cuerpo?: object) {
  const { data } = await sb().auth.getSession();
  const t = data.session?.access_token;
  if (!t) throw new Error("Inicia sesión.");
  const r = await fetch(`/api/sitio/${accion}`, {
    method: accion === "estado" ? "GET" : "POST",
    headers: { Authorization: `Bearer ${t}`, ...(cuerpo ? { "Content-Type": "application/json" } : {}) },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error ?? "Algo falló. Intenta de nuevo.");
  return (d.sitio ?? null) as SitioCliente | null;
}

export const iniciarSitio = () => llamar("iniciar");
export const pedirAjustes = (mensaje: string) => llamar("ajustar", { mensaje });
export const aprobarSitio = () => llamar("aprobar");

const EN_CURSO = new Set(["preparando", "construyendo", "publicando"]);

/** Lee el estado del sitio y lo vuelve a consultar mientras algo está en curso. */
export function useSitio(activo: boolean) {
  const [sitio, setSitio] = useState<SitioCliente | null>(null);
  const [cargado, setCargado] = useState(false);
  const [vuelta, setVuelta] = useState(0);

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    let espera: ReturnType<typeof setTimeout>;
    const consultar = async () => {
      try {
        const s = await llamar("estado");
        if (!vivo) return;
        setSitio(s);
        setCargado(true);
        const pendienteVista = s?.estado === "revision" && !s.vista_previa_url;
        if (s && (EN_CURSO.has(s.estado) || pendienteVista)) espera = setTimeout(consultar, 15000);
      } catch {
        if (vivo) {
          setCargado(true);
          espera = setTimeout(consultar, 30000);
        }
      }
    };
    consultar();
    return () => {
      vivo = false;
      clearTimeout(espera);
    };
  }, [activo, vuelta]);

  return { sitio, cargado, setSitio, refrescar: () => setVuelta((v) => v + 1) };
}
