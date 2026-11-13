"use client";

import { useEffect, useRef, useState } from "react";
import { AltaOrganizacion, Cargando } from "@/components/portal/Alta";
import { IconoPortal } from "@/components/portal/Iconos";
import { BotonPortal, Medidor, Tarjeta } from "@/components/portal/Piezas";
import { iniciarVoz, preguntarAsistente, respuestaLocal, transcribir, type SesionVoz } from "@/lib/brief-ia";
import {
  PROPONE,
  avanceBriefing,
  camposAplicables,
  escribirChat,
  faltantes,
  leerChat,
  preguntasVisibles,
  respondido,
  saludo,
  type MensajeChat,
  type Respuestas,
} from "@/lib/briefing";
import { cargarBriefing, setBriefing, useFuenteBriefing, type FuenteBriefing } from "@/lib/briefing-fuente";
import { useParametro } from "@/lib/portal-estado";
import { useSesion } from "@/lib/sesion";
import { iniciarSitio } from "@/lib/sitio-cliente";

const setR = (fn: (r: Respuestas) => Respuestas) => setBriefing((b) => ({ ...b, respuestas: fn(b.respuestas) }));
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

/* =========================================================== Página */

export default function Briefing() {
  const f = useFuenteBriefing();
  const sesion = useSesion();
  const pideAyuda = useParametro("asistido") === "1";
  const [agendando, setAgendando] = useState(false);
  const r = f.b.respuestas;

  useEffect(() => {
    if (f.modo === "cargando" && f.orgId) cargarBriefing(f.orgId);
  }, [f.modo, f.orgId]);

  if (f.modo === "cargando") return <Cargando />;
  if (f.modo === "sin-organizacion" && sesion.estado === "dentro") return <AltaOrganizacion correo={sesion.usuario.correo} />;
  if (f.b.enviado) return <Enviado />;
  if (agendando || (pideAyuda && !f.b.llamada)) return <Agendar alVolver={() => setAgendando(false)} />;

  return (
    <div className="mx-auto max-w-[1240px]">
      {f.b.llamada && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-[20px] bg-black px-5 py-4 text-white">
          <span className="grid size-10 place-items-center rounded-full bg-amarillo text-black">
            <IconoPortal nombre="telefono" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold capitalize">
              Llamada agendada: {f.b.llamada.dia} · {f.b.llamada.horario}
            </p>
            <p className="text-[13px] text-white/60">Te llamamos al {f.b.llamada.telefono}. Mientras, puedes adelantar lo que quieras.</p>
          </div>
          <button onClick={() => setAgendando(true)} className="text-[12px] font-bold text-amarillo hover:underline">
            Cambiar horario
          </button>
        </div>
      )}
      {r._etapa === "chat" ? <Chat f={f} alAgendar={() => setAgendando(true)} /> : <Clics f={f} alAgendar={() => setAgendando(true)} />}
    </div>
  );
}

/* =========================================================== 1. Preguntas de clic */

function Clics({ f, alAgendar }: { f: FuenteBriefing; alAgendar: () => void }) {
  const r = f.b.respuestas;
  const visibles = preguntasVisibles(r);
  const i = Math.min(Number(r._paso ?? 0) || 0, visibles.length - 1);
  const p = visibles[i];
  const valor = r[p.id];
  const ultima = i === visibles.length - 1;
  const ir = (n: number) => setR((x) => ({ ...x, _paso: String(n) }));
  const alChat = () =>
    setBriefing((b) => {
      const yaHay = leerChat(b.respuestas).length > 0;
      return {
        ...b,
        modo: b.modo ?? "yo",
        respuestas: {
          ...b.respuestas,
          _etapa: "chat",
          _chat: yaHay ? b.respuestas._chat : escribirChat([{ de: "asistente", texto: saludo(b.respuestas) }]),
        },
      };
    });
  const siguiente = () => (ultima ? alChat() : ir(i + 1));
  const listo = respondido(valor);

  const elegir = (o: string) => {
    if (p.tipo === "una") {
      setR((x) => ({ ...x, [p.id]: o, _paso: String(ultima ? i : i + 1) }));
      if (ultima) setTimeout(alChat, 250);
      return;
    }
    const actual = Array.isArray(valor) ? valor : [];
    let nuevo = actual.includes(o) ? actual.filter((x) => x !== o) : [...actual, o];
    if (p.exclusiva) nuevo = o === p.exclusiva && !actual.includes(o) ? [o] : nuevo.filter((x) => x !== p.exclusiva);
    if (p.maximo && nuevo.length > p.maximo) return;
    setR((x) => ({ ...x, [p.id]: nuevo }));
  };

  return (
    <div className="mx-auto max-w-[860px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="etiqueta text-[11px] text-black/45">
          Brief · {i + 1} de {visibles.length}
        </p>
        <button onClick={alAgendar} className="flex items-center gap-2 text-[12px] font-bold text-black/55 hover:text-black">
          <IconoPortal nombre="telefono" className="size-4" /> Prefiero que me llamen
        </button>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
        <div
          className="h-full rounded-full bg-amarillo transition-[width] duration-500"
          style={{ width: `${((i + (listo ? 1 : 0)) / (visibles.length + 1)) * 100}%` }}
        />
      </div>

      <div key={p.id} className="mt-10">
        <h1 className="titulo text-[clamp(28px,3.6vw,48px)] leading-[1.04] text-balance">{p.titulo}</h1>
        {p.ayuda && <p className="mt-3 text-[15px] text-black/55">{p.ayuda}</p>}

        {p.tipo === "colores" ? (
          <Ruleta valor={Array.isArray(valor) ? valor : []} alCambiar={(v) => setR((x) => ({ ...x, colores: v }))} />
        ) : (
          <div className={`mt-8 grid gap-3 ${(p.opciones?.length ?? 0) > 4 ? "sm:grid-cols-2" : ""}`}>
            {(p.opciones ?? []).map((o, n) => {
              const sel = Array.isArray(valor) ? valor.includes(o) : valor === o;
              const lleno = p.tipo === "varias" && p.maximo !== undefined && Array.isArray(valor) && valor.length >= p.maximo && !sel;
              return (
                <button
                  key={o}
                  onClick={() => elegir(o)}
                  disabled={lleno}
                  className={`group flex items-center gap-4 rounded-2xl border-[1.5px] px-5 py-4 text-left text-[15px] font-semibold transition-all duration-200 disabled:opacity-35 ${
                    sel ? "border-black bg-black text-white" : "border-black/10 bg-white hover:-translate-y-0.5 hover:border-black/40 disabled:hover:translate-y-0"
                  }`}
                >
                  <span
                    className={`grid size-7 shrink-0 place-items-center text-[11px] font-extrabold transition-colors ${p.tipo === "una" ? "rounded-full" : "rounded-lg"} ${
                      sel ? "bg-amarillo text-black" : "bg-humo text-black/45 group-hover:bg-amarillo/30"
                    }`}
                  >
                    {sel ? <IconoPortal nombre="check" className="size-3.5" /> : String.fromCharCode(65 + n)}
                  </span>
                  {o}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between gap-3">
        <BotonPortal tono="contorno" disabled={i === 0} onClick={() => ir(i - 1)}>
          Atrás
        </BotonPortal>
        {(p.tipo !== "una" || listo) && (
          <BotonPortal onClick={siguiente} disabled={p.tipo === "varias" && !listo}>
            {ultima ? "Ir al chat" : "Siguiente"}
            <IconoPortal nombre="flecha" className="size-4" />
          </BotonPortal>
        )}
      </div>
    </div>
  );
}

const SUGERIDOS = ["#F3AF0E", "#111111", "#FFFFFF", "#1F3A5F", "#2E7D5B", "#C0392B", "#8E44AD", "#E67E22", "#F5E6CC", "#5DADE2"];

function Ruleta({ valor, alCambiar }: { valor: string[]; alCambiar: (v: string[]) => void }) {
  const propone = valor[0] === PROPONE;
  const colores = propone ? [] : valor;
  const slots = ["Color principal", "Color secundario", "Tercer color (opcional)"];
  const set = (n: number, c: string) => {
    const nuevo = [...colores];
    nuevo[n] = c.toUpperCase();
    alCambiar(nuevo.filter(Boolean));
  };
  return (
    <div className="mt-8">
      <div className={`grid gap-4 sm:grid-cols-3 ${propone ? "pointer-events-none opacity-35" : ""}`}>
        {slots.map((s, n) => (
          <label
            key={s}
            htmlFor={`color-${n}`}
            className={`flex items-center gap-4 rounded-2xl border-[1.5px] border-black/10 bg-white p-4 ${n > colores.length ? "opacity-45" : "cursor-pointer hover:border-black/40"}`}
          >
            <span
              className="relative size-14 shrink-0 rounded-full ring-1 ring-black/10"
              style={{ background: colores[n] ?? "conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
            >
              <input
                id={`color-${n}`}
                type="color"
                value={colores[n] ?? "#F3AF0E"}
                onChange={(e) => set(n, e.target.value)}
                disabled={n > colores.length}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-bold">{s}</span>
              <span className="block font-mono text-[12px] text-black/50">{colores[n] ?? (n > colores.length ? "Elige el anterior" : "Toca para elegir")}</span>
            </span>
          </label>
        ))}
      </div>
      <div className={`mt-4 flex flex-wrap items-center gap-2 ${propone ? "pointer-events-none opacity-35" : ""}`}>
        <span className="text-[12px] text-black/45">Rápidos:</span>
        {SUGERIDOS.map((c) => (
          <button
            key={c}
            aria-label={`Usar ${c}`}
            onClick={() => colores.length < 3 && !colores.includes(c) && alCambiar([...colores, c])}
            className="size-7 rounded-full ring-1 ring-black/15 transition-transform hover:scale-110"
            style={{ background: c }}
          />
        ))}
        {colores.length > 0 && (
          <button onClick={() => alCambiar([])} className="ml-2 text-[12px] font-bold text-black/50 hover:text-black">
            Borrar colores
          </button>
        )}
      </div>
      <button
        onClick={() => alCambiar(propone ? [] : [PROPONE])}
        className={`mt-6 flex items-center gap-3 rounded-2xl border-[1.5px] px-5 py-4 text-[15px] font-semibold transition-colors ${
          propone ? "border-black bg-black text-white" : "border-black/10 bg-white hover:border-black/40"
        }`}
      >
        <span className={`grid size-6 place-items-center rounded-lg ${propone ? "bg-amarillo text-black" : "bg-humo"}`}>
          {propone && <IconoPortal nombre="check" className="size-3.5" />}
        </span>
        {PROPONE}
      </button>
    </div>
  );
}

/* =========================================================== 2. Chat */

function Chat({ f, alAgendar }: { f: FuenteBriefing; alAgendar: () => void }) {
  const r = f.b.respuestas;
  const mensajes = leerChat(r);
  const [texto, setTexto] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [pensando, setPensando] = useState(false);
  const [grabando, setGrabando] = useState<number | null>(null);
  const [transcribiendo, setTranscribiendo] = useState(false);
  const [voz, setVoz] = useState<null | "conectando" | "escuchando" | "hablando" | "error">(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const fin = useRef<HTMLDivElement>(null);
  const grabadora = useRef<MediaRecorder | null>(null);
  const reloj = useRef<ReturnType<typeof setInterval> | null>(null);
  const llamada = useRef<SesionVoz | null>(null);
  const colgar = useRef<() => void>(() => {});
  const real = f.modo === "real";

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes.length, pensando]);

  const avisar = (t: string) => {
    setAviso(t);
    setTimeout(() => setAviso(null), 4000);
  };

  const agregar = (m: MensajeChat) => setR((x) => ({ ...x, _chat: escribirChat([...leerChat(x), m]) }));

  async function responder(base: Respuestas, historial: MensajeChat[]) {
    setPensando(true);
    try {
      if (!real) throw new Error("demo");
      const d = await preguntarAsistente(base, historial);
      setR((x) => ({
        ...x,
        ...d.campos,
        notas: d.nota ? [typeof x.notas === "string" ? x.notas : "", d.nota].filter(Boolean).join("\n") : x.notas,
        _chat: escribirChat([...leerChat(x), { de: "asistente", texto: d.mensaje }]),
      }));
    } catch (e) {
      // Demostración o falla del asistente: anota la respuesta en el dato que se preguntó y pide el siguiente.
      const pendiente = faltantes(base)[0];
      const ultimo = historial[historial.length - 1];
      const dato = pendiente && ultimo?.de === "cliente" && ultimo.texto ? { [pendiente.id]: ultimo.texto } : {};
      setR((x) => ({ ...x, ...dato, _chat: escribirChat([...leerChat(x), { de: "asistente", texto: respuestaLocal({ ...base, ...dato }) }]) }));
      if (real && e instanceof Error && e.message !== "demo") avisar(e.message);
    } finally {
      setPensando(false);
    }
  }

  function enviar() {
    const t = texto.trim();
    if ((!t && archivos.length === 0) || pensando) return;
    const nombres = archivos.map((a) => a.name);
    if (archivos.length) f.subir("chat", archivos);
    const m: MensajeChat = { de: "cliente", texto: t, ...(nombres.length ? { adjuntos: nombres } : {}) };
    agregar(m);
    setTexto("");
    setArchivos([]);
    responder(r, [...mensajes, m]);
  }

  async function nota() {
    if (grabando !== null) {
      grabadora.current?.stop();
      return;
    }
    if (!real) return avisar("En la demostración no se transcriben notas de voz. Entra con tu correo para usarlas.");
    try {
      const micro = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(micro);
      const partes: Blob[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) partes.push(e.data);
      };
      rec.onstop = async () => {
        micro.getTracks().forEach((p) => p.stop());
        if (reloj.current) clearInterval(reloj.current);
        setGrabando(null);
        setTranscribiendo(true);
        try {
          const dicho = await transcribir(new Blob(partes, { type: rec.mimeType }));
          setTexto((x) => (x ? `${x} ${dicho}` : dicho));
        } catch (e) {
          avisar(e instanceof Error ? e.message : "No pudimos convertir tu nota a texto.");
        } finally {
          setTranscribiendo(false);
        }
      };
      grabadora.current = rec;
      rec.start();
      setGrabando(0);
      let segundos = 0;
      reloj.current = setInterval(() => {
        segundos += 1;
        setGrabando(segundos);
        if (segundos >= 120) rec.stop(); // máximo 2 minutos por nota
      }, 1000);
    } catch {
      avisar("Permite el micrófono en tu navegador para grabar.");
    }
  }

  async function modoVoz() {
    if (!real) return avisar("El modo voz funciona cuando entras con tu correo.");
    const enLlamada: MensajeChat[] = [];
    try {
      llamada.current = await iniciarVoz(r, {
        alHablarCliente: (t) => {
          const m: MensajeChat = { de: "cliente", texto: t, voz: true };
          enLlamada.push(m);
          agregar(m);
        },
        alHablarAsistente: (t) => {
          const m: MensajeChat = { de: "asistente", texto: t, voz: true };
          enLlamada.push(m);
          agregar(m);
        },
        alCambiarEstado: (e, detalle) => {
          setVoz(e);
          if (e === "error" && detalle) avisar(detalle);
        },
      });
    } catch (e) {
      setVoz(null);
      avisar(e instanceof Error ? e.message : "El modo voz no está disponible.");
      return;
    }
    colgar.current = () => {
      llamada.current?.colgar();
      llamada.current = null;
      setVoz(null);
      // Al colgar, el asistente lee la llamada y llena los datos que se dijeron.
      if (enLlamada.some((m) => m.de === "cliente")) responder(r, [...mensajes, ...enLlamada]);
    };
  }

  const aplicables = camposAplicables(r);
  const faltan = faltantes(r);
  const avance = avanceBriefing(r);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      {/* Conversación */}
      <section className="flex h-[calc(100dvh-190px)] min-h-[560px] flex-col lg:h-[calc(100dvh-110px)]">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[760px] space-y-7 px-1 pt-2 pb-6">
            {mensajes.map((m, n) =>
              m.de === "cliente" ? (
                <div key={n} className="flex flex-col items-end gap-1.5">
                  {m.adjuntos?.map((a) => (
                    <span key={a} className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-[12px] font-semibold">
                      <IconoPortal nombre={/\.(jpe?g|png|webp|heic|gif|svg)$/i.test(a) ? "imagen" : "archivo"} className="size-4" />
                      {a}
                    </span>
                  ))}
                  {m.texto && (
                    <p className="max-w-[85%] rounded-3xl bg-[#ebeae5] px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap">
                      {m.voz && <IconoPortal nombre="onda" className="mr-1.5 inline size-3.5 align-[-2px] text-black/40" />}
                      {m.texto}
                    </p>
                  )}
                </div>
              ) : (
                <div key={n} className="flex gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-black text-amarillo">
                    <IconoPortal nombre="chispa" className="size-3.5" />
                  </span>
                  <p className="min-w-0 pt-0.5 text-[15px] leading-[1.7] whitespace-pre-wrap">{m.texto}</p>
                </div>
              ),
            )}
            {pensando && (
              <div className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-black text-amarillo">
                  <IconoPortal nombre="chispa" className="size-3.5 animate-spin [animation-duration:2.5s]" />
                </span>
                <span className="flex items-center gap-1 pt-2">
                  {[0, 1, 2].map((k) => (
                    <span key={k} className="size-1.5 animate-bounce rounded-full bg-black/40" style={{ animationDelay: `${k * 120}ms` }} />
                  ))}
                </span>
              </div>
            )}
            <div ref={fin} />
          </div>
        </div>

        {/* Caja de mensaje */}
        <form
          className="mx-auto w-full max-w-[760px]"
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
        >
          <div className="rounded-[26px] border border-black/10 bg-white p-2.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] transition-colors focus-within:border-black/25">
            {(archivos.length > 0 || (f.subiendo.chat ?? 0) > 0) && (
              <div className="flex flex-wrap gap-2 px-1.5 pt-1 pb-2">
                {archivos.map((a, n) => (
                  <span key={a.name + n} className="flex items-center gap-2 rounded-xl bg-humo py-1.5 pr-1.5 pl-3 text-[12px] font-semibold">
                    <IconoPortal nombre={a.type.startsWith("image/") ? "imagen" : "archivo"} className="size-3.5" />
                    <span className="max-w-[180px] truncate">{a.name}</span>
                    <button
                      type="button"
                      aria-label={`Quitar ${a.name}`}
                      onClick={() => setArchivos((x) => x.filter((_, j) => j !== n))}
                      className="grid size-5 place-items-center rounded-full hover:bg-black/10"
                    >
                      <IconoPortal nombre="cerrar" className="size-3" />
                    </button>
                  </span>
                ))}
                {(f.subiendo.chat ?? 0) > 0 && (
                  <span className="flex items-center gap-2 px-2 text-[12px] text-black/50">
                    <span className="size-1.5 animate-ping rounded-full bg-amarillo" />
                    Subiendo…
                  </span>
                )}
              </div>
            )}
            <textarea
              id="mensaje-brief"
              rows={1}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar();
                }
              }}
              placeholder={grabando !== null ? "Grabando tu nota…" : transcribiendo ? "Convirtiendo tu nota a texto…" : "Escribe tu respuesta…"}
              className="max-h-48 min-h-11 w-full resize-none bg-transparent px-2.5 py-2 text-[15px] outline-none [field-sizing:content] placeholder:text-black/35"
            />
            <div className="flex items-center justify-between gap-2">
              <label
                className="grid size-9 cursor-pointer place-items-center rounded-full border border-black/10 text-black/70 transition-colors hover:bg-humo hover:text-black"
                aria-label="Agregar archivos"
              >
                <IconoPortal nombre="mas" className="size-[18px]" />
                <input
                  id="adjuntar-brief"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const lista = Array.from(e.target.files ?? []);
                    const grande = lista.find((a) => a.size > 50 * 1024 * 1024);
                    if (grande) avisar(`${grande.name} pesa más de 50 MB.`);
                    setArchivos((x) => [...x, ...lista.filter((a) => a.size <= 50 * 1024 * 1024)]);
                    e.target.value = "";
                  }}
                />
              </label>
              <div className="flex items-center gap-1.5">
                {grabando !== null && (
                  <span className="px-1 text-[12px] font-bold text-red-600 tabular-nums">
                    ● {Math.floor(grabando / 60)}:{String(grabando % 60).padStart(2, "0")}
                  </span>
                )}
                <button
                  type="button"
                  onClick={nota}
                  disabled={transcribiendo}
                  aria-label={grabando !== null ? "Terminar nota de voz" : "Grabar nota de voz"}
                  className={`grid size-9 place-items-center rounded-full transition-colors disabled:opacity-40 ${
                    grabando !== null ? "bg-red-500 text-white" : "text-black/60 hover:bg-humo hover:text-black"
                  }`}
                >
                  <IconoPortal nombre={grabando !== null ? "detener" : "mic"} className="size-[18px]" />
                </button>
                {texto.trim() || archivos.length ? (
                  <button
                    type="submit"
                    aria-label="Enviar"
                    disabled={pensando}
                    className="grid size-9 place-items-center rounded-full bg-black text-white transition-colors hover:bg-amarillo hover:text-black disabled:opacity-40"
                  >
                    <IconoPortal nombre="arriba" className="size-[18px]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={modoVoz}
                    aria-label="Modo voz"
                    className="grid size-9 place-items-center rounded-full bg-black text-white transition-colors hover:bg-amarillo hover:text-black"
                  >
                    <IconoPortal nombre="onda" className="size-[18px]" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-black/40">El asistente puede equivocarse. El equipo de Phot8can revisa todo antes de diseñar.</p>
        </form>
      </section>

      {/* Lo que ya sabemos */}
      <aside className="grid content-start gap-4">
        <Tarjeta>
          <Medidor usado={avance} total={100} etiqueta="Tu brief" porcentaje />
          <p className={`mt-2 text-[11px] ${f.guardado === "error" ? "font-bold text-red-600" : "text-black/45"}`}>
            {f.guardado === "guardando"
              ? "Guardando…"
              : f.guardado === "error"
                ? "No se pudo guardar. Revisa tu conexión."
                : real
                  ? "Guardado en tu cuenta"
                  : "Demostración: se guarda en este navegador"}
          </p>
          <details className="group mt-4" open>
            <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-bold">
              Lo que ya sabemos
              <span className="text-[11px] font-semibold text-black/45">
                {aplicables.filter((c) => respondido(r[c.id])).length} de {aplicables.length}
              </span>
            </summary>
            <ul className="mt-3 max-h-[40vh] space-y-2.5 overflow-y-auto pr-1">
              {aplicables.map((c) => {
                const v = r[c.id];
                const ok = respondido(v);
                return (
                  <li key={c.id} className="flex gap-2.5 text-[12px]">
                    <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${ok ? "bg-black text-amarillo" : "border-[1.5px] border-black/15"}`}>
                      {ok && <IconoPortal nombre="check" className="size-2.5" />}
                    </span>
                    <span className="min-w-0">
                      <span className={`block ${ok ? "text-black/50" : c.obligatorio ? "font-semibold" : "text-black/45"}`}>
                        {c.etiqueta}
                        {!ok && c.obligatorio && <span className="text-amarillo"> *</span>}
                      </span>
                      {ok && <span className="block truncate font-semibold">{String(v)}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </details>
        </Tarjeta>
        <BotonPortal
          tono={faltan.length ? "contorno" : "amarillo"}
          onClick={() => {
            setBriefing((b) => ({ ...b, enviado: true }));
            // Con sesión real, al enviar arranca el diseñador con IA (espera a que se guarde el brief).
            if (real) setTimeout(() => iniciarSitio().catch(() => {}), 1500);
          }}
          className="w-full !py-3.5"
        >
          <IconoPortal nombre="enviar" className="size-4" />
          {faltan.length ? `Enviar así (faltan ${faltan.length})` : "Enviar mi brief"}
        </BotonPortal>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12px] font-bold text-black/50">
          <button onClick={() => setR((x) => ({ ...x, _etapa: "clics", _paso: "0" }))} className="hover:text-black">
            Cambiar mis respuestas de clic
          </button>
          <button onClick={alAgendar} className="hover:text-black">
            Prefiero que me llamen
          </button>
        </div>
      </aside>

      {/* Modo voz */}
      {voz && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
          <div className="hero-brillo absolute inset-0 opacity-30" />
          <div className="relative flex flex-col items-center px-6">
            <span
              className={`grid size-44 place-items-center rounded-full bg-amarillo text-black transition-transform duration-500 ${
                voz === "hablando" ? "scale-110 animate-pulse" : voz === "escuchando" ? "scale-100" : "scale-90 opacity-70"
              }`}
            >
              <IconoPortal nombre="onda" className="size-16" />
            </span>
            <p className="mt-10 text-[18px] font-bold">
              {voz === "conectando" ? "Conectando…" : voz === "hablando" ? "Hablando…" : voz === "error" ? "Algo falló" : "Te escucho"}
            </p>
            <p className="mt-2 max-w-[34ch] text-center text-[14px] text-white/60">Habla con naturalidad. Al terminar, todo queda escrito en tu chat.</p>
            <button
              onClick={() => colgar.current()}
              className="mt-10 flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14px] font-bold text-black hover:bg-amarillo"
            >
              <IconoPortal nombre="cerrar" className="size-4" /> Terminar
            </button>
          </div>
        </div>
      )}

      {aviso && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-md rounded-2xl bg-black px-5 py-4 text-[13px] text-white shadow-2xl lg:bottom-8">
          {aviso}
        </div>
      )}
    </div>
  );
}

/* =========================================================== Llamada asistida y envío */

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
        <p className="etiqueta text-[11px] text-black/45">Brief asistido</p>
        <h1 className="titulo mt-2 text-[clamp(26px,3vw,40px)] leading-[1.05]">¿Cuándo te llamamos?</h1>
        <p className="mt-2 text-[15px] text-black/55">Lo llenamos juntos por teléfono. Sin costo.</p>
        <form
          className="mt-7 space-y-7"
          onSubmit={(ev) => {
            ev.preventDefault();
            setBriefing((b) => ({ ...b, modo: "asistido", llamada: { dia, horario, telefono } }));
            alVolver();
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

function Enviado() {
  return (
    <div className="mx-auto max-w-[720px] py-10 text-center">
      <span className="mx-auto grid size-20 place-items-center rounded-full bg-amarillo">
        <IconoPortal nombre="check" className="size-10" />
      </span>
      <h1 className="titulo mt-8 text-[clamp(30px,3.6vw,48px)] leading-[1.02]">¡Recibimos tu brief!</h1>
      <p className="mx-auto mt-4 max-w-[48ch] text-[16px] leading-relaxed text-black/60">
        Nuestro diseñador con IA ya empezó a armar tu página. Sigue el avance en tu inicio: cuando esté lista, ahí verás la vista previa para aprobarla o pedir cambios.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <BotonPortal href="/portal/">Ir al inicio</BotonPortal>
        <BotonPortal tono="contorno" onClick={() => setBriefing((b) => ({ ...b, enviado: false }))}>
          Editar mi brief
        </BotonPortal>
      </div>
    </div>
  );
}
