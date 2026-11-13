"use client";

import { useEffect, useRef } from "react";
import { nav, servicios, whatsapp } from "@/lib/content";

/**
 * Pie negro que se queda fijo debajo del contenido y se descubre al llegar al final.
 * El contenido deja un margen del alto del pie (`--alto-pie`). En móvil es un pie normal.
 */
export function Pie() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      document.documentElement.style.setProperty("--alto-pie", `${el.offsetHeight}px`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <footer ref={ref} className="bottom-0 z-0 w-full bg-black text-white md:fixed md:inset-x-0">
      <div className="contenedor grid gap-10 pt-16 pb-10 md:grid-cols-[1.3fr_2fr]">
        <div>
          <img src="/marca/logo_color_fondo-oscuro.png" alt="Phot8can · Agencia creativa" className="h-10 w-auto" />
          <p className="mt-6 max-w-[34ch] text-[14px] leading-relaxed text-white/60">
            Agencia creativa que transforma ideas en imagen. Creatividad, estrategia y cercanía.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-[14px] sm:grid-cols-3">
          <div>
            <p className="text-[12px] text-white/40">Agencia</p>
            <ul className="mt-4 space-y-3">
              {nav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-amarillo">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] text-white/40">Servicios</p>
            <ul className="mt-4 space-y-3">
              {servicios.map((s) => (
                <li key={s.titulo}>
                  <a href={s.href ?? "/#servicios"} className="hover:text-amarillo">
                    {s.titulo}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] text-white/40">Contacto</p>
            <ul className="mt-4 space-y-3">
              <li>
                <a href={whatsapp()} target="_blank" rel="noopener" className="hover:text-amarillo">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="https://phot8can.com" className="hover:text-amarillo">
                  phot8can.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="contenedor border-t border-white/10 py-[clamp(24px,3vw,48px)]">
        <img src="/marca/isotipo_color.png" alt="" aria-hidden className="mx-auto w-[min(56vw,62vh)]" />
      </div>

      <div className="contenedor flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-6 text-[12px] text-white/50">
        <p>
          © 2026 Phot8can. Creamos. Capturamos. Conectamos. ·{" "}
          <a href="/aviso-de-privacidad/" className="underline-offset-2 hover:text-white hover:underline">
            Aviso de privacidad
          </a>
        </p>
        <a href="#inicio" className="hover:text-white">
          Volver arriba ↑
        </a>
      </div>
    </footer>
  );
}
