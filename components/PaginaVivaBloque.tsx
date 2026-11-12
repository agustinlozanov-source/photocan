import { paginaViva, whatsapp } from "@/lib/content";
import { Aparece, Boton, Flecha } from "./ui";

/** Servicio estrella en el home: Página Viva. */
export function PaginaVivaBloque() {
  return (
    <section id="pagina-viva" className="bg-amarillo py-[7%] text-black max-md:py-20">
      <div className="contenedor">
        <Aparece className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="subtitulo text-[12px]">Nuevo · Página Viva</p>
            <h2 className="titulo mt-5 max-w-[16ch] text-[clamp(38px,5.2vw,84px)] leading-[0.98]">{paginaViva.dolor}</h2>
          </div>
          <div>
            <p className="max-w-[40ch] text-[clamp(15px,1.2vw,18px)] leading-relaxed">
              Página Viva es una página web que atiende, vende y cuenta. Contesta a tus clientes a cualquier hora, y
              cada mes te dice cuántos te trajo.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Boton href="/pagina-viva/" tono="negro">
                Conocer Página Viva <Flecha />
              </Boton>
              <Boton href={whatsapp("Hola Phot8can, quiero mi Página Viva.")} tono="contorno-oscuro" externo>
                Quiero la mía
              </Boton>
            </div>
          </div>
        </Aparece>

        <div className="mt-[clamp(40px,5vw,80px)] grid gap-3 md:grid-cols-3">
          {paginaViva.promesas.map((p, i) => (
            <Aparece key={p.titulo} retraso={i * 120}>
              <div className="flex h-full min-h-[220px] flex-col justify-between rounded-2xl bg-black p-7 text-white">
                <span className="text-[13px] text-amarillo tabular-nums">0{i + 1}</span>
                <div>
                  <h3 className="titulo text-[clamp(24px,2.2vw,34px)] leading-tight">{p.titulo}.</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/70">{p.texto}</p>
                </div>
              </div>
            </Aparece>
          ))}
        </div>
      </div>
    </section>
  );
}
