import { Aparece } from "../ui";
import { BarraAmarilla } from "./Marca";

function Esquina({ className }: { className: string }) {
  return <span aria-hidden className={`absolute size-4 border-2 border-black bg-amarillo ${className}`} />;
}

/** "Tu negocio tiene una identidad. Tu web también debería tenerla." */
export function PvIdentidad() {
  return (
    <section className="bg-white py-[7%] max-md:py-20">
      <div className="contenedor grid items-center gap-12 xl:grid-cols-[0.9fr_1.1fr] xl:gap-[5vw]">
        <Aparece>
          <h2 className="titulo leading-[0.95]">
            <span className="block text-[clamp(30px,3.4vw,54px)]">Tu negocio tiene una</span>
            <span className="block text-[clamp(64px,8.4vw,136px)] tracking-[-0.05em]">identidad.</span>
          </h2>
          <BarraAmarilla className="mt-6" />
          <p className="mt-6 text-[clamp(24px,2.6vw,40px)] leading-tight">Tu web también debería tenerla.</p>
          <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed text-gris">
            Nada de plantillas con tu logo encima. Tu Página Viva nace de tu marca: tu tipografía, tus colores y tus
            botones, ordenados en un sistema que se ve igual en todas las páginas.
          </p>
        </Aparece>

        <Aparece retraso={120}>
          <p className="etiqueta">Estructura</p>
          <div className="relative mt-3 border-2 border-dashed border-black/70 p-[clamp(18px,2.6vw,36px)]">
            <Esquina className="-top-2 -left-2" />
            <Esquina className="-right-2 -bottom-2" />

            <p className="etiqueta text-[11px]">Navegación</p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border-2 border-black bg-white px-4 py-3 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.5)]">
              <span className="text-[13px] font-extrabold tracking-[0.2em] whitespace-nowrap">TU MARCA</span>
              <span className="flex items-center gap-4 text-[12px] font-semibold max-sm:hidden">
                <span>Inicio</span>
                <span>Servicios</span>
                <span>Nosotros</span>
                <span className="rounded-full bg-black px-3.5 py-1.5 text-white">Contacto</span>
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
              <div>
                <p className="etiqueta text-[11px]">Tipografía</p>
                <div className="mt-3 flex aspect-[4/4.3] -rotate-2 flex-col justify-between rounded-xl bg-black p-4 text-white shadow-xl max-sm:aspect-[3/1.4]">
                  <span className="titulo text-[clamp(56px,6vw,96px)] leading-none">Aa</span>
                  <span className="text-[10px] leading-snug font-bold tracking-[0.12em] uppercase">Montserrat<br />ExtraBold</span>
                </div>
              </div>
              <div>
                <p className="etiqueta text-[11px]">Color</p>
                <div className="mt-3 flex aspect-[4/4.3] flex-col justify-center gap-4 rounded-xl border-2 border-black bg-white p-4 max-sm:aspect-auto">
                  {[
                    ["#F3AF0E", "bg-amarillo"],
                    ["#000000", "bg-black"],
                    ["#FFFFFF", "bg-white border-2 border-black"],
                  ].map(([hex, c]) => (
                    <span key={hex} className="flex items-center gap-3 text-[12px] font-semibold">
                      <span className={`size-[clamp(26px,2.6vw,40px)] shrink-0 rounded-full ${c}`} />
                      {hex}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="etiqueta text-[11px]">Componentes</p>
                <div className="mt-3 flex aspect-[4/4.3] rotate-2 flex-col justify-center gap-3 rounded-xl border-2 border-black bg-white p-4 shadow-xl max-sm:aspect-auto">
                  <span className="rounded-full bg-black py-2.5 text-center text-[12px] font-bold text-white">Agenda tu cita</span>
                  <span className="rounded-full bg-amarillo py-2.5 text-center text-[12px] font-bold">Agenda tu cita</span>
                  <span className="rounded-full border-2 border-black py-2 text-center text-[12px] font-bold">Agenda tu cita</span>
                </div>
              </div>
            </div>
          </div>
        </Aparece>
      </div>
    </section>
  );
}

const AVISOS = [
  { t: "Nueva solicitud de cotización", d: "Desde tu web · 2:47 a. m." },
  { t: "Mensaje desde tu web", d: "1:15 a. m." },
  { t: "Cita agendada", d: "11:52 p. m." },
];

/** "Imagina que tu negocio trabaja por ti, incluso cuando no estás." */
export function PvTrabajaPorTi() {
  return (
    <section className="overflow-hidden bg-black py-[7%] text-white max-md:py-20">
      <div className="contenedor">
        <Aparece>
          <h2 className="titulo leading-[0.98]">
            <span className="block text-[clamp(32px,4vw,64px)]">Imagina que tu negocio</span>
            <span className="block text-[clamp(52px,7vw,112px)] tracking-[-0.04em]">trabaja por ti,</span>
          </h2>
          <BarraAmarilla className="mt-4" />
          <p className="titulo mt-6 text-[clamp(32px,4vw,64px)] leading-none">incluso cuando no estás.</p>
        </Aparece>

        <div className="relative mt-14 lg:mt-20">
          {/* Laptop */}
          <Aparece className="w-[min(100%,820px)] max-lg:w-full">
            <div className="rounded-t-[18px] bg-[#222] p-3 pb-0">
              <div className="overflow-hidden rounded-t-lg bg-white text-black">
                <div className="flex items-center justify-between border-b-2 border-black px-6 py-4">
                  <span className="text-[14px] font-extrabold tracking-[0.25em]">CASA OLIVO</span>
                  <span className="flex gap-5 text-[13px] font-semibold max-sm:hidden">
                    <span>Menú</span>
                    <span>Reservas</span>
                    <span>Ubicación</span>
                  </span>
                </div>
                <div className="grid items-center gap-6 p-6 sm:grid-cols-[1.2fr_1fr] md:p-8">
                  <div>
                    <p className="etiqueta text-[11px]">Abierto hoy</p>
                    <p className="titulo mt-3 text-[clamp(26px,3vw,44px)] leading-[1.02]">Reserva tu mesa en línea.</p>
                    <p className="mt-3 max-w-[30ch] text-[14px] leading-relaxed text-black/70">
                      Elige día, hora y número de personas en menos de un minuto.
                    </p>
                    <span className="mt-5 inline-block rounded-full bg-amarillo px-5 py-2.5 text-[13px] font-bold">Reservar ahora</span>
                  </div>
                  <div className="grid aspect-square place-items-center rounded-xl bg-black max-sm:hidden">
                    <span className="grid size-[55%] place-items-center rounded-full bg-amarillo">
                      <span className="size-[45%] rounded-full bg-white" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-[-3%] h-5 rounded-b-xl bg-[#d9d9d9]">
              <div className="mx-auto h-2 w-[18%] rounded-b-md bg-[#bdbdbd]" />
            </div>
          </Aparece>

          {/* Celular */}
          <Aparece
            retraso={200}
            className="right-0 bottom-[-6%] w-[min(86vw,320px)] max-lg:mx-auto max-lg:mt-10 lg:absolute lg:w-[clamp(280px,24vw,330px)]"
          >
            <div className="rounded-[44px] border-[3px] border-white bg-black px-5 pt-4 pb-10 shadow-2xl">
              <div className="mx-auto h-7 w-[38%] rounded-full bg-[#222]" />
              <p className="mt-6 text-center text-[15px]">sábado 14 de noviembre</p>
              <p className="text-center text-[clamp(64px,6vw,84px)] leading-none font-extralight">2:47</p>
              <ul className="mt-6 space-y-2.5">
                {AVISOS.map((a, i) => (
                  <Aparece key={a.t} retraso={500 + i * 250}>
                    <li className="flex gap-3 rounded-2xl bg-white p-3.5 text-black">
                      <span className="mt-0.5 size-6 shrink-0 rounded-md bg-amarillo" />
                      <span>
                        <span className="block text-[14px] leading-tight font-bold">{a.t}</span>
                        <span className="mt-0.5 block text-[12px] text-black/70">{a.d}</span>
                      </span>
                    </li>
                  </Aparece>
                ))}
              </ul>
            </div>
          </Aparece>
        </div>

        <p className="mt-16 text-[clamp(20px,2.2vw,32px)] font-medium lg:mt-24">
          Tu web atiende e informa <span className="titulo text-amarillo">las 24 horas.</span>
        </p>
      </div>
    </section>
  );
}
