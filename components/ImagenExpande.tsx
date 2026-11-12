"use client";

import { useRef } from "react";
import { useProgreso } from "@/lib/progreso";
import { Boton, Flecha } from "./ui";

/**
 * Una imagen que nace como arco y se abre hasta ocupar toda la pantalla al hacer scroll.
 * El recorte se calcula en CSS a partir de `--p` (0 a 1).
 */
export function ImagenExpande() {
  const ref = useRef<HTMLElement>(null);
  useProgreso(ref);

  return (
    <section ref={ref} className="relative h-[220vh] bg-humo [--p:0] motion-reduce:h-auto max-md:h-[180vh]">
      <div className="sticky top-0 h-screen overflow-hidden motion-reduce:static">
        <div
          className="absolute inset-0 [clip-path:inset(calc((1-min(1,var(--p)*1.6))*14%)_calc((1-min(1,var(--p)*1.6))*9%)_0_calc((1-min(1,var(--p)*1.6))*9%)_round_calc((1-min(1,var(--p)*1.6))*42vw)_calc((1-min(1,var(--p)*1.6))*42vw)_0_0)] motion-reduce:[clip-path:none]"
        >
          <img
            src="/img/puerta-grande.webp"
            alt="Logotipo de Phot8can en vinil sobre una puerta de cristal"
            className="h-full w-full scale-[calc(1.15-0.15*var(--p))] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>

        <div
          className="contenedor absolute inset-x-0 bottom-10 flex flex-wrap items-end justify-between gap-6 text-white opacity-[clamp(0,calc((var(--p)-0.55)*4),1)] motion-reduce:opacity-100"
        >
          <p className="titulo max-w-[18ch] text-[clamp(24px,2.6vw,40px)] leading-[1.1]">
            Creamos. Capturamos. <span className="text-amarillo">Conectamos.</span>
          </p>
          <Boton href="#proyectos" tono="contorno-claro">
            Ver el trabajo <Flecha />
          </Boton>
        </div>
      </div>
    </section>
  );
}
