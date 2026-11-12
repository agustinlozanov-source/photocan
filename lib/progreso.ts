"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Mide cuánto se ha recorrido una sección alta con contenido "sticky":
 * 0 cuando su borde superior toca el de la pantalla, 1 cuando termina.
 * Escribe el valor en la variable CSS `--p` del elemento y llama a `alCambiar`.
 */
export function useProgreso<T extends HTMLElement>(ref: RefObject<T | null>, alCambiar?: (p: number) => void) {
  const cb = useRef(alCambiar);
  useEffect(() => {
    cb.current = alCambiar;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const calcular = () => {
      raf = 0;
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total)) : 0;
      el.style.setProperty("--p", p.toFixed(4));
      cb.current?.(p);
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(calcular);
    };
    calcular();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

/** true en pantallas grandes y sin "reducir movimiento": ahí van las animaciones con scroll. */
export function animacionesCompletas() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
