"use client";

import { hero, mxn } from "@/lib/pagina-viva";
import { usePrecio } from "@/lib/precio";
import { Flecha } from "../ui";
import { BarraAmarilla, Navegador, PildoraPromo } from "./Marca";

const CHIPS = [
  { t: "Pixel de Meta", pos: "top-[10%] -left-[6%]", d: 900 },
  { t: "Google indexado", pos: "top-[34%] -right-[7%]", d: 1150 },
  { t: "Aviso de privacidad", pos: "bottom-[26%] -left-[9%]", d: 1400 },
  { t: "WhatsApp 24/7", pos: "bottom-[6%] right-[5%]", d: 1650 },
];

/** Una página que se arma sola, con sus conexiones encendiéndose alrededor. */
function Visual() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]" aria-hidden>
      <div className="pv-capa absolute inset-0 translate-x-[9%] -translate-y-[9%] rounded-[18px] border-2 border-white/15" style={{ animationDelay: "500ms" }} />
      <div className="pv-capa absolute inset-0 translate-x-[4.5%] -translate-y-[4.5%] rounded-[18px] border-2 border-white/30" style={{ animationDelay: "650ms" }} />

      <Navegador url="tunegocio.com" className="pv-capa relative shadow-2xl">
        <div className="space-y-4 p-6" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-extrabold tracking-[0.2em]">TU MARCA</span>
            <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold text-white">Contacto</span>
          </div>
          <p className="etiqueta pt-2 text-[10px] text-black/60">Abierto hoy</p>
          <div className="pv-linea h-6 w-[85%] rounded bg-black" style={{ animationDelay: "700ms" }} />
          <div className="pv-linea h-6 w-[60%] rounded bg-black" style={{ animationDelay: "800ms" }} />
          <div className="pv-linea h-2.5 w-[70%] rounded bg-black/20" style={{ animationDelay: "900ms" }} />
          <span className="inline-block rounded-full bg-amarillo px-4 py-2 text-[11px] font-bold">Agenda tu cita</span>
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pv-linea aspect-[4/3] rounded-lg border-[1.5px] border-black/15" style={{ animationDelay: `${1000 + i * 100}ms` }}>
                <div className="m-2 h-1.5 w-1/2 rounded bg-black/20" />
              </div>
            ))}
          </div>
        </div>
      </Navegador>

      {CHIPS.map((c) => (
        <span
          key={c.t}
          className={`pv-chip absolute ${c.pos} flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[12px] font-bold text-black shadow-lg max-sm:text-[10px]`}
          style={{ animationDelay: `${c.d}ms` }}
        >
          <span className="size-3 rounded-[3px] bg-amarillo" />
          {c.t}
        </span>
      ))}
    </div>
  );
}

/** Precio como en el anuncio: regular tachado, precio de campaña enorme y vigencia. */
function Precio() {
  const { precio, regular, etapa, vigencia } = usePrecio();
  return (
    <div>
      {etapa ? (
        <p className="flex items-center gap-4">
          <span className="titulo text-[clamp(22px,2.2vw,32px)] text-white/45 line-through decoration-2">{mxn(regular)}</span>
          <span className="etiqueta text-white/60">Precio regular</span>
        </p>
      ) : (
        <p className="etiqueta text-white/60">Un solo precio</p>
      )}
      <p className="titulo mt-1 flex items-baseline gap-3 leading-[0.9]">
        <span className="text-[clamp(64px,8vw,128px)] tracking-[-0.05em] text-amarillo">{mxn(precio)}</span>
        <span className="text-[clamp(18px,1.8vw,28px)]">MXN</span>
      </p>
      <p className="mt-3 text-[clamp(14px,1.1vw,16px)] font-semibold text-white/80">
        {etapa ? vigencia : "Pago único. Módulos opcionales aparte."}
      </p>
      {etapa && (
        <p className="mt-4 flex flex-wrap items-center gap-2 text-[14px] text-white/80">
          Usa el código
          <span className="rounded-md border-2 border-dashed border-amarillo px-2.5 py-0.5 font-extrabold tracking-[0.12em] text-amarillo">
            {etapa.codigo}
          </span>
          en tu cotización.
        </p>
      )}
    </div>
  );
}

export function PvHero() {
  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_78%_45%,rgba(243,175,14,0.22),transparent_70%)]" />
      <div className="contenedor grid min-h-[100svh] items-center gap-14 pt-32 pb-20 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="subir [--entrada:0ms]">
            <PildoraPromo respaldo={<span className="etiqueta text-amarillo">{hero.etiqueta}</span>} />
          </div>
          <h1 className="titulo subir mt-8 text-[clamp(42px,5.8vw,92px)] leading-[0.98] [--entrada:0ms]">
            <span className="block">No vendemos paquetes.</span>
            <span className="block text-amarillo">Interpretamos tu negocio.</span>
          </h1>
          <BarraAmarilla className="subir mt-8 [--entrada:0ms]" />
          <p className="subir mt-8 max-w-[46ch] text-[clamp(16px,1.3vw,20px)] leading-relaxed text-white/80 [--entrada:0ms]" style={{ ["--d" as string]: "120ms" }}>
            {hero.texto}
          </p>

          <div className="subir mt-10 [--entrada:0ms]" style={{ ["--d" as string]: "240ms" }}>
            <Precio />
            <a
              href="#arma-tu-proyecto"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-amarillo px-8 py-4 text-[16px] font-bold text-black transition-colors hover:bg-white"
            >
              Solicita tu cotización <Flecha className="size-4" />
            </a>
          </div>
        </div>
        <Visual />
      </div>
      <style>{`
        .pv-capa{animation:pv-capa 1s cubic-bezier(.22,1,.36,1) both}
        @keyframes pv-capa{from{opacity:0;transform:translateY(40px) scale(.96)}}
        .pv-linea{animation:pv-linea .8s cubic-bezier(.22,1,.36,1) both;transform-origin:left}
        @keyframes pv-linea{from{opacity:0;transform:scaleX(.2)}}
        .pv-chip{animation:pv-chip .7s cubic-bezier(.34,1.56,.64,1) both}
        @keyframes pv-chip{from{opacity:0;transform:scale(.6) translateY(10px)}}
        @media (prefers-reduced-motion: reduce){.pv-capa,.pv-linea,.pv-chip{animation:none}}
      `}</style>
    </section>
  );
}
