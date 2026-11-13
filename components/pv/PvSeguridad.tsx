import { LOGOS } from "@/lib/logos";
import { seguridad } from "@/lib/pagina-viva";
import { Aparece } from "../ui";
import { Encabezado } from "./PvSecciones";

function Escudo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
      <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" />
    </svg>
  );
}

/** Seguridad, normas e infraestructura: que se note sólida desde el principio. */
export function PvSeguridad() {
  return (
    <section id="seguridad" className="bg-humo py-[7%] max-md:py-20">
      <div className="contenedor">
        <Encabezado
          etiqueta="Seguridad y normas"
          titulo="No es una página cualquiera. Está construida como una aplicación."
          texto="Aplicamos los mismos estándares con los que desarrollamos aplicaciones: cifrado, desarrollo seguro, pagos certificados y manejo de datos conforme a la ley."
        />

        <div className="mt-[clamp(36px,4vw,64px)] grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {seguridad.map((s, i) => (
            <Aparece key={s.titulo} retraso={(i % 3) * 100}>
              <div className="flex h-full gap-4 rounded-2xl border-2 border-black bg-white p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-black text-amarillo">
                  <Escudo />
                </span>
                <div>
                  <h3 className="text-[17px] font-bold">{s.titulo}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-gris">{s.texto}</p>
                </div>
              </div>
            </Aparece>
          ))}
        </div>

        <Aparece className="mt-12 rounded-2xl bg-black px-6 py-7 text-white md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <p className="etiqueta shrink-0 text-amarillo">Infraestructura y tecnología</p>
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {LOGOS.map((l) => (
                <li key={l.nombre} className="flex items-center gap-2.5 text-white/75">
                  <svg viewBox={l.viewBox} className="size-[clamp(22px,2vw,28px)]" fill="currentColor" role="img" aria-label={l.nombre}>
                    <path d={l.d} />
                  </svg>
                  <span className="text-[clamp(15px,1.3vw,18px)] font-bold tracking-[-0.01em]">{l.nombre}</span>
                </li>
              ))}
            </ul>
          </div>
        </Aparece>
      </div>
    </section>
  );
}
