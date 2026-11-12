"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pantalla amarilla de entrada con el isotipo y un contador.
 * Se oculta sola con CSS aunque falle el JavaScript, y solo sale una vez por visita.
 */
export function Cargador() {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let visto = false;
    try {
      visto = sessionStorage.getItem("p8-cargador") === "1";
      sessionStorage.setItem("p8-cargador", "1");
    } catch {}
    if (visto) {
      document.documentElement.dataset.sinCargador = "";
      el.style.display = "none";
      return;
    }
    const inicio = performance.now();
    let raf = requestAnimationFrame(function paso(t) {
      const p = Math.min(1, (t - inicio) / 1100);
      setN(Math.round(100 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(paso);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="cargador fixed inset-0 z-[100] flex items-center justify-center bg-amarillo text-black"
    >
      <img src="/marca/isotipo_negro.png" alt="" className="w-[min(46vw,300px)]" />
      <span className="titulo absolute right-[5vw] bottom-[5vw] text-[clamp(28px,4vw,56px)] tabular-nums">{n}</span>
      <style>{`
        .cargador{animation:cargador-sale .8s cubic-bezier(.76,0,.24,1) 1.35s forwards}
        @keyframes cargador-sale{to{transform:translateY(-100%);visibility:hidden}}
        @media (prefers-reduced-motion: reduce){.cargador{display:none}}
      `}</style>
    </div>
  );
}
