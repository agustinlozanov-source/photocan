"use client";

import { useState } from "react";
import { aprobarSitio, iniciarSitio, pedirAjustes, type SitioCliente } from "@/lib/sitio-cliente";
import { IconoPortal } from "./Iconos";
import { BotonPortal, Tarjeta } from "./Piezas";

const PASOS: { estado: SitioCliente["estado"]; texto: string }[] = [
  { estado: "preparando", texto: "Preparando" },
  { estado: "construyendo", texto: "Diseñando" },
  { estado: "revision", texto: "En revisión" },
  { estado: "en_linea", texto: "En línea" },
];

/** Avance de la página del cliente: el agente diseñando, la vista previa y la publicación. */
export function TarjetaSitio({
  sitio,
  setSitio,
  esDueno,
  briefEnviado,
}: {
  sitio: SitioCliente | null;
  setSitio: (s: SitioCliente | null) => void;
  esDueno: boolean;
  briefEnviado: boolean;
}) {
  const [cambios, setCambios] = useState("");
  const [abiertoCambios, setAbiertoCambios] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accion = async (fn: () => Promise<SitioCliente | null>) => {
    setOcupado(true);
    setError(null);
    try {
      setSitio(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo falló.");
    } finally {
      setOcupado(false);
    }
  };

  if (!sitio) {
    if (!briefEnviado) return null;
    return (
      <Tarjeta oscura>
        <p className="etiqueta text-[11px] text-amarillo">Tu página</p>
        <h2 className="titulo mt-3 text-[26px] leading-tight">Tu brief está listo. ¿Empezamos a diseñar?</h2>
        <BotonPortal tono="amarillo" className="mt-5" disabled={ocupado} onClick={() => accion(iniciarSitio)}>
          <IconoPortal nombre="chispa" className="size-4" /> {ocupado ? "Arrancando…" : "Empezar mi página"}
        </BotonPortal>
        {error && <p className="mt-3 text-[13px] text-red-300">{error}</p>}
      </Tarjeta>
    );
  }

  const indice = sitio.estado === "publicando" ? 2 : sitio.estado === "error" ? -1 : PASOS.findIndex((p) => p.estado === sitio.estado);
  const trabajando = sitio.estado === "preparando" || sitio.estado === "construyendo" || sitio.estado === "publicando" || (sitio.estado === "revision" && !sitio.vista_previa_url);

  return (
    <Tarjeta oscura className="relative overflow-hidden">
      <div className="hero-brillo pointer-events-none absolute -top-1/2 -right-1/3 size-[480px] rounded-full opacity-40 blur-2xl" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="etiqueta text-[11px] text-amarillo">Tu página</p>
          {trabajando && (
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold">
              <span className="size-2 animate-ping rounded-full bg-amarillo" /> Trabajando
            </span>
          )}
        </div>
        <h2 className="titulo mt-3 text-[clamp(24px,2.4vw,34px)] leading-[1.08]">
          {sitio.estado === "error"
            ? "Necesitamos revisar algo"
            : sitio.estado === "en_linea"
              ? "¡Tu página está en línea!"
              : sitio.estado === "revision" && sitio.vista_previa_url
                ? "Tu página está lista para revisar"
                : sitio.estado === "publicando"
                  ? "Publicando tu página…"
                  : "Estamos diseñando tu página"}
        </h2>
        {sitio.detalle && <p className="mt-2 text-[14px] text-white/65">{sitio.detalle}</p>}

        {sitio.estado !== "error" && (
          <ol className="mt-6 grid grid-cols-4 gap-2">
            {PASOS.map((p, i) => (
              <li key={p.estado}>
                <div className={`h-1.5 rounded-full ${i < indice ? "bg-amarillo" : i === indice ? "animate-pulse bg-amarillo" : "bg-white/15"}`} />
                <p className={`mt-2 text-[11px] font-semibold ${i <= indice ? "text-white" : "text-white/40"}`}>{p.texto}</p>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {sitio.estado === "revision" && sitio.vista_previa_url && (
            <>
              <BotonPortal href={sitio.vista_previa_url} tono="claro">
                <IconoPortal nombre="ojo" className="size-4" /> Ver vista previa
              </BotonPortal>
              {esDueno && (
                <BotonPortal tono="amarillo" disabled={ocupado} onClick={() => accion(aprobarSitio)}>
                  <IconoPortal nombre="check" className="size-4" /> Aprobar y publicar
                </BotonPortal>
              )}
              <button onClick={() => setAbiertoCambios((v) => !v)} className="px-2 text-[13px] font-bold text-white/70 hover:text-white">
                Pedir cambios
              </button>
            </>
          )}
          {sitio.estado === "en_linea" && sitio.produccion_url && (
            <BotonPortal href={sitio.produccion_url} tono="amarillo">
              <IconoPortal nombre="dominio" className="size-4" /> Abrir mi página
            </BotonPortal>
          )}
          {sitio.estado === "error" && (
            <BotonPortal tono="claro" disabled={ocupado} onClick={() => accion(iniciarSitio)}>
              Intentar de nuevo
            </BotonPortal>
          )}
        </div>

        {abiertoCambios && sitio.estado === "revision" && (
          <form
            className="mt-5"
            onSubmit={(e) => {
              e.preventDefault();
              accion(() => pedirAjustes(cambios)).then(() => {
                setCambios("");
                setAbiertoCambios(false);
              });
            }}
          >
            <label htmlFor="cambios-sitio" className="text-[13px] font-semibold text-white/80">
              ¿Qué quieres cambiar?
            </label>
            <textarea
              id="cambios-sitio"
              rows={3}
              value={cambios}
              onChange={(e) => setCambios(e.target.value)}
              placeholder="Por ejemplo: el color del botón más oscuro y agrega la promoción de diciembre."
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-[14px] outline-none placeholder:text-white/30 focus:border-amarillo"
            />
            <BotonPortal type="submit" tono="amarillo" className="mt-3" disabled={ocupado || cambios.trim().length < 4}>
              Mandar cambios
            </BotonPortal>
          </form>
        )}
        {error && <p className="mt-3 text-[13px] text-red-300">{error}</p>}
      </div>
    </Tarjeta>
  );
}
