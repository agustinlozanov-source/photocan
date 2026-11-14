"use client";

import { useEffect, useState } from "react";
import { Cargando } from "@/components/portal/Alta";
import { IconoPortal } from "@/components/portal/Iconos";
import { BotonPortal, Encabezado, Tarjeta } from "@/components/portal/Piezas";
import { cargarBriefing, setBriefing, useFuenteBriefing } from "@/lib/briefing-fuente";
import { DISENOS, GIROS, POR_REFERENCIA, PROPUESTA, capturaDe, demoDe, disenoPorId, type Diseno, type Giro } from "@/lib/disenos";

const elegir = (valor: string) => setBriefing((b) => ({ ...b, respuestas: { ...b.respuestas, plantilla: valor } }));

export default function Disenos() {
  const f = useFuenteBriefing();
  const [giro, setGiro] = useState<Giro | "todos">("todos");

  useEffect(() => {
    if (f.modo === "cargando" && f.orgId) cargarBriefing(f.orgId);
  }, [f.modo, f.orgId]);

  if (f.modo === "cargando") return <Cargando />;

  const elegido = String(f.b.respuestas.plantilla ?? "");
  const actual = disenoPorId(elegido);
  const lista = giro === "todos" ? DISENOS : DISENOS.filter((d) => d.giros.includes(giro));
  const yaEnviado = Boolean(f.b.enviado);

  return (
    <div className="mx-auto max-w-[1240px]">
      <Encabezado
        etiqueta="Diseños"
        titulo={
          <>
            Elige cómo se ve tu página. <span className="text-black/35">Tu contenido, su estilo.</span>
          </>
        }
      />

      <Tarjeta oscura className="relative mb-6 overflow-hidden">
        <div className="hero-brillo pointer-events-none absolute -top-40 -right-32 size-[460px] rounded-full opacity-40 blur-2xl" />
        <div className="relative grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-[13px] font-bold text-amarillo">{actual ? "Tu diseño" : elegido === POR_REFERENCIA ? "Tu página de referencia" : elegido === PROPUESTA ? "Propuesta de Phot8can" : "Cómo funciona"}</p>
            <p className="mt-2 text-[clamp(20px,2.2vw,26px)] leading-snug font-bold">
              {actual
                ? `${actual.nombre}: ${actual.lema.toLowerCase()}.`
                : elegido === POR_REFERENCIA
                  ? "Tomamos el estilo de la página que te gusta y lo hacemos tuyo."
                  : elegido === PROPUESTA
                    ? "Nuestro equipo elige el diseño que mejor le queda a tu negocio."
                    : "Elige un diseño y lo vestimos con tus colores, tu logo, tus fotos y tus textos."}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-white/60">
              Ningún sitio sale igual a otro: el diseño marca el ritmo, las animaciones y la estructura; tu marca pone todo lo demás.
              {yaEnviado && " Si tu página ya está en construcción o publicada, cambiar de diseño se pide como un cambio."}
            </p>
          </div>
          <div className="grid gap-2 text-[13px]">
            {[
              ["chispa", "Animaciones finas que funcionan bien en celular"],
              ["imagen", "Se adapta a tus colores, fuentes y fotos"],
              ["ojo", "Ve el demo en vivo antes de decidir"],
            ].map(([icono, texto]) => (
              <p key={texto} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3">
                <IconoPortal nombre={icono as "chispa"} className="size-4 text-amarillo" />
                {texto}
              </p>
            ))}
          </div>
        </div>
      </Tarjeta>

      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por giro">
        {GIROS.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={giro === g.id}
            onClick={() => setGiro(g.id)}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${giro === g.id ? "bg-black text-white" : "bg-white text-black/60 ring-1 ring-black/[0.08] hover:text-black"}`}
          >
            {g.texto}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {lista.map((d) => (
          <TarjetaDiseno key={d.id} d={d} elegido={elegido === d.id} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Alternativa
          activa={elegido === POR_REFERENCIA}
          icono="ojo"
          titulo="Tengo una página que me gusta"
          texto="Pásanos el enlace en tu brief y tomamos su estilo (estructura, ritmo y sensación) sin copiar textos, fotos ni marcas."
          boton="Usar mi referencia"
          alElegir={() => elegir(POR_REFERENCIA)}
          extra={
            <a href="/portal/briefing/" className="text-[12px] font-bold text-black/55 underline-offset-2 hover:text-black hover:underline">
              Poner el enlace en el brief
            </a>
          }
        />
        <Alternativa
          activa={elegido === PROPUESTA}
          icono="chispa"
          titulo="Que Phot8can proponga"
          texto="Con tu brief elegimos el diseño que mejor le queda a tu giro y a tu cliente. Lo ves en la primera versión."
          boton="Que lo elijan ustedes"
          alElegir={() => elegir(PROPUESTA)}
        />
      </div>
    </div>
  );
}

function TarjetaDiseno({ d, elegido }: { d: Diseno; elegido: boolean }) {
  return (
    <article className={`group flex min-w-0 flex-col overflow-hidden rounded-[22px] bg-white transition-shadow ${elegido ? "ring-2 ring-amarillo" : "border border-black/[0.07] hover:shadow-[0_24px_50px_-28px_rgb(0_0_0/0.35)]"}`}>
      <a href={demoDe(d.id)} target="_blank" rel="noopener" className="relative block p-3 pb-0" aria-label={`Ver el demo de ${d.nombre}`}>
        <div className="overflow-hidden rounded-t-[14px] ring-1 ring-black/[0.06]">
          <div className={`flex items-center gap-1.5 px-3 py-2 ${d.oscuro ? "bg-[#1d1814]" : "bg-humo"}`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`size-2 rounded-full ${d.oscuro ? "bg-white/20" : "bg-black/15"}`} />
            ))}
            <span className={`ml-2 truncate text-[10px] font-semibold ${d.oscuro ? "text-white/40" : "text-black/35"}`}>phot8can.studio{demoDe(d.id)}</span>
          </div>
          {/* Captura de toda la página: al pasar el mouse se recorre de arriba abajo. */}
          <div className="relative aspect-[16/11] overflow-hidden bg-humo">
            <img
              src={capturaDe(d.id)}
              alt={`Vista del diseño ${d.nombre}`}
              loading="lazy"
              className="absolute inset-x-0 top-0 w-full translate-y-0 transition-transform duration-[6s] ease-in-out group-hover:translate-y-[calc(-100%+var(--alto,300px))]"
              onLoad={(e) => {
                const img = e.currentTarget;
                img.style.setProperty("--alto", `${img.parentElement?.clientHeight ?? 300}px`);
              }}
            />
          </div>
        </div>
        <span className="absolute top-14 right-6 inline-flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1.5 text-[11px] font-bold text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <IconoPortal nombre="ojo" className="size-3.5" /> Ver demo en vivo
        </span>
        {elegido && (
          <span className="absolute top-14 left-6 inline-flex items-center gap-1.5 rounded-full bg-amarillo px-3 py-1.5 text-[11px] font-bold text-black">
            <IconoPortal nombre="check" className="size-3.5" /> Elegido
          </span>
        )}
      </a>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="titulo text-[26px] leading-none">{d.nombre}</h2>
            <p className="mt-1.5 text-[13px] font-semibold text-black/50">{d.lema}</p>
          </div>
          <span className="flex shrink-0 -space-x-1.5 pt-1" aria-label="Colores del demo">
            {d.colores.map((c) => (
              <span key={c} className="size-6 rounded-full ring-2 ring-white" style={{ background: c }} />
            ))}
          </span>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-black/65">{d.descripcion}</p>
        <p className="mt-4 text-[12px] font-bold text-black/40">Ideal para</p>
        <p className="mt-1 text-[13px] text-black/70">{d.ideal.join(" · ")}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {d.efectos.map((e) => (
            <li key={e} className="rounded-full bg-humo px-2.5 py-1 text-[11px] font-semibold text-black/60">
              {e}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-black/40">
          {d.estilo} · {d.fuentes}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <BotonPortal tono={elegido ? "amarillo" : "negro"} onClick={() => elegir(d.id)} className="flex-1">
            {elegido ? (
              <>
                <IconoPortal nombre="check" className="size-4" /> Elegido
              </>
            ) : (
              "Elegir"
            )}
          </BotonPortal>
          <BotonPortal tono="contorno" href={demoDe(d.id)} className="flex-1">
            Ver demo
          </BotonPortal>
        </div>
      </div>
    </article>
  );
}

function Alternativa({
  activa,
  icono,
  titulo,
  texto,
  boton,
  alElegir,
  extra,
}: {
  activa: boolean;
  icono: "ojo" | "chispa";
  titulo: string;
  texto: string;
  boton: string;
  alElegir: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <Tarjeta className={activa ? "!border-transparent ring-2 ring-amarillo" : ""}>
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-humo">
          <IconoPortal nombre={icono} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-bold">{titulo}</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-black/60">{texto}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <BotonPortal tono={activa ? "amarillo" : "contorno"} onClick={alElegir}>
              {activa ? (
                <>
                  <IconoPortal nombre="check" className="size-4" /> Elegido
                </>
              ) : (
                boton
              )}
            </BotonPortal>
            {extra}
          </div>
        </div>
      </div>
    </Tarjeta>
  );
}
