import type { Metadata } from "next";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import { Aparece, Boton, Flecha } from "@/components/ui";
import { paginaViva as pv, whatsapp } from "@/lib/content";

export const metadata: Metadata = {
  title: "Página Viva · Phot8can",
  description: `${pv.dolor} Página Viva es una página web hecha a tu medida que atiende 24/7 y cada mes te dice cuántos clientes trajo.`,
};

const QUIERO = whatsapp("Hola Phot8can, quiero mi Página Viva.");

/** El único botón principal de la página, siempre igual. */
function BotonPrincipal({ tono = "amarillo" }: { tono?: "amarillo" | "negro" }) {
  return (
    <Boton href={QUIERO} tono={tono} externo>
      Quiero mi Página Viva <Flecha />
    </Boton>
  );
}

function Titulo({ etiqueta, children, claro = false }: { etiqueta: string; children: React.ReactNode; claro?: boolean }) {
  return (
    <Aparece>
      <p className={`subtitulo text-[12px] ${claro ? "text-amarillo" : ""}`}>{etiqueta}</p>
      <h2 className="titulo mt-4 max-w-[20ch] text-[clamp(34px,4.4vw,68px)] leading-[1.02]">{children}</h2>
    </Aparece>
  );
}

export default function PaginaViva() {
  return (
    <>
      <Encabezado />
      <main className="relative z-10 overflow-clip rounded-b-[28px] bg-humo md:mb-[var(--alto-pie,0px)]">
        {/* Inicio: dolor + promesa + botón */}
        <section className="relative isolate overflow-hidden bg-black text-white">
          <div aria-hidden className="hero-brillo absolute inset-0 -z-20 opacity-70" />
          <img
            src="/marca/isotipo_negro.png"
            alt=""
            aria-hidden
            className="flotar absolute top-1/2 -right-[14vw] -z-10 w-[70vw] max-w-[1100px] max-md:top-[105%] max-md:-right-[40vw] max-md:w-[140vw]"
          />
          <div className="contenedor flex min-h-[100svh] flex-col justify-center pt-32 pb-24">
            <p className="subtitulo subir text-[12px] text-amarillo [--entrada:0ms]">Página Viva · por Phot8can</p>
            <h1 className="titulo subir mt-6 max-w-[15ch] text-[clamp(42px,6.6vw,108px)] leading-[0.98] [--entrada:0ms]">
              {pv.dolor}
            </h1>
            <p
              className="subir mt-8 max-w-[40ch] text-[clamp(16px,1.35vw,20px)] leading-relaxed text-white/80 [--entrada:0ms]"
              style={{ ["--d" as string]: "150ms" }}
            >
              Página Viva sí le contesta. No es una página bonita: es una página que atiende, vende y cuenta.
            </p>
            <div className="subir mt-10 flex flex-wrap items-center gap-5 [--entrada:0ms]" style={{ ["--d" as string]: "300ms" }}>
              <BotonPrincipal />
              <a href="#incluye" className="text-[14px] font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline">
                Ver qué incluye
              </a>
            </div>
          </div>
        </section>

        {/* Promesas */}
        <section className="bg-amarillo py-[7%] max-md:py-20">
          <div className="contenedor">
            <Titulo etiqueta="Tres promesas">Hecha a tu medida, despierta toda la noche y siempre al día.</Titulo>
            <div className="mt-[clamp(36px,4vw,64px)] grid gap-3 md:grid-cols-3">
              {pv.promesas.map((p, i) => (
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

        {/* Lo que le pasa hoy a tu cliente */}
        <section className="contenedor py-[7%] max-md:py-20">
          <Titulo etiqueta="Lo que le pasa hoy a tu cliente">Antes de comprarte, tu cliente tiene dudas.</Titulo>
          <ul className="mt-[clamp(36px,4vw,64px)] grid gap-3 md:grid-cols-3">
            {pv.hoy.map((f, i) => (
              <Aparece key={f} retraso={i * 120}>
                <li className="flex h-full min-h-[180px] items-end rounded-2xl bg-white p-7">
                  <p className="titulo text-[clamp(22px,2vw,30px)] leading-tight">{f}</p>
                </li>
              </Aparece>
            ))}
          </ul>
          <Aparece className="mt-8">
            <p className="max-w-[60ch] text-[15px] leading-relaxed text-gris">
              Cada sección de tu Página Viva contesta una de esas dudas, en el orden en que llegan: ¿me entienden?, ¿es
              para mí?, ¿cuánto cuesta?, ¿es confiable?, ¿cómo le hago?
            </p>
          </Aparece>
        </section>

        {/* Cómo funciona */}
        <section className="bg-white py-[7%] max-md:py-20">
          <div className="contenedor">
            <Titulo etiqueta="Cómo funciona">Tres pasos y tu página empieza a atender.</Titulo>
            <ol className="mt-[clamp(36px,4vw,64px)] grid gap-8 md:grid-cols-3">
              {pv.pasos.map((p, i) => (
                <Aparece key={p.titulo} retraso={i * 120}>
                  <li className="border-t-2 border-black pt-6">
                    <span className="titulo text-[48px] leading-none text-amarillo">{i + 1}</span>
                    <h3 className="mt-4 text-[20px] font-semibold">{p.titulo}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-gris">{p.texto}</p>
                  </li>
                </Aparece>
              ))}
            </ol>
          </div>
        </section>

        {/* Qué incluye: las 11 secciones + por dentro */}
        <section id="incluye" className="bg-black py-[7%] text-white max-md:py-20">
          <div className="contenedor">
            <Titulo etiqueta="Qué incluye" claro>
              Once secciones, en el orden en que tu cliente decide.
            </Titulo>
            <ol className="mt-[clamp(36px,4vw,64px)] gap-x-[4vw] md:columns-2 [&>li]:break-inside-avoid">
              {pv.secciones.map((s, i) => (
                <li key={s} className="flex items-baseline gap-5 border-t border-white/15 py-4">
                  <span className="w-6 text-[13px] text-amarillo tabular-nums">{String(i).padStart(2, "0")}</span>
                  <span className="text-[16px]">{s}</span>
                </li>
              ))}
              <li className="flex items-baseline gap-5 border-t border-white/15 py-4">
                <span className="w-6 text-[13px] text-amarillo">+</span>
                <span className="text-[16px] font-semibold">Agente 24/7 en chat y WhatsApp: contesta, cotiza y agenda</span>
              </li>
            </ol>

            <p className="subtitulo mt-[clamp(48px,6vw,96px)] text-[12px] text-amarillo">Por dentro, también incluido</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {pv.porDentro.map((d, i) => (
                <Aparece key={d.titulo} retraso={i * 100}>
                  <div className="h-full rounded-2xl border border-white/15 p-6">
                    <h3 className="text-[18px] font-semibold">{d.titulo}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-white/65">{d.texto}</p>
                  </div>
                </Aparece>
              ))}
            </div>
          </div>
        </section>

        {/* Ocho giros */}
        <section className="contenedor py-[7%] max-md:py-20">
          <Titulo etiqueta="Para tu giro">La misma página, adaptada a lo que vendes.</Titulo>
          <Aparece className="mt-[clamp(36px,4vw,64px)]">
            <div className="overflow-hidden rounded-2xl bg-white">
              <div className="grid grid-cols-3 gap-4 border-b border-black/10 px-6 py-4 text-[12px] text-black/50 max-md:hidden">
                <span>Giro</span>
                <span>Herramienta interactiva</span>
                <span>Botón principal</span>
              </div>
              <ul>
                {pv.giros.map((g) => (
                  <li key={g.giro} className="grid gap-1 border-b border-black/10 px-6 py-5 last:border-0 md:grid-cols-3 md:gap-4">
                    <span className="text-[17px] font-semibold">{g.giro}</span>
                    <span className="text-[15px] text-gris">{g.herramienta}</span>
                    <span className="flex items-center gap-2 text-[15px]">
                      <span className="size-1.5 rounded-full bg-amarillo" />
                      {g.boton}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Aparece>
        </section>

        {/* Base y módulos */}
        <section className="bg-white py-[7%] max-md:py-20">
          <div className="contenedor grid gap-[4vw] lg:grid-cols-2">
            <Aparece>
              <p className="subtitulo text-[12px]">Incluido en la base</p>
              <p className="titulo mt-5 text-[clamp(26px,2.6vw,40px)] leading-[1.15]">{pv.incluye}</p>
              <p className="mt-5 text-[14px] text-gris">El dominio y el hospedaje se pagan aparte.</p>
            </Aparece>
            <Aparece retraso={120}>
              <p className="subtitulo text-[12px]">Módulos que se suman</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {pv.modulos.map((m) => (
                  <li key={m} className="rounded-full border border-black/15 px-4 py-2 text-[14px]">
                    {m}
                  </li>
                ))}
              </ul>
              <p className="subtitulo mt-12 text-[12px]">Lo que necesitamos de ti</p>
              <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {pv.necesitamos.map((n) => (
                  <li key={n} className="flex gap-3 text-[15px]">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amarillo" />
                    {n}
                  </li>
                ))}
              </ul>
            </Aparece>
          </div>
        </section>

        {/* Cierre: la promesa otra vez y el botón principal */}
        <section className="contenedor py-[8%] max-md:py-24">
          <Aparece>
            <h2 className="titulo max-w-[18ch] text-[clamp(40px,6vw,96px)] leading-[0.98]">
              Que tu página conteste <span className="text-amarillo">aunque estés dormido.</span>
            </h2>
            <div className="mt-10">
              <BotonPrincipal tono="negro" />
            </div>
          </Aparece>
        </section>
      </main>
      <Pie />

      {/* WhatsApp siempre visible */}
      <a
        href={QUIERO}
        target="_blank"
        rel="noopener"
        aria-label="Escríbenos por WhatsApp"
        className="fixed right-5 bottom-5 z-[60] grid size-14 place-items-center rounded-full bg-amarillo text-black shadow-lg transition-transform hover:scale-105"
      >
        <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.2Z" />
        </svg>
      </a>
    </>
  );
}
