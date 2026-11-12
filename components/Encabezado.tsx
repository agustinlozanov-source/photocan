"use client";

import { useEffect, useState } from "react";
import { nav, whatsapp } from "@/lib/content";

export function Encabezado() {
  const [solido, setSolido] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const revisar = () => setSolido(window.scrollY > window.innerHeight * 0.85);
    revisar();
    window.addEventListener("scroll", revisar, { passive: true });
    return () => window.removeEventListener("scroll", revisar);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = abierto ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierto]);

  const claro = solido && !abierto;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[70] border-b transition-colors duration-300 ${
          claro ? "border-black/10 bg-white/85 text-black backdrop-blur-md" : "border-transparent text-white"
        }`}
      >
        <div className="contenedor flex h-[72px] items-center justify-between">
          <a href="#inicio" onClick={() => setAbierto(false)} aria-label="Phot8can, inicio">
            <img
              src={claro ? "/marca/logo_color_fondo-claro.png" : "/marca/logo_color_fondo-oscuro.png"}
              alt="Phot8can · Agencia creativa"
              className="h-8 w-auto md:h-9"
            />
          </a>
          <div className="flex items-center gap-2">
            <a
              href={whatsapp()}
              target="_blank"
              rel="noopener"
              className={`rounded-full px-5 py-2.5 text-[13px] font-semibold transition-colors max-sm:hidden ${
                claro ? "bg-black text-white hover:bg-amarillo hover:text-black" : "bg-white text-black hover:bg-amarillo"
              }`}
            >
              Cotizar proyecto
            </a>
            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-expanded={abierto}
              aria-controls="menu"
              className={`flex items-center gap-3 rounded-full border py-1.5 pr-1.5 pl-5 text-[13px] font-semibold transition-colors ${
                claro ? "border-black/20 hover:border-black" : "border-white/40 hover:border-white"
              }`}
            >
              {abierto ? "Cerrar" : "Menú"}
              <span className={`grid size-7 place-items-center rounded-full ${claro ? "bg-black text-white" : "bg-white text-black"}`}>
                <svg viewBox="0 0 12 12" className="size-3" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  {abierto ? <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" /> : <path d="M2 4.5h8M2 7.5h8" />}
                </svg>
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="menu"
        className={`fixed inset-0 z-[65] flex flex-col justify-between bg-black text-white transition-[clip-path] duration-700 ease-[cubic-bezier(.76,0,.24,1)] ${
          abierto ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
        aria-hidden={!abierto}
      >
        <nav className="contenedor pt-32">
          <ul>
            {nav.map((l, i) => (
              <li key={l.href} className="border-b border-white/10">
                <a
                  href={l.href}
                  tabIndex={abierto ? 0 : -1}
                  onClick={() => setAbierto(false)}
                  className="group flex items-baseline justify-between py-3 md:py-4"
                >
                  <span className="titulo text-[clamp(36px,6vw,80px)] leading-none transition-colors group-hover:text-amarillo">
                    {l.label}
                  </span>
                  <span className="text-[13px] text-white/40 tabular-nums">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="contenedor flex flex-wrap items-end justify-between gap-6 pb-10">
          <p className="titulo text-[clamp(20px,2.2vw,30px)] leading-tight">
            Creamos. Capturamos. <span className="text-amarillo">Conectamos.</span>
          </p>
          <a
            href={whatsapp()}
            target="_blank"
            rel="noopener"
            tabIndex={abierto ? 0 : -1}
            className="rounded-full bg-amarillo px-6 py-3.5 text-[14px] font-semibold text-black hover:bg-white"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
