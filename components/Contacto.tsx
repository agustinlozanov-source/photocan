import { whatsapp } from "@/lib/content";
import { Aparece, Boton, Flecha } from "./ui";

export function Contacto() {
  return (
    <section id="contacto" className="contenedor bg-humo py-[8%] max-md:py-24">
      <Aparece>
        <h2 className="titulo max-w-[16ch] text-[clamp(42px,6.4vw,104px)] leading-[0.98]">
          ¿Tienes una idea? <span className="text-amarillo">Hagamos que se vea.</span>
        </h2>
        <div className="mt-[clamp(32px,4vw,64px)] flex flex-wrap items-center justify-between gap-6 border-t border-black/10 pt-8">
          <a href={whatsapp()} target="_blank" rel="noopener" className="text-[clamp(18px,1.6vw,24px)] font-semibold hover:text-amarillo">
            +52 868 107 9743
          </a>
          <Boton href={whatsapp()} tono="negro" externo>
            Escríbenos por WhatsApp <Flecha />
          </Boton>
        </div>
      </Aparece>
    </section>
  );
}
