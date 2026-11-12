"use client";

import { useEffect, useRef, useState } from "react";
import { proyectos } from "@/lib/content";
import { animacionesCompletas, useProgreso } from "@/lib/progreso";
import { Aparece, EnlaceFlecha, Flecha } from "./ui";

/**
 * En escritorio la sección se queda fija y los proyectos se deslizan de lado con el scroll.
 * En móvil es un carrusel horizontal normal.
 */
export function Proyectos() {
  const seccion = useRef<HTMLElement>(null);
  const pista = useRef<HTMLUListElement>(null);
  const barra = useRef<HTMLDivElement>(null);
  const distancia = useRef(0);
  const [alto, setAlto] = useState<number | null>(null);

  useEffect(() => {
    const medir = () => {
      const el = pista.current;
      if (!el) return;
      if (!animacionesCompletas()) {
        el.style.transform = "";
        setAlto(null);
        return;
      }
      distancia.current = Math.max(0, el.scrollWidth - window.innerWidth);
      setAlto(distancia.current + window.innerHeight);
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  useProgreso(seccion, (p) => {
    if (alto === null) return;
    if (pista.current) pista.current.style.transform = `translate3d(${-p * distancia.current}px,0,0)`;
    if (barra.current) barra.current.style.transform = `scaleX(${p})`;
  });

  return (
    <section id="proyectos" ref={seccion} style={alto ? { height: alto } : undefined} className="relative bg-humo">
      <div className={alto ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : "py-20"}>
        <Aparece className="contenedor">
          <h2 className="titulo text-[clamp(38px,4.6vw,72px)] leading-none">Trabajo que se ve</h2>
          <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-gris">
            Sigue bajando: los proyectos avanzan de lado, que es como suelen llegar las buenas ideas.
          </p>
          <div className="mt-5">
            <EnlaceFlecha href="#contacto">Cuéntanos tu proyecto</EnlaceFlecha>
          </div>
        </Aparece>

        <ul
          ref={pista}
          className={`mt-[clamp(28px,3.5vw,56px)] flex gap-[2vw] px-[2vw] will-change-transform ${
            alto ? "w-max" : "snap-x snap-mandatory overflow-x-auto px-[6vw] pb-4 [scrollbar-width:none]"
          }`}
        >
          {proyectos.map((p) => {
            const tarjeta = (
              <>
                <div className="overflow-hidden rounded-2xl bg-black/5">
                  <img
                    src={p.img}
                    alt={p.titulo}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-5 flex items-center gap-2 text-[18px] font-semibold">
                  {p.titulo}
                  {p.href && <Flecha className="size-3.5" />}
                </h3>
                <p className="mt-1.5 text-[15px] text-gris">{p.texto}</p>
                <p className="mt-2 text-[12px] text-black/50">{p.meta}</p>
              </>
            );
            return (
              <li key={p.titulo} className="group w-[min(30vw,460px)] shrink-0 snap-start max-lg:w-[78vw] md:max-lg:w-[44vw]">
                {p.href ? <a href={p.href}>{tarjeta}</a> : tarjeta}
              </li>
            );
          })}
        </ul>

        {alto && (
          <div className="contenedor mt-10">
            <div className="h-px bg-black/10">
              <div ref={barra} className="h-px origin-left scale-x-0 bg-black" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
