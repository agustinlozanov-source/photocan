import { whatsapp } from "@/lib/content";
import { Boton, Flecha } from "./ui";

export function Hero() {
  return (
    <section id="inicio" className="relative isolate min-h-[100svh] overflow-hidden bg-black text-white">
      <div aria-hidden className="hero-brillo absolute inset-0 -z-20" />
      {/* El isotipo «8» como silueta sobre la luz mostaza. */}
      <img
        src="/marca/isotipo_negro.png"
        alt=""
        aria-hidden
        className="flotar absolute top-1/2 -right-[10vw] -z-10 w-[78vw] max-w-[1250px] max-md:top-[93%] max-md:-right-[30vw] max-md:w-[135vw]"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="contenedor flex min-h-[100svh] flex-col justify-center pt-28 pb-28 max-md:justify-start max-md:pt-36">
        <h1 className="titulo subir max-w-[13ch] text-[clamp(46px,7.2vw,116px)] leading-[0.98]">
          Hacemos que tu marca{" "}
          <span className="relative inline-grid h-[0.78em] w-[1.15em] translate-y-[0.06em] place-items-center rounded-[0.16em] bg-amarillo align-baseline">
            <img src="/marca/isotipo_negro.png" alt="" className="w-[78%]" />
          </span>{" "}
          se vea.
        </h1>
        <p className="subir mt-8 max-w-[44ch] text-[clamp(15px,1.25vw,18px)] leading-relaxed text-white/80" style={{ ["--d" as string]: "150ms" }}>
          Phot8can es una agencia creativa que transforma ideas en imagen. Unimos la mirada visual con la estrategia
          digital para construir marcas con presencia y carácter.
        </p>
        <div className="subir mt-10 flex flex-wrap gap-3" style={{ ["--d" as string]: "300ms" }}>
          <Boton href="#proyectos" tono="blanco">
            Ver proyectos <Flecha />
          </Boton>
          <Boton href={whatsapp()} tono="contorno-claro" externo>
            Cotizar proyecto
          </Boton>
        </div>
      </div>

      <a
        href="#nosotros"
        className="subtitulo absolute right-[5vw] bottom-8 flex items-center gap-3 text-[11px] text-white/70 hover:text-white max-md:hidden"
      >
        Desliza para explorar
        <svg viewBox="0 0 10 14" className="h-3.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
          <path d="M5 1v12M1 9l4 4 4-4" />
        </svg>
      </a>
    </section>
  );
}
