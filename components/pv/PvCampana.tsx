"use client";

import { mxn } from "@/lib/pagina-viva";
import { usePrecio } from "@/lib/precio";
import { Flecha } from "../ui";
import { Navegador } from "./Marca";

/** La tienda abierta 24/7: toldo + navegador con el letrero de "ABIERTO". */
function Tienda() {
  return (
    <div className="mx-auto w-full max-w-[440px]" aria-hidden>
      <div className="flex h-[clamp(44px,5vw,64px)]">
        {Array.from({ length: 11 }, (_, i) => (
          <span key={i} className={`flex-1 rounded-b-full ${i % 2 ? "bg-white" : "bg-black"}`} />
        ))}
      </div>
      <div className="mx-[4%]">
        <Navegador url="tunegocio.com" className="rounded-t-none">
          <div className="flex flex-col items-center justify-center gap-4 py-[clamp(28px,4vw,48px)]">
            <span className="titulo -rotate-3 bg-black px-6 py-2 text-[clamp(20px,2.2vw,30px)] tracking-[0.12em] text-amarillo">ABIERTO</span>
            <span className="etiqueta text-[11px]">24 horas · 7 días</span>
          </div>
        </Navegador>
      </div>
    </div>
  );
}

/** Sección de campaña con el mismo estilo del anuncio amarillo. */
export function PvCampana() {
  const { precio, regular, etapa, vigencia } = usePrecio();
  return (
    <section className="bg-amarillo py-[7%] text-black max-md:py-20">
      <div className="contenedor">
        <span className="etiqueta inline-flex rounded-full bg-black px-5 py-2.5 text-[13px] text-amarillo">
          {etapa ? `Promo ${etapa.nombre}` : "Página Viva"}
        </span>
        <p className="mt-8 max-w-[30ch] text-[clamp(20px,2.2vw,34px)] leading-tight font-medium">
          Tu próxima gran inversión no tiene que ser un local.
        </p>
        <h2 className="titulo mt-2 max-w-[14ch] text-[clamp(44px,6.4vw,104px)] leading-[0.95]">Puede ser tu presencia digital.</h2>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="titulo text-[clamp(28px,3vw,44px)] leading-none">PÁGINA VIVA</p>
            <span aria-hidden className="mt-4 block h-2.5 w-[clamp(120px,12vw,170px)] bg-black" />
            <p className="etiqueta mt-5 max-w-[26ch] leading-relaxed">Diseño y desarrollo de páginas web</p>

            <div className="mt-12">
              {etapa && (
                <p className="flex items-center gap-4">
                  <span className="titulo text-[clamp(24px,2.4vw,36px)] line-through decoration-[3px]">{mxn(regular)}</span>
                  <span className="etiqueta">Precio regular</span>
                </p>
              )}
              <p className="titulo flex items-baseline gap-3 leading-[0.85]">
                <span className="text-[clamp(72px,10vw,168px)] tracking-[-0.06em]">{mxn(precio)}</span>
                <span className="text-[clamp(20px,2.2vw,36px)]">MXN</span>
              </p>
              {etapa && <p className="mt-4 text-[clamp(15px,1.2vw,18px)] font-semibold">{vigencia}</p>}
            </div>
          </div>
          <Tienda />
        </div>

        <a
          href="#arma-tu-proyecto"
          className="mt-12 flex w-full items-center justify-center gap-3 rounded-full bg-black px-8 py-5 text-[clamp(17px,1.6vw,24px)] font-bold text-white transition-colors hover:bg-white hover:text-black"
        >
          Solicita tu cotización <Flecha className="size-5" />
        </a>
      </div>
    </section>
  );
}
