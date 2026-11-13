"use client";

import { useState } from "react";
import { crearOrganizacion } from "@/lib/sesion";
import { IconoPortal } from "./Iconos";
import { BotonPortal, Tarjeta } from "./Piezas";

/** Primera vez en el portal: el cliente da de alta su negocio. */
export function AltaOrganizacion({ correo }: { correo: string }) {
  const [nombre, setNombre] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-[620px] py-6">
      <Tarjeta oscura className="relative overflow-hidden">
        <div className="hero-brillo pointer-events-none absolute -top-1/2 -right-1/3 size-[460px] rounded-full opacity-50 blur-2xl" />
        <form
          className="relative"
          onSubmit={async (e) => {
            e.preventDefault();
            setEnviando(true);
            setError(null);
            const fallo = await crearOrganizacion(nombre);
            setEnviando(false);
            if (fallo) setError(fallo);
          }}
        >
          <p className="etiqueta text-[11px] text-amarillo">Bienvenido</p>
          <h1 className="titulo mt-3 text-[clamp(28px,3.4vw,44px)] leading-[1.02]">Empecemos con el nombre de tu negocio.</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-white/65">
            Entraste como <b className="text-white">{correo}</b>. Con esto creamos tu espacio: tu briefing, tus archivos y todo lo que
            contrates quedan aquí, a tu nombre.
          </p>
          <label htmlFor="nombre-negocio" className="mt-8 block text-[13px] font-semibold text-white/80">
            Nombre de tu negocio
          </label>
          <input
            id="nombre-negocio"
            required
            minLength={2}
            maxLength={120}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Clínica Dental Sonrisa"
            className="mt-2 w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-[15px] outline-none placeholder:text-white/30 focus:border-amarillo"
          />
          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-red-500/15 px-4 py-3 text-[13px] text-red-200">
              {error}
            </p>
          )}
          <BotonPortal type="submit" tono="amarillo" className="mt-5 w-full !py-4" disabled={enviando || nombre.trim().length < 2}>
            {enviando ? "Creando…" : "Crear mi espacio"}
            <IconoPortal nombre="flecha" className="size-4" />
          </BotonPortal>
        </form>
      </Tarjeta>
    </div>
  );
}

export function Cargando() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <span className="flex items-center gap-3 text-[14px] font-semibold text-black/50">
        <span className="size-2.5 animate-ping rounded-full bg-amarillo" />
        Cargando tu portal…
      </span>
    </div>
  );
}
