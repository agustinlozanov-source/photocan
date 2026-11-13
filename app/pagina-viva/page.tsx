import type { Metadata } from "next";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import { PvIdentidad, PvTrabajaPorTi } from "@/components/pv/PvAnuncios";
import { PvCampana } from "@/components/pv/PvCampana";
import { PvConfigurador } from "@/components/pv/PvConfigurador";
import { PvHero } from "@/components/pv/PvHero";
import { Encabezado as Titulo, PvContraste, PvLegal, PvPreguntas, PvResultado, PvSistema } from "@/components/pv/PvSecciones";
import { PvReels } from "@/components/pv/PvReels";
import { PvVolumen } from "@/components/pv/PvVolumen";
import { Aparece, Boton, Flecha } from "@/components/ui";
import { paginaViva, whatsapp } from "@/lib/content";
import { mxn, PRECIO_BASE, totalIncluido } from "@/lib/pagina-viva";

export const metadata: Metadata = {
  title: "Página Viva · Phot8can",
  description: `Una página web que interpreta tu negocio: conectada, medida, indexada y en regla. ${totalIncluido} funciones por un solo precio de ${mxn(PRECIO_BASE)}.`,
};

function Giros() {
  return (
    <section className="bg-white py-[7%] max-md:py-20">
      <div className="contenedor">
        <Titulo
          etiqueta="Para tu giro"
          titulo="La misma lógica, adaptada a lo que vendes."
          texto="Cambia la herramienta interactiva y el botón principal según tu negocio. La obsesión por el resultado es la misma."
        />
        <Aparece className="mt-[clamp(36px,4vw,64px)]">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {paginaViva.giros.map((g) => (
              <li key={g.giro} className="flex h-full flex-col justify-between rounded-2xl bg-humo p-5">
                <h3 className="text-[17px] font-semibold">{g.giro}</h3>
                <div className="mt-6">
                  <p className="text-[13px] text-gris">{g.herramienta}</p>
                  <p className="mt-2 flex items-center gap-2 text-[13px] font-semibold">
                    <span className="size-1.5 rounded-full bg-amarillo" />
                    {g.boton}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Aparece>
      </div>
    </section>
  );
}

export default function PaginaViva() {
  return (
    <>
      <Encabezado />
      <main className="relative z-10 overflow-clip rounded-b-[28px] bg-humo md:mb-[var(--alto-pie,0px)]">
        <PvHero />
        <PvContraste />
        <PvReels />
        <PvIdentidad />
        <PvTrabajaPorTi />
        <PvCampana />
        <PvSistema />
        <PvVolumen />
        <PvConfigurador />
        <PvLegal />
        <PvResultado />
        <Giros />
        <PvPreguntas />

        <section className="bg-black py-[8%] text-white max-md:py-24">
          <Aparece className="contenedor">
            <h2 className="titulo max-w-[18ch] text-[clamp(40px,6vw,96px)] leading-[0.98]">
              Que tu página trabaje <span className="text-amarillo">aunque tú descanses.</span>
            </h2>
            <div className="mt-10 flex flex-wrap gap-3">
              <Boton href="#arma-tu-proyecto" tono="amarillo">
                Solicita tu cotización <Flecha />
              </Boton>
              <Boton href={whatsapp("Hola Phot8can, tengo dudas sobre Página Viva.")} tono="contorno-claro" externo>
                Tengo dudas
              </Boton>
            </div>
          </Aparece>
        </section>
      </main>
      <Pie />

      {/* WhatsApp siempre visible */}
      <a
        href={whatsapp("Hola Phot8can, quiero mi Página Viva.")}
        target="_blank"
        rel="noopener"
        aria-label="Escríbenos por WhatsApp"
        className="fixed right-5 bottom-5 z-[55] grid size-14 place-items-center rounded-full bg-amarillo text-black shadow-lg transition-transform hover:scale-105 max-lg:bottom-24"
      >
        <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.2Z" />
        </svg>
      </a>
    </>
  );
}
