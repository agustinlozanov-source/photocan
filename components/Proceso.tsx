"use client";

import { useEffect, useRef, useState } from "react";
import { pasos } from "@/lib/content";
import { animacionesCompletas, useProgreso } from "@/lib/progreso";

const N = 11;

/** Pseudoaleatorio estable por celda y paso. */
function azar(paso: number, r: number, c: number) {
  let h = (r * 73856093) ^ (c * 19349663) ^ ((paso + 1) * 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) % 100;
}

/** 0 = punto gris, 1 = cuadro negro, 2 = cuadro amarillo. El último paso dibuja el «8». */
function celda(paso: number, r: number, c: number): 0 | 1 | 2 {
  const h = azar(paso, r, c);
  const centro = Math.hypot(r - 5, c - 5);
  if (paso === 0) return centro < 5.6 && h < 24 ? (h < 4 ? 2 : 1) : 0;
  if (paso === 1) return centro < 5.2 && h < 58 ? (h < 8 ? 2 : 1) : 0;
  if (paso === 2) {
    // Un visor de cámara: esquinas y el punto de enfoque al centro.
    const borde = r === 1 || r === 9 || c === 1 || c === 9;
    const esquina = (r <= 3 || r >= 7) && (c <= 3 || c >= 7);
    if (borde && esquina) return 1;
    if (Math.abs(r - 5) + Math.abs(c - 5) <= 1) return 2;
    return 0;
  }
  const v = OCHO[r][c];
  return v === "Y" ? 2 : v === "X" ? 1 : 0;
}

/** El «8» de Phot8can, celda por celda. */
const OCHO = [
  "...........",
  "....XXY....",
  "...X...X...",
  "...X...X...",
  "....XXX....",
  "...X...X...",
  "..X.....X..",
  "..Y.....X..",
  "..X.....X..",
  "...X...Y...",
  "....XXX....",
];

function Rejilla({ paso }: { paso: number }) {
  return (
    <div className="grid aspect-square w-full max-w-[440px] grid-cols-11 gap-[1.2%]" aria-hidden>
      {Array.from({ length: N * N }, (_, i) => {
        const r = Math.floor(i / N);
        const c = i % N;
        const v = celda(paso, r, c);
        return (
          <span
            key={i}
            className={`rounded-[3px] transition-all duration-500 ${
              v === 0 ? "scale-[0.42] bg-black/25" : v === 1 ? "scale-100 bg-black" : "scale-100 bg-amarillo"
            }`}
            style={{ transitionDelay: `${(r + c) * 14}ms` }}
          />
        );
      })}
    </div>
  );
}

export function Proceso() {
  const ref = useRef<HTMLElement>(null);
  const [paso, setPaso] = useState(0);
  const [fijo, setFijo] = useState(false);

  useEffect(() => {
    const revisar = () => setFijo(animacionesCompletas());
    revisar();
    window.addEventListener("resize", revisar);
    return () => window.removeEventListener("resize", revisar);
  }, []);

  useProgreso(ref, (p) => {
    const nuevo = Math.min(pasos.length - 1, Math.floor(p * pasos.length));
    setPaso((v) => (v === nuevo ? v : nuevo));
  });

  if (!fijo) {
    return (
      <section id="proceso" ref={ref} className="contenedor bg-humo py-20">
        <h2 className="titulo text-[clamp(38px,8vw,72px)] leading-none">Cómo lo hacemos</h2>
        <ol className="mt-10 space-y-8">
          {pasos.map((s, i) => (
            <li key={s.titulo} className="border-t border-black/10 pt-6">
              <p className="text-[12px] text-black/50">0{i + 1} / 0{pasos.length}</p>
              <h3 className="mt-2 text-[22px] font-semibold">{s.titulo}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gris">{s.texto}</p>
              <p className="mt-3 text-[12px] font-semibold">{s.tiempo}</p>
            </li>
          ))}
        </ol>
        <div className="mx-auto mt-12 max-w-[320px]">
          <Rejilla paso={pasos.length - 1} />
        </div>
      </section>
    );
  }

  const s = pasos[paso];
  return (
    <section id="proceso" ref={ref} className="relative h-[400vh] bg-humo">
      <div className="contenedor sticky top-0 grid h-screen grid-cols-2 items-center gap-[5vw]">
        <div>
          <h2 className="titulo text-[clamp(44px,4.6vw,76px)] leading-none">Cómo lo hacemos</h2>
          <div key={paso} className="subir mt-10 [--entrada:0ms]">
            <p className="text-[12px] text-black/50 tabular-nums">
              0{paso + 1} / 0{pasos.length}
            </p>
            <h3 className="mt-3 text-[clamp(22px,1.8vw,28px)] font-semibold">{s.titulo}</h3>
            <p className="mt-3 max-w-[40ch] text-[clamp(15px,1.2vw,18px)] leading-relaxed text-gris">{s.texto}</p>
            <p className="mt-4 text-[12px] font-semibold">{s.tiempo}</p>
          </div>
        </div>
        <div className="flex justify-center">
          <Rejilla paso={paso} />
        </div>
        <div className="absolute top-1/2 right-[2vw] flex -translate-y-1/2 flex-col gap-2" aria-hidden>
          {pasos.map((_, i) => (
            <span key={i} className={`w-1 rounded-full transition-all ${i === paso ? "h-6 bg-amarillo" : "h-2 bg-black/20"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
