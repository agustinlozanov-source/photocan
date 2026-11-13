import { portafolio } from "@/lib/pagina-viva";
import { Aparece, Flecha } from "../ui";
import { BarraAmarilla, Navegador } from "./Marca";

const RELLENO = [
  { cliente: "[Cliente]", giro: "[Giro]" },
  { cliente: "[Cliente]", giro: "[Giro]" },
  { cliente: "[Cliente]", giro: "[Giro]" },
];

function dominio(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Portafolio de páginas reales. Sin proyectos cargados, muestra tarjetas de relleno. */
export function PvPortafolio() {
  const vacio = portafolio.length === 0;
  return (
    <section id="portafolio" className="bg-black py-[7%] text-white max-md:py-20">
      <div className="contenedor">
        <Aparece className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="etiqueta text-amarillo">Portafolio</p>
            <h2 className="titulo mt-4 max-w-[16ch] text-[clamp(34px,4.4vw,68px)] leading-[1.02]">
              Una buena <span className="text-amarillo">primera impresión</span> abre oportunidades.
            </h2>
            <BarraAmarilla className="mt-6" />
          </div>
          <p className="max-w-[44ch] text-[clamp(15px,1.15vw,18px)] leading-relaxed text-white/70">
            Páginas reales de negocios reales. Ábrelas, recórrelas en tu celular y mira cómo atienden.
          </p>
        </Aparece>

        <div className="mt-[clamp(36px,4vw,64px)] grid gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
          {vacio
            ? RELLENO.map((p, i) => (
                <Aparece key={i} retraso={i * 100}>
                  <Navegador oscuro>
                    <div className="grid aspect-[16/10] place-items-center">
                      <span className="etiqueta text-[11px] text-white/70">[Captura de proyecto real]</span>
                    </div>
                  </Navegador>
                  <p className="etiqueta mt-4 text-[11px] text-white/70">
                    {p.cliente} · {p.giro}
                  </p>
                </Aparece>
              ))
            : portafolio.map((p, i) => (
                <Aparece key={p.url} retraso={(i % 3) * 100}>
                  <a href={p.url} target="_blank" rel="noopener" className="group block">
                    <Navegador oscuro url={dominio(p.url)}>
                      <div className="aspect-[16/10] overflow-hidden bg-[#1c1c1c]">
                        {p.captura ? (
                          <img
                            src={p.captura}
                            alt={`Página de ${p.cliente}`}
                            loading="lazy"
                            className="h-full w-full object-cover object-top transition-transform duration-[1.6s] ease-out group-hover:-translate-y-[8%]"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-[13px] text-white/50">{dominio(p.url)}</div>
                        )}
                      </div>
                    </Navegador>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className="etiqueta text-[11px] text-white/80">
                        {p.cliente} · {p.giro}
                      </p>
                      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-amarillo">
                        Ver página <Flecha className="size-3" />
                      </span>
                    </div>
                  </a>
                </Aparece>
              ))}
        </div>
      </div>
    </section>
  );
}
