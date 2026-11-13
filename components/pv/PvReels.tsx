"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { reels, reelsHasta } from "@/lib/pagina-viva";
import { Aparece } from "../ui";
import { BarraAmarilla } from "./Marca";

const HORA_BUILD = Date.now();
const vigentes = (t: number) => t <= Date.parse(reelsHasta);

/** Un reel dentro de un celular: se reproduce sin sonido al entrar en pantalla y se pausa al salir. */
function Reel({ r }: { r: (typeof reels)[number] }) {
  const video = useRef<HTMLVideoElement>(null);
  const [sonido, setSonido] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.3 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const alternarSonido = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setSonido(!v.muted);
    if (!v.muted) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };

  return (
    <figure className="w-[min(72vw,300px)] shrink-0 snap-center md:w-auto">
      <div className="relative overflow-hidden rounded-[36px] border-[3px] border-white bg-[#111] shadow-2xl">
        <video
          ref={video}
          src={`/reels/${r.id}.mp4`}
          poster={`/reels/${r.id}.webp`}
          muted
          loop
          playsInline
          preload="none"
          className="aspect-[9/16] w-full object-cover"
          aria-label={r.dolor}
        />
        {r.audio && (
          <button
            type="button"
            onClick={alternarSonido}
            className="absolute right-3 bottom-3 flex items-center gap-2 rounded-full bg-black/75 px-3.5 py-2 text-[12px] font-semibold text-white backdrop-blur"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M4 9v6h4l5 4V5L8 9H4Z" />
              {sonido ? <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /> : <path d="m16 9 5 6M21 9l-5 6" />}
            </svg>
            {sonido ? "Silenciar" : "Con sonido"}
          </button>
        )}
      </div>
      <figcaption className="mt-5">
        <p className="text-[clamp(16px,1.3vw,19px)] leading-snug font-bold">{r.dolor}</p>
        <p className="mt-2 text-[15px] leading-snug font-semibold text-amarillo">{r.resuelve}</p>
      </figcaption>
    </figure>
  );
}

/** Los reels de campaña como apoyo a los dolores. Se ocultan solos cuando vence la campaña. */
export function PvReels() {
  const visible = useSyncExternalStore(
    () => () => {},
    () => vigentes(Date.now()),
    () => vigentes(HORA_BUILD),
  );
  if (!visible) return null;

  return (
    <section className="overflow-hidden bg-black py-[7%] text-white max-md:py-20">
      <div className="contenedor">
        <Aparece className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="etiqueta text-amarillo">Así se siente</p>
            <h2 className="titulo mt-4 max-w-[16ch] text-[clamp(34px,4.4vw,68px)] leading-[1.02]">
              Tu cliente no espera. <span className="text-amarillo">Tu página tampoco.</span>
            </h2>
            <BarraAmarilla className="mt-6" />
          </div>
          <p className="max-w-[44ch] text-[clamp(15px,1.15vw,18px)] leading-relaxed text-white/70">
            Cada mensaje sin contestar es un cliente que se va con otro. Mira lo que pasa cuando tu página atiende por ti.
          </p>
        </Aparece>
      </div>
      <div className="mt-[clamp(36px,4vw,64px)] flex snap-x snap-mandatory gap-5 overflow-x-auto px-[6vw] pb-4 [scrollbar-width:none] md:grid md:px-[5vw] md:grid-cols-3 md:gap-[3vw] md:overflow-visible">
        {reels.map((r) => (
          <Reel key={r.id} r={r} />
        ))}
      </div>
    </section>
  );
}
