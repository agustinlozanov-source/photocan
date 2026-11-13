"use client";

import { useState } from "react";
import { IconoPortal } from "@/components/portal/Iconos";
import { BotonPortal, Medidor, Tarjeta } from "@/components/portal/Piezas";
import { avanceBriefing, avanceSeccion, respondido, secciones, type Campo } from "@/lib/briefing";
import { guardar, useParametro, usePortal, type EstadoPortal } from "@/lib/portal-estado";

type B = EstadoPortal["briefing"];
const setB = (fn: (b: B) => B) => guardar((s) => ({ ...s, briefing: fn(s.briefing) }));

const HORARIOS = ["Mañana · 9 a 12", "Mediodía · 12 a 3", "Tarde · 3 a 6"];

function proximosDias(n = 5) {
  const dias: string[] = [];
  const d = new Date();
  while (dias.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6)
      dias.push(d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" }).replace(".", ""));
  }
  return dias;
}

/* ---------- Elegir cómo llenarlo ---------- */
function Eleccion({ alElegir }: { alElegir: (m: "yo" | "asistido") => void }) {
  return (
    <div className="mx-auto max-w-[1000px]">
      <p className="etiqueta text-[11px] text-black/45">Briefing</p>
      <h1 className="titulo mt-2 max-w-[20ch] text-[clamp(30px,3.6vw,52px)] leading-[1.02]">
        Lo más importante de tu página <span className="text-black/35">eres tú.</span>
      </h1>
      <p className="mt-4 max-w-[60ch] text-[16px] leading-relaxed text-black/60">
        Con tu briefing escribimos tus textos, armamos tus páginas, preparamos tu aviso de privacidad y tus campañas. Son{" "}
        {secciones.length} partes y unos {secciones.reduce((n, s) => n + s.minutos, 0)} minutos. ¿Cómo prefieres hacerlo?
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="group relative">
          <Tarjeta className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:border-black group-hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]">
            <span className="grid size-14 place-items-center rounded-2xl bg-humo transition-colors group-hover:bg-amarillo">
              <IconoPortal nombre="briefing" className="size-7" />
            </span>
            <h2 className="titulo mt-6 text-[26px]">Lo lleno yo</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-black/60">
              A tu ritmo, desde el celular o la computadora. Se guarda solo: puedes dejarlo y seguir otro día.
            </p>
            <ul className="mt-5 space-y-2 text-[13px] text-black/70">
              {["Unos 33 minutos en total", "Sube tu logo, manual, fotos y videos", "Te avisamos si falta algo"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <IconoPortal nombre="check" className="size-4 text-amarillo" />
                  {t}
                </li>
              ))}
            </ul>
            <button onClick={() => alElegir("yo")} className="mt-7 inline-flex items-center gap-2 text-[14px] font-bold after:absolute after:inset-0 after:rounded-[22px]">
              Empezar <IconoPortal nombre="flecha" className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Tarjeta>
        </div>
        <div className="group relative">
          <Tarjeta oscura className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
            <span className="grid size-14 place-items-center rounded-2xl bg-amarillo text-black">
              <IconoPortal nombre="telefono" className="size-7" />
            </span>
            <h2 className="titulo mt-6 text-[26px]">Quiero que me ayuden</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/65">
              Elige un horario y te llamamos. Lo llenamos juntos mientras platicamos de tu negocio.
            </p>
            <ul className="mt-5 space-y-2 text-[13px] text-white/75">
              {["Llamada de unos 40 minutos", "Sin costo, incluido en tu Página Viva", "Tú solo subes tus archivos"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <IconoPortal nombre="check" className="size-4 text-amarillo" />
                  {t}
                </li>
              ))}
            </ul>
            <button onClick={() => alElegir("asistido")} className="mt-7 inline-flex items-center gap-2 text-[14px] font-bold text-amarillo after:absolute after:inset-0 after:rounded-[22px]">
              Agendar llamada <IconoPortal nombre="flecha" className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}

/* ---------- Agendar llamada ---------- */
function Agendar({ alVolver }: { alVolver: () => void }) {
  const [dias] = useState(proximosDias);
  const [dia, setDia] = useState("");
  const [horario, setHorario] = useState("");
  const [telefono, setTelefono] = useState("");
  return (
    <div className="mx-auto max-w-[760px]">
      <button onClick={alVolver} className="mb-6 flex items-center gap-2 text-[13px] font-semibold text-black/55 hover:text-black">
        <IconoPortal nombre="regresar" className="size-4" /> Volver
      </button>
      <Tarjeta>
        <p className="etiqueta text-[11px] text-black/45">Briefing asistido</p>
        <h1 className="titulo mt-2 text-[clamp(26px,3vw,40px)] leading-[1.05]">¿Cuándo te llamamos?</h1>
        <form
          className="mt-7 space-y-7"
          onSubmit={(ev) => {
            ev.preventDefault();
            setB((b) => ({ ...b, modo: "asistido", llamada: { dia, horario, telefono } }));
          }}
        >
          <fieldset>
            <legend className="text-[13px] font-bold">Día</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {dias.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDia(d)}
                  className={`rounded-2xl border-[1.5px] px-4 py-3 text-[13px] font-semibold capitalize transition-colors ${
                    dia === d ? "border-black bg-black text-white" : "border-black/10 hover:border-black/40"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-[13px] font-bold">Horario</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {HORARIOS.map((h) => (
                <button
                  type="button"
                  key={h}
                  onClick={() => setHorario(h)}
                  className={`rounded-2xl border-[1.5px] px-4 py-3 text-[13px] font-semibold transition-colors ${
                    horario === h ? "border-black bg-amarillo" : "border-black/10 hover:border-black/40"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="tel-llamada" className="text-[13px] font-bold">
              ¿A qué número te llamamos?
            </label>
            <input
              id="tel-llamada"
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="868 123 4567"
              className="mt-2 w-full rounded-2xl border-[1.5px] border-black/10 px-4 py-3.5 text-[15px] outline-none focus:border-black"
            />
          </div>
          <BotonPortal type="submit" disabled={!dia || !horario || telefono.length < 8} className="w-full !py-4">
            Agendar mi llamada
          </BotonPortal>
        </form>
      </Tarjeta>
    </div>
  );
}

/* ---------- Campos ---------- */
const claseInput =
  "mt-2 w-full rounded-2xl border-[1.5px] border-black/10 bg-white px-4 py-3.5 text-[15px] outline-none transition-colors placeholder:text-black/30 focus:border-black";

function CampoBriefing({ c, clave }: { c: Campo; clave: string }) {
  const e = usePortal();
  const v = e.briefing.respuestas[clave];
  const set = (valor: string | string[]) => setB((b) => ({ ...b, respuestas: { ...b.respuestas, [clave]: valor } }));
  const id = `b-${clave.replace(".", "-")}`;
  const listo = c.tipo === "archivo" ? (e.briefing.archivos[clave]?.length ?? 0) > 0 : respondido(v);

  return (
    <div className="border-b border-black/[0.07] pb-7 last:border-0">
      <label htmlFor={id} className="flex items-start justify-between gap-3">
        <span className="text-[15px] font-bold">
          {c.etiqueta}
          {c.obligatorio && <span className="ml-1 text-amarillo">*</span>}
        </span>
        <span
          className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full transition-colors ${listo ? "bg-black text-amarillo" : "border-[1.5px] border-black/15"}`}
        >
          {listo && <IconoPortal nombre="check" className="size-3" />}
        </span>
      </label>
      {c.ayuda && <p className="mt-1 text-[13px] text-black/50">{c.ayuda}</p>}

      {(c.tipo === "texto" || c.tipo === "url" || c.tipo === "telefono" || c.tipo === "correo") && (
        <input
          id={id}
          type={c.tipo === "telefono" ? "tel" : c.tipo === "correo" ? "email" : "text"}
          value={(v as string) ?? ""}
          onChange={(ev) => set(ev.target.value)}
          placeholder={c.ejemplo}
          className={claseInput}
        />
      )}

      {c.tipo === "area" && (
        <textarea id={id} rows={3} value={(v as string) ?? ""} onChange={(ev) => set(ev.target.value)} placeholder={c.ejemplo} className={claseInput} />
      )}

      {(c.tipo === "opciones" || c.tipo === "multiple") && (
        <div id={id} className="mt-3 flex flex-wrap gap-2">
          {c.opciones.map((o) => {
            const sel = c.tipo === "multiple" ? ((v as string[]) ?? []).includes(o) : v === o;
            return (
              <button
                type="button"
                key={o}
                onClick={() =>
                  c.tipo === "multiple"
                    ? set(sel ? ((v as string[]) ?? []).filter((x) => x !== o) : [...((v as string[]) ?? []), o])
                    : set(sel ? "" : o)
                }
                className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-colors ${
                  sel ? "border-black bg-black text-white" : "border-black/10 bg-white hover:border-black/40"
                }`}
              >
                {c.tipo === "multiple" && sel && "✓ "}
                {o}
              </button>
            );
          })}
        </div>
      )}

      {c.tipo === "archivo" && (
        <div className="mt-3">
          <label
            htmlFor={id}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-black/20 bg-humo px-4 py-7 text-center transition-colors hover:border-black hover:bg-amarillo/10"
          >
            <IconoPortal nombre="subir" className="size-6" />
            <span className="text-[14px] font-bold">Arrastra o elige archivos</span>
            <span className="text-[12px] text-black/50">Hasta 50 MB por archivo</span>
          </label>
          <input
            id={id}
            type="file"
            multiple
            accept={c.acepta}
            className="sr-only"
            onChange={(ev) => {
              const nombres = Array.from(ev.target.files ?? []).map((f) => `${f.name} · ${(f.size / 1024 / 1024).toFixed(1)} MB`);
              setB((b) => ({ ...b, archivos: { ...b.archivos, [clave]: [...(b.archivos[clave] ?? []), ...nombres] } }));
              ev.target.value = "";
            }}
          />
          {(e.briefing.archivos[clave]?.length ?? 0) > 0 && (
            <ul className="mt-3 space-y-2">
              {e.briefing.archivos[clave].map((n, i) => (
                <li key={n + i} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-[13px] ring-1 ring-black/[0.07]">
                  <IconoPortal nombre="archivo" className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{n}</span>
                  <button
                    type="button"
                    aria-label="Quitar archivo"
                    onClick={() => setB((b) => ({ ...b, archivos: { ...b.archivos, [clave]: b.archivos[clave].filter((_, j) => j !== i) } }))}
                    className="text-black/40 hover:text-black"
                  >
                    <IconoPortal nombre="cerrar" className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {c.tipo === "servicios" && <Servicios valor={(v as string[]) ?? []} alCambiar={set} id={id} />}
    </div>
  );
}

function Servicios({ valor, alCambiar, id }: { valor: string[]; alCambiar: (v: string[]) => void; id: string }) {
  const filas: { n: string; p: string; d: string }[] = (valor.length ? valor : [JSON.stringify({ n: "", p: "", d: "" })]).map((x) => {
    try {
      return JSON.parse(x);
    } catch {
      return { n: x, p: "", d: "" };
    }
  });
  const set = (i: number, k: "n" | "p" | "d", t: string) =>
    alCambiar(filas.map((f, j) => JSON.stringify(j === i ? { ...f, [k]: t } : f)));
  return (
    <div className="mt-3 space-y-3">
      {filas.map((f, i) => (
        <div key={i} className="grid gap-2 rounded-2xl bg-humo p-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)_auto]">
          <input id={i === 0 ? id : undefined} value={f.n} onChange={(e) => set(i, "n", e.target.value)} placeholder="Servicio, p. ej. Limpieza dental" className={`${claseInput} !mt-0`} />
          <input value={f.p} onChange={(e) => set(i, "p", e.target.value)} placeholder="Precio, p. ej. desde $650" className={`${claseInput} !mt-0`} />
          <button
            type="button"
            aria-label="Quitar servicio"
            onClick={() => alCambiar(filas.filter((_, j) => j !== i).map((x) => JSON.stringify(x)))}
            className="grid size-12 place-items-center self-center rounded-full text-black/40 hover:bg-white hover:text-black max-sm:hidden"
          >
            <IconoPortal nombre="cerrar" className="size-4" />
          </button>
          <textarea
            rows={2}
            value={f.d}
            onChange={(e) => set(i, "d", e.target.value)}
            placeholder="En qué consiste y para quién es"
            className={`${claseInput} !mt-0 sm:col-span-3`}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => alCambiar([...filas.map((x) => JSON.stringify(x)), JSON.stringify({ n: "", p: "", d: "" })])}
        className="flex items-center gap-2 rounded-full border-[1.5px] border-black/15 px-4 py-2 text-[13px] font-bold hover:border-black"
      >
        <IconoPortal nombre="mas" className="size-4" /> Agregar otro servicio
      </button>
    </div>
  );
}

/* ---------- Página ---------- */
export default function Briefing() {
  const e = usePortal();
  const b = e.briefing;
  const pideAyuda = useParametro("asistido") === "1";
  const [agendando, setAgendando] = useState(false);
  const total = avanceBriefing(b.respuestas, b.archivos);
  const paso = Math.min(b.paso, secciones.length);
  const enRevision = paso === secciones.length;

  if (b.enviado)
    return (
      <div className="mx-auto max-w-[720px] py-10 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-amarillo">
          <IconoPortal nombre="check" className="size-10" />
        </span>
        <h1 className="titulo mt-8 text-[clamp(30px,3.6vw,48px)] leading-[1.02]">¡Recibimos tu briefing!</h1>
        <p className="mx-auto mt-4 max-w-[48ch] text-[16px] leading-relaxed text-black/60">
          Ya empezamos a diseñar tu página. Si nos falta algo, te escribimos por WhatsApp. Puedes editar tus respuestas cuando
          quieras.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <BotonPortal href="/portal/">Ir al inicio</BotonPortal>
          <BotonPortal tono="contorno" onClick={() => setB((x) => ({ ...x, enviado: false, paso: 0 }))}>
            Editar respuestas
          </BotonPortal>
        </div>
      </div>
    );

  if (agendando || (pideAyuda && !b.llamada && b.modo !== "yo"))
    return <Agendar alVolver={() => setAgendando(false)} />;

  if (!b.modo)
    return (
      <Eleccion
        alElegir={(m) => {
          if (m === "yo") setB((x) => ({ ...x, modo: "yo" }));
          else setAgendando(true);
        }}
      />
    );

  const seccion = secciones[paso];

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="etiqueta text-[11px] text-black/45">Briefing</p>
          <h1 className="titulo mt-2 text-[clamp(28px,3vw,42px)] leading-[1.02]">{enRevision ? "Revisa y envía" : seccion.titulo}</h1>
        </div>
        <div className="w-full max-w-[320px]">
          <Medidor usado={total} total={100} etiqueta="Tu avance" porcentaje />
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-black/45">
            <IconoPortal nombre="check" className="size-3" /> Se guarda solo
          </p>
        </div>
      </div>

      {b.llamada && (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-[20px] bg-black px-5 py-4 text-white">
          <span className="grid size-10 place-items-center rounded-full bg-amarillo text-black">
            <IconoPortal nombre="telefono" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold capitalize">
              Llamada agendada: {b.llamada.dia} · {b.llamada.horario}
            </p>
            <p className="text-[13px] text-white/60">
              Te llamamos al {b.llamada.telefono}. Mientras, puedes subir tus archivos o adelantar lo que quieras.
            </p>
          </div>
          <button onClick={() => setAgendando(true)} className="text-[12px] font-bold text-amarillo hover:underline">
            Cambiar horario
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Pasos */}
        <nav className="lg:sticky lg:top-6 lg:self-start">
          <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {secciones.map((s, i) => {
              const a = avanceSeccion(s, b.respuestas, b.archivos);
              const completa = a.n === a.total;
              return (
                <li key={s.id} className="shrink-0">
                  <button
                    onClick={() => setB((x) => ({ ...x, paso: i }))}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                      i === paso ? "bg-black text-white" : "hover:bg-black/[0.04]"
                    }`}
                  >
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-extrabold ${
                        completa ? "bg-amarillo text-black" : i === paso ? "bg-white/15" : "bg-black/[0.06]"
                      }`}
                    >
                      {completa ? <IconoPortal nombre="check" className="size-3.5" /> : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold">{s.titulo}</span>
                      <span className={`block text-[11px] ${i === paso ? "text-white/55" : "text-black/45"}`}>
                        {a.n} de {a.total} · {s.minutos} min
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            <li className="shrink-0">
              <button
                onClick={() => setB((x) => ({ ...x, paso: secciones.length }))}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left ${enRevision ? "bg-amarillo" : "hover:bg-black/[0.04]"}`}
              >
                <span className="grid size-7 place-items-center rounded-full bg-black text-amarillo">
                  <IconoPortal nombre="enviar" className="size-3.5" />
                </span>
                <span className="text-[13px] font-bold">Revisar y enviar</span>
              </button>
            </li>
          </ol>
        </nav>

        {/* Contenido */}
        {enRevision ? (
          <Revision />
        ) : (
          <Tarjeta>
            <p className="max-w-[60ch] text-[15px] leading-relaxed text-black/60">{seccion.intro}</p>
            <div className="mt-7 space-y-7">
              {seccion.campos.map((c) => (
                <CampoBriefing key={c.id} c={c} clave={`${seccion.id}.${c.id}`} />
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.07] pt-6">
              <BotonPortal tono="contorno" disabled={paso === 0} onClick={() => setB((x) => ({ ...x, paso: paso - 1 }))}>
                Anterior
              </BotonPortal>
              <BotonPortal onClick={() => setB((x) => ({ ...x, paso: paso + 1 }))}>
                {paso === secciones.length - 1 ? "Revisar" : "Siguiente"}
                <IconoPortal nombre="flecha" className="size-4" />
              </BotonPortal>
            </div>
          </Tarjeta>
        )}
      </div>
    </div>
  );
}

function Revision() {
  const e = usePortal();
  const b = e.briefing;
  const faltan = secciones.flatMap((s, i) =>
    s.campos.filter((c) => c.obligatorio && !respondido(b.respuestas[`${s.id}.${c.id}`])).map((c) => ({ s, i, c })),
  );
  return (
    <div className="grid gap-5">
      {faltan.length > 0 ? (
        <Tarjeta className="!border-amarillo bg-amarillo/10">
          <h2 className="text-[15px] font-bold">Faltan {faltan.length} respuestas importantes</h2>
          <p className="mt-1 text-[13px] text-black/60">Puedes enviarlo así y las completamos en una llamada, o terminarlas ahora.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {faltan.map(({ s, i, c }) => (
              <li key={s.id + c.id}>
                <button
                  onClick={() => setB((x) => ({ ...x, paso: i }))}
                  className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold ring-1 ring-black/10 hover:ring-black"
                >
                  {s.titulo}: {c.etiqueta}
                </button>
              </li>
            ))}
          </ul>
        </Tarjeta>
      ) : (
        <Tarjeta oscura>
          <h2 className="flex items-center gap-2 text-[15px] font-bold">
            <IconoPortal nombre="check" className="size-5 text-amarillo" /> Todo lo importante está completo
          </h2>
        </Tarjeta>
      )}

      {secciones.map((s, i) => {
        const a = avanceSeccion(s, b.respuestas, b.archivos);
        return (
          <Tarjeta key={s.id}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[15px] font-bold">{s.titulo}</h3>
              <button onClick={() => setB((x) => ({ ...x, paso: i }))} className="text-[12px] font-bold hover:underline">
                Editar · {a.n} de {a.total}
              </button>
            </div>
            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {s.campos.map((c) => {
                const k = `${s.id}.${c.id}`;
                const v = b.respuestas[k];
                let texto = "";
                if (c.tipo === "archivo") texto = (b.archivos[k] ?? []).map((x) => x.split(" · ")[0]).join(", ");
                else if (c.tipo === "servicios")
                  texto = ((v as string[]) ?? [])
                    .map((x) => {
                      try {
                        const f = JSON.parse(x);
                        return f.n ? `${f.n}${f.p ? ` (${f.p})` : ""}` : "";
                      } catch {
                        return "";
                      }
                    })
                    .filter(Boolean)
                    .join(", ");
                else texto = Array.isArray(v) ? v.join(", ") : (v ?? "");
                return (
                  <div key={c.id} className="min-w-0">
                    <dt className="text-[12px] text-black/50">{c.etiqueta}</dt>
                    <dd className={`text-[14px] break-words ${texto ? "font-semibold" : "text-black/30"}`}>{texto || "Sin responder"}</dd>
                  </div>
                );
              })}
            </dl>
          </Tarjeta>
        );
      })}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <BotonPortal tono="contorno" onClick={() => setB((x) => ({ ...x, paso: 0 }))}>
          Volver al inicio
        </BotonPortal>
        <BotonPortal tono="amarillo" onClick={() => setB((x) => ({ ...x, enviado: true }))}>
          Enviar mi briefing
          <IconoPortal nombre="enviar" className="size-4" />
        </BotonPortal>
      </div>
    </div>
  );
}
