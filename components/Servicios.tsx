"use client";

import { useState } from "react";
import { servicios, whatsapp } from "@/lib/content";
import { Aparece, EnlaceFlecha } from "./ui";

export function Servicios() {
  const [activo, setActivo] = useState(0);

  return (
    <section id="servicios" className="contenedor bg-humo py-[7%] max-md:py-20">
      <Aparece className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
        <h2 className="titulo text-[clamp(38px,4.6vw,72px)] leading-none">Lo que hacemos</h2>
        <div>
          <p className="max-w-[42ch] text-[15px] leading-relaxed text-gris">
            Un solo equipo para la foto, el video, la marca y la página. Todo se piensa en la misma mesa, así que
            nada se pierde en el camino.
          </p>
          <div className="mt-5">
            <EnlaceFlecha href={whatsapp("Hola Phot8can, quiero cotizar un servicio.")}>Cotizar un servicio</EnlaceFlecha>
          </div>
        </div>
      </Aparece>

      <ul className="mt-[clamp(40px,5vw,80px)] border-b border-black/10" onMouseLeave={() => setActivo(0)}>
        {servicios.map((s, i) => {
          const on = i === activo;
          const fila = (
            <div className="grid grid-cols-[1fr_auto] items-center gap-4 py-7 md:grid-cols-[1.3fr_1fr_1.2fr_auto] md:py-9">
              <h3
                className={`text-[clamp(22px,2.4vw,38px)] font-semibold tracking-[-0.02em] transition-all duration-300 ${
                  on ? "text-black md:translate-x-2" : "text-black/45"
                }`}
              >
                {s.titulo}
              </h3>
              <div className="relative hidden h-0 md:block">
                <img
                  src={s.img}
                  alt=""
                  loading="lazy"
                  className={`absolute top-1/2 left-0 aspect-[4/3] w-[clamp(140px,12vw,200px)] -translate-y-1/2 rounded-xl object-cover shadow-xl transition-all duration-500 ${
                    on ? "scale-100 rotate-0 opacity-100" : "scale-75 -rotate-3 opacity-0"
                  }`}
                />
              </div>
              <p className={`hidden items-center gap-3 text-[14px] transition-colors md:flex ${on ? "text-black" : "text-black/50"}`}>
                <span className={`size-1.5 rounded-full ${on ? "bg-amarillo" : "bg-black/40"}`} />
                {s.texto}
              </p>
              <span className="text-[13px] text-black/50 tabular-nums">0{i + 1}</span>
              <p className="col-span-2 -mt-2 text-[14px] text-gris md:hidden">{s.texto}</p>
            </div>
          );
          return (
            <li key={s.titulo} className="border-t border-black/10" onMouseEnter={() => setActivo(i)}>
              {s.href ? <a href={s.href}>{fila}</a> : fila}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
