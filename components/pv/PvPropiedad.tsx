import { FormularioContacto } from "../FormularioContacto";
import { Aparece } from "../ui";
import { BarraAmarilla } from "./Marca";

const ANTES = [
  "La hizo un sobrino, un amigo o un proveedor que ya no contesta.",
  "Nadie sabe a nombre de quién quedó el dominio.",
  "No recuerdas dónde está el hosting ni las contraseñas.",
  "Un día deja de funcionar y no sabes a quién llamar.",
];

const EXPEDIENTE = [
  { dato: "Dominio", valor: "tunegocio.com", estado: "A tu nombre" },
  { dato: "Hospedaje", valor: "Nube de clase mundial", estado: "Activo" },
  { dato: "Accesos y permisos", valor: "En tu portal de cliente", estado: "Ordenados" },
  { dato: "Respaldos", valor: "Automáticos", estado: "Al día" },
  { dato: "Renovaciones", valor: "Avisos antes de vencer", estado: "Programadas" },
];

/** "Tu página siempre es tuya": el dolor de perder el acceso y cómo lo evitamos. */
export function PvPropiedad() {
  return (
    <section className="bg-white py-[7%] max-md:py-20">
      <div className="contenedor grid items-center gap-12 xl:grid-cols-[1fr_1fr] xl:gap-[5vw]">
        <Aparece>
          <p className="etiqueta">Siempre tuya</p>
          <h2 className="titulo mt-4 max-w-[14ch] text-[clamp(36px,4.6vw,72px)] leading-[1.02]">
            Tu página es tuya. <span className="text-amarillo">Siempre.</span>
          </h2>
          <BarraAmarilla className="mt-6" />
          <p className="mt-6 max-w-[44ch] text-[clamp(15px,1.15vw,18px)] leading-relaxed text-gris">
            Muchas páginas se pierden por no saber dónde viven. Con Página Viva todo queda ordenado y a tu nombre, y siempre
            puedes entrar con tu correo.
          </p>
          <ul className="mt-8 space-y-3">
            {ANTES.map((t) => (
              <li key={t} className="flex gap-3 text-[15px] text-black/45 line-through decoration-amarillo decoration-2">
                <span className="mt-[0.45em] size-2 shrink-0 rounded-full bg-black/15" />
                {t}
              </li>
            ))}
          </ul>
        </Aparece>

        <Aparece retraso={120}>
          <div className="rounded-[24px] border-2 border-black bg-white p-[clamp(20px,2.4vw,32px)] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="etiqueta text-[11px] text-black/50">Expediente de tu página</p>
                <p className="mt-1 text-[20px] font-bold">tunegocio.com</p>
              </div>
              <span className="flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-[11px] font-bold text-white">
                <span className="size-2 rounded-full bg-amarillo" />
                En línea
              </span>
            </div>
            <ul className="mt-6 divide-y divide-black/10">
              {EXPEDIENTE.map((e) => (
                <li key={e.dato} className="flex items-center justify-between gap-4 py-3.5">
                  <span>
                    <span className="block text-[12px] text-black/50">{e.dato}</span>
                    <span className="block text-[15px] font-semibold">{e.valor}</span>
                  </span>
                  <span className="shrink-0 rounded-full border-2 border-black px-3 py-1 text-[11px] font-bold">{e.estado}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-center gap-2 rounded-xl bg-humo px-4 py-3 text-[13px]">
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              ¿Olvidaste cómo entrar? Te mandamos un enlace a tu correo y listo.
            </p>
          </div>
        </Aparece>
      </div>
    </section>
  );
}

/** Cierre de la página con el formulario de contacto. */
export function PvContacto() {
  return (
    <section id="contacto" className="bg-black py-[8%] text-white max-md:py-24">
      <div className="contenedor grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-[5vw]">
        <Aparece>
          <p className="etiqueta text-amarillo">Hablemos</p>
          <h2 className="titulo mt-4 max-w-[16ch] text-[clamp(38px,5vw,84px)] leading-[0.98]">
            Que tu página trabaje <span className="text-amarillo">aunque tú descanses.</span>
          </h2>
          <BarraAmarilla className="mt-6" />
          <p className="mt-6 max-w-[42ch] text-[clamp(15px,1.2vw,18px)] leading-relaxed text-white/75">
            Déjanos tus datos y te escribimos por WhatsApp en minutos. Sin compromiso: platicamos de tu negocio y te
            decimos qué necesita tu página.
          </p>
          <ul className="mt-8 space-y-3 text-[15px] text-white/80">
            {["Respuesta en minutos por WhatsApp", "Cotización clara, sin letras chiquitas", "Tu página lista en 10 días hábiles"].map(
              (t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid size-5 place-items-center rounded-full bg-amarillo text-[11px] text-black">✓</span>
                  {t}
                </li>
              ),
            )}
          </ul>
        </Aparece>
        <Aparece retraso={120}>
          <div className="rounded-[24px] border border-white/15 bg-white/[0.04] p-[clamp(20px,2.6vw,36px)]">
            <FormularioContacto origen="Página Viva · formulario web" oscuro />
          </div>
        </Aparece>
      </div>
    </section>
  );
}
