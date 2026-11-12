import { whatsapp } from "@/lib/content";
import { Aparece, Boton, Flecha } from "./ui";

export function BodasBloque() {
  return (
    <section className="bg-black py-[7%] text-white max-md:py-20">
      <div className="contenedor grid items-center gap-[5vw] lg:grid-cols-2">
        <Aparece>
          <div className="overflow-hidden rounded-[24px]">
            <img
              src="/img/boda-retrato.webp"
              alt="Novia de espaldas con su ramo, en un pasillo con luz cálida"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover max-lg:aspect-[4/3]"
            />
          </div>
        </Aparece>
        <Aparece retraso={120}>
          <p className="subtitulo text-[12px] text-amarillo">Photocan Bodas</p>
          <h2 className="titulo mt-5 max-w-[14ch] text-[clamp(38px,4.6vw,76px)] leading-[0.98]">
            Su boda, contada con intención.
          </h2>
          <p className="mt-6 max-w-[42ch] text-[clamp(15px,1.2vw,18px)] leading-relaxed text-white/75">
            Fotografía y video para todo el día: preboda, getting ready, ceremonia y fiesta. Paquetes Bronze, Silver y
            Gold.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Boton href="/bodas/" tono="amarillo">
              Ver paquetes <Flecha />
            </Boton>
            <Boton href={whatsapp("Hola Phot8can, quiero consultar una fecha para mi boda.")} tono="contorno-claro" externo>
              Consultar fecha
            </Boton>
          </div>
        </Aparece>
      </div>
    </section>
  );
}
