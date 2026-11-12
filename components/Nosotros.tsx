"use client";

import { useEffect, useRef, useState } from "react";
import { cifras } from "@/lib/content";
import { Aparece, EnlaceFlecha } from "./ui";

function Cifra({ valor, sufijo }: { valor: number; sufijo: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(valor);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const inicio = performance.now();
      raf = requestAnimationFrame(function paso(t) {
        const p = Math.min(1, (t - inicio) / 1600);
        setN(Math.round(valor * (1 - Math.pow(1 - p, 4))));
        if (p < 1) raf = requestAnimationFrame(paso);
      });
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [valor]);
  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {sufijo}
    </span>
  );
}

export function Nosotros() {
  return (
    <section id="nosotros" className="contenedor bg-humo py-[7%] max-md:py-20">
      <div className="rounded-[28px] border border-black/5 bg-white p-[clamp(24px,3vw,48px)]">
        <Aparece>
          <h2 className="titulo max-w-[24ch] text-[clamp(26px,2.9vw,46px)] leading-[1.12]">
            Fotógrafos, diseñadores y estrategas bajo un mismo techo,{" "}
            <span className="text-black/40">obsesionados con la imagen que tu cliente recuerda.</span>
          </h2>
          <div className="mt-6">
            <EnlaceFlecha href="#proceso">Cómo trabajamos</EnlaceFlecha>
          </div>
        </Aparece>

        <div className="mt-[clamp(40px,5vw,72px)] grid gap-3 md:grid-cols-3">
          {cifras.map((c, i) => (
            <Aparece key={c.texto} retraso={i * 120}>
              <div className="flex h-full min-h-[240px] flex-col justify-between rounded-2xl bg-humo p-7 max-md:min-h-[180px]">
                <p className="titulo text-[clamp(48px,5vw,80px)] leading-none">
                  <Cifra valor={c.valor} sufijo={c.sufijo} />
                </p>
                <p className="text-[14px] leading-snug whitespace-pre-line text-gris">{c.texto}</p>
              </div>
            </Aparece>
          ))}
        </div>
      </div>
    </section>
  );
}
