import { contraste, legal, preguntas, reporte, sistema } from "@/lib/pagina-viva";
import { Aparece } from "../ui";
import { BarraAmarilla } from "./Marca";

export function Encabezado({
  etiqueta,
  titulo,
  texto,
  claro = false,
}: {
  etiqueta: string;
  titulo: React.ReactNode;
  texto?: string;
  claro?: boolean;
}) {
  return (
    <Aparece className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
      <div>
        <p className={`etiqueta ${claro ? "text-amarillo" : ""}`}>{etiqueta}</p>
        <h2 className="titulo mt-4 max-w-[18ch] text-[clamp(34px,4.4vw,68px)] leading-[1.02]">{titulo}</h2>
        <BarraAmarilla className="mt-6" />
      </div>
      {texto && (
        <p className={`max-w-[44ch] text-[clamp(15px,1.15vw,18px)] leading-relaxed ${claro ? "text-white/70" : "text-gris"}`}>
          {texto}
        </p>
      )}
    </Aparece>
  );
}

/** Lo que hacen todos contra lo que hace Página Viva. */
export function PvContraste() {
  return (
    <section className="contenedor py-[7%] max-md:py-20">
      <Aparece className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <h2 className="titulo max-w-[16ch] text-[clamp(36px,4.8vw,76px)] leading-[1.02]">
          ¿Cuántos clientes{" "}
          <span className="relative inline-block">
            se van
            <span aria-hidden className="absolute inset-x-[-4%] top-[52%] h-[0.16em] -translate-y-1/2 bg-amarillo" />
          </span>{" "}
          porque no encuentran lo que necesitan?
        </h2>
        <p className="max-w-[44ch] text-[clamp(15px,1.15vw,18px)] leading-relaxed text-gris">
          Casi todas las agencias ofrecen 4 o 5 paquetes y te dejan elegir secciones de una lista. Página Viva empieza por
          entender cómo vende tu negocio y qué busca tu cliente.
        </p>
      </Aparece>
      <div className="mt-[clamp(36px,4vw,64px)] grid gap-3 md:grid-cols-2">
        <Aparece>
          <div className="h-full rounded-[24px] bg-white p-[clamp(24px,3vw,44px)]">
            <p className="text-[13px] font-semibold text-black/40">Lo que hacen todos</p>
            <ul className="mt-6 space-y-4">
              {contraste.ellos.map((t) => (
                <li key={t} className="flex gap-4 text-[clamp(16px,1.3vw,20px)] text-black/40 line-through decoration-black/20">
                  <span className="mt-[0.35em] size-2 shrink-0 rounded-full bg-black/15" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Aparece>
        <Aparece retraso={120}>
          <div className="h-full rounded-[24px] bg-black p-[clamp(24px,3vw,44px)] text-white">
            <p className="text-[13px] font-semibold text-amarillo">Lo que hace Página Viva</p>
            <ul className="mt-6 space-y-4">
              {contraste.nosotros.map((t) => (
                <li key={t} className="flex gap-4 text-[clamp(16px,1.3vw,20px)] font-semibold">
                  <span className="mt-[0.1em] grid size-5 shrink-0 place-items-center rounded-full bg-amarillo text-[11px] text-black">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Aparece>
      </div>
    </section>
  );
}

/** El tablero de conexiones técnicas. */
export function PvSistema() {
  return (
    <section className="bg-black py-[7%] text-white max-md:py-20">
      <div className="contenedor">
        <Encabezado
          claro
          etiqueta="Conectada de verdad"
          titulo="Lo que no se ve también se entrega."
          texto="Una página bonita que nadie mide no sirve. La tuya sale conectada a tus redes, a Google y a tu WhatsApp desde el primer día, para que cada peso en anuncios cuente."
        />
        <ul className="mt-[clamp(36px,4vw,64px)] grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {sistema.map((s, i) => (
            <Aparece key={s.nombre} retraso={(i % 5) * 80}>
              <li className="group flex h-full min-h-[170px] flex-col justify-between rounded-2xl border border-white/12 bg-white/[0.03] p-5 transition-colors hover:border-amarillo/60">
                <span className="flex items-center gap-2 text-[11px] text-white/50">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amarillo opacity-60 motion-reduce:hidden" />
                    <span className="relative inline-flex size-2 rounded-full bg-amarillo" />
                  </span>
                  Conectado
                </span>
                <div>
                  <h3 className="text-[17px] font-semibold">{s.nombre}</h3>
                  <p className="mt-1.5 text-[13px] leading-snug text-white/55">{s.detalle}</p>
                </div>
              </li>
            </Aparece>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PvLegal() {
  return (
    <section className="bg-white py-[7%] max-md:py-20">
      <div className="contenedor">
        <Encabezado
          etiqueta="Verdad y legalidad"
          titulo="Si tu página pide datos, también los cuida."
          texto="La mayoría copia un aviso de privacidad de internet. Nosotros lo hacemos para tu negocio, con los datos que de verdad recabas y para lo que los usas."
        />
        <div className="mt-[clamp(36px,4vw,64px)] grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {legal.map((l, i) => (
            <Aparece key={l.titulo} retraso={i * 100}>
              <div className="h-full rounded-2xl bg-humo p-6">
                <span className="titulo text-[13px] text-black/40 tabular-nums">0{i + 1}</span>
                <h3 className="mt-6 text-[18px] font-semibold">{l.titulo}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-gris">{l.texto}</p>
              </div>
            </Aparece>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Obsesión por el resultado: un reporte mensual de ejemplo. */
export function PvResultado() {
  return (
    <section className="bg-amarillo py-[7%] max-md:py-20">
      <div className="contenedor grid items-center gap-[5vw] lg:grid-cols-2">
        <Aparece>
          <p className="etiqueta">Obsesionados con el resultado</p>
          <h2 className="titulo mt-4 max-w-[16ch] text-[clamp(34px,4.4vw,68px)] leading-[1.02]">
            Cada mes te decimos cuántos clientes trajo.
          </h2>
          <p className="mt-6 max-w-[44ch] text-[clamp(15px,1.15vw,18px)] leading-relaxed">
            No entregamos y desaparecemos. Tu página se mide, se actualiza por temporada y te manda un reporte claro: qué
            funcionó, de dónde llegaron y qué vamos a mejorar.
          </p>
        </Aparece>
        <Aparece retraso={120}>
          <div className="rounded-[24px] bg-black p-[clamp(24px,3vw,40px)] text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold">Reporte mensual</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/60">Ejemplo</span>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {reporte.map((r) => (
                <div key={r.dato} className="rounded-xl bg-white/[0.06] p-5">
                  <p className="titulo text-[clamp(30px,3vw,44px)] leading-none text-amarillo">{r.valor}</p>
                  <p className="mt-2 text-[13px] text-white/60">{r.dato}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex h-20 items-end gap-1.5" aria-hidden>
              {[30, 42, 38, 55, 48, 62, 58, 70, 66, 78, 74, 90].map((h, i) => (
                <span key={i} className="flex-1 rounded-t bg-amarillo/80" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </Aparece>
      </div>
    </section>
  );
}

export function PvPreguntas() {
  return (
    <section className="contenedor py-[7%] max-md:py-20">
      <Encabezado etiqueta="Preguntas" titulo="Lo que más nos preguntan." />
      <div className="mt-[clamp(36px,4vw,64px)] border-b border-black/10">
        {preguntas.map((q) => (
          <details key={q.p} className="group border-t border-black/10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[clamp(17px,1.5vw,22px)] font-semibold [&::-webkit-details-marker]:hidden">
              {q.p}
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-black/15 text-[18px] transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="max-w-[64ch] pb-6 text-[15px] leading-relaxed text-gris">{q.r}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
