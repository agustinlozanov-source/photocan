"use client";

import { useEffect, useRef, useState } from "react";
import { volumen } from "@/lib/pagina-viva";
import { animacionesCompletas, useProgreso } from "@/lib/progreso";
import { Aparece } from "../ui";

/**
 * El mapa del sitio de un negocio de ejemplo se va llenando al bajar.
 * Al final se enciende una campaña que cae directo en su página.
 */
export function PvVolumen() {
  const ref = useRef<HTMLElement>(null);
  const total = volumen.paginas.length;
  const [n, setN] = useState(total);
  const [fijo, setFijo] = useState(false);

  useEffect(() => {
    const revisar = () => {
      const f = animacionesCompletas();
      setFijo(f);
      if (!f) setN(total);
    };
    revisar();
    window.addEventListener("resize", revisar);
    return () => window.removeEventListener("resize", revisar);
  }, [total]);

  useProgreso(ref, (p) => {
    if (!fijo) return;
    const nuevo = Math.max(1, Math.min(total + 1, Math.round(p * (total + 1.5))));
    setN((v) => (v === nuevo ? v : nuevo));
  });

  const campanaVisible = n > total || !fijo;

  return (
    <section ref={ref} className={`relative bg-humo ${fijo ? "h-[300vh]" : ""}`}>
      <div className={`contenedor ${fijo ? "sticky top-0 grid h-screen grid-cols-[1fr_1.05fr] items-center gap-[5vw] pt-[72px]" : "py-20"}`}>
        <div>
          <Aparece>
            <p className="etiqueta">Volumen de páginas</p>
            <h2 className="titulo mt-4 max-w-[14ch] text-[clamp(34px,4.2vw,64px)] leading-[1.02]">
              Una página por cada cosa que vendes.
            </h2>
          </Aparece>
          <ul className="mt-8 space-y-5">
            {volumen.razones.map((r) => (
              <li key={r.titulo} className="border-l-2 border-amarillo pl-5">
                <h3 className="text-[17px] font-semibold">{r.titulo}</h3>
                <p className="mt-1 max-w-[42ch] text-[15px] leading-relaxed text-gris">{r.texto}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className={fijo ? "" : "mt-12"}>
          <div className="rounded-[24px] bg-white p-[clamp(20px,2.4vw,36px)] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[13px] text-black/50">
                Ejemplo · <span className="font-semibold text-black">{volumen.negocio}</span>
              </p>
              <p className="text-right">
                <span className="titulo text-[clamp(28px,2.6vw,40px)] leading-none tabular-nums">{Math.min(n, total)}</span>
                <span className="ml-2 text-[12px] text-black/50">páginas en Google</span>
              </p>
            </div>

            <ul className="mt-5 space-y-1">
              {volumen.paginas.map((pg, i) => {
                const visible = i < n;
                const destacada = pg.campana && campanaVisible;
                return (
                  <li
                    key={pg.ruta}
                    className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2 transition-all duration-500 [@media(min-height:860px)]:py-2.5 ${
                      pg.nivel ? "ml-6 max-sm:ml-3" : ""
                    } ${visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"} ${
                      destacada ? "bg-amarillo" : "bg-humo"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {pg.nivel ? <span className="text-black/30">└</span> : null}
                      <span className="truncate text-[14px] font-semibold">{pg.nombre}</span>
                    </span>
                    <span className={`truncate text-[11px] ${destacada ? "text-black/70" : "text-black/40"} max-sm:hidden`}>{pg.ruta}</span>
                  </li>
                );
              })}
            </ul>

            <div
              className={`mt-5 flex items-center gap-3 rounded-xl bg-black px-4 py-3 text-white transition-all duration-500 ${
                campanaVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">Anuncio</span>
              <span className="min-w-0 truncate text-[13px]">“ortodoncia cerca de mí”</span>
              <span className="ml-auto shrink-0 text-[13px] font-semibold text-amarillo">→ cae en Ortodoncia</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
