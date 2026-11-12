"use client";

import { useEffect, useRef } from "react";

/** Aparece con un fade-up suave cuando entra en pantalla. */
export function Aparece({
  children,
  className = "",
  retraso = 0,
}: {
  children: React.ReactNode;
  className?: string;
  retraso?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`aparece ${className}`} style={{ transitionDelay: `${retraso}ms` }}>
      {children}
    </div>
  );
}

export function Flecha({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}

/** Botón en forma de píldora. `tono` según el fondo sobre el que va. */
export function Boton({
  href,
  children,
  tono = "negro",
  externo = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  tono?: "negro" | "blanco" | "amarillo" | "contorno-claro" | "contorno-oscuro";
  externo?: boolean;
  className?: string;
}) {
  const tonos = {
    negro: "bg-black text-white hover:bg-amarillo hover:text-black",
    blanco: "bg-white text-black hover:bg-amarillo",
    amarillo: "bg-amarillo text-black hover:bg-white",
    "contorno-claro": "border border-white/40 text-white hover:border-amarillo hover:text-amarillo",
    "contorno-oscuro": "border border-black/25 text-black hover:border-black",
  };
  return (
    <a
      href={href}
      {...(externo ? { target: "_blank", rel: "noopener" } : {})}
      className={`inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[14px] font-semibold transition-colors duration-300 ${tonos[tono]} ${className}`}
    >
      {children}
    </a>
  );
}

/** Enlace subrayado con flecha, como "Ver todos los proyectos ↗". */
export function EnlaceFlecha({ href, children, claro = false }: { href: string; children: React.ReactNode; claro?: boolean }) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-2 border-b pb-1 text-[14px] font-semibold transition-colors ${
        claro ? "border-white/50 text-white hover:border-amarillo hover:text-amarillo" : "border-black text-black hover:border-amarillo"
      }`}
    >
      {children}
      <Flecha className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}
