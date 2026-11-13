"use client";

import { useEffect, useRef, useState } from "react";
import { IconoPortal } from "@/components/portal/Iconos";
import { BotonPortal, Medidor, Tarjeta, TituloTarjeta, precio } from "@/components/portal/Piezas";
import { RONDAS, clasificar, cliente, planesCambios, tiposCambio, type Complejidad } from "@/lib/portal";
import { guardar, useParametro, usePortal } from "@/lib/portal-estado";

type TarjetaChat =
  | { tipo: "clasificacion"; complejidad: Complejidad; cobro: "plan" | "suelto" | "equipo"; quedan: number; resuelta?: "si" | "no" }
  | { tipo: "progreso"; paso: number }
  | { tipo: "vista"; pedido: string; rondas: number; resuelta?: "publicado" | "ajuste" }
  | { tipo: "publicado" }
  | { tipo: "equipo"; folio: number };

type Mensaje = { id: number; de: "cliente" | "ia"; texto?: string; adjuntos?: string[]; tarjeta?: TarjetaChat };

const PASOS = ["Leyendo tu página", "Haciendo el cambio", "Revisando en celular y computadora", "Preparando tu vista previa"];

const HISTORIAL: Mensaje[] = [
  { id: 1, de: "cliente", texto: "Cambia la foto del consultorio por esta, la de la recepción nueva.", adjuntos: ["recepcion-nueva.jpg"] },
  { id: 2, de: "ia", texto: "Listo. Cambié la foto principal de Inicio y también la de Ubicación y horarios, para que se vea igual." },
  { id: 3, de: "ia", tarjeta: { tipo: "publicado" } },
];

const SUGERENCIAS = [
  "Cambia el horario del sábado a 9 a 2",
  "Agrega una promoción de blanqueamiento a $1,990",
  "Quiero una tienda para vender cepillos y kits",
  "Mi dominio no abre desde el celular",
];

type Reconocimiento = {
  lang: string;
  interimResults: boolean;
  onresult: (ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

export default function Cambios() {
  const e = usePortal();
  const plan = planesCambios.find((p) => p.id === e.plan);
  const conEquipo = useParametro("equipo") === "1";
  const [mensajes, setMensajes] = useState<Mensaje[]>(HISTORIAL);
  const [texto, setTexto] = useState("");
  const [adjuntos, setAdjuntos] = useState<string[]>([]);
  const [ajustando, setAjustando] = useState<{ pedido: string; rondas: number } | null>(null);
  const [escuchando, setEscuchando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [folios, setFolios] = useState<{ folio: number; texto: string }[]>([]);
  const fin = useRef<HTMLDivElement>(null);
  const rec = useRef<Reconocimiento | null>(null);
  const sig = useRef(10);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes]);

  const agrega = (m: Omit<Mensaje, "id">) => setMensajes((ms) => [...ms, { ...m, id: sig.current++ }]);
  const actualiza = (id: number, t: Partial<TarjetaChat>) =>
    setMensajes((ms) => ms.map((m) => (m.id === id && m.tarjeta ? { ...m, tarjeta: { ...m.tarjeta, ...t } as TarjetaChat } : m)));

  const restantes = (c: Complejidad) => (plan && c !== "equipo" ? plan.incluye[c] - e.uso[c] : 0);

  function trabajar(pedido: string, rondas: number) {
    const id = sig.current++;
    setMensajes((ms) => [...ms, { id, de: "ia", tarjeta: { tipo: "progreso", paso: 0 } }]);
    PASOS.forEach((_, i) => setTimeout(() => actualiza(id, { paso: i + 1 }), 900 * (i + 1)));
    setTimeout(() => {
      setMensajes((ms) => ms.filter((m) => m.id !== id));
      agrega({ de: "ia", texto: "Tu cambio está listo. Revísalo antes de publicarlo." });
      agrega({ de: "ia", tarjeta: { tipo: "vista", pedido, rondas } });
    }, 900 * (PASOS.length + 1));
  }

  function enviar() {
    const t = texto.trim();
    if (!t && adjuntos.length === 0) return;
    agrega({ de: "cliente", texto: t, adjuntos: adjuntos.length ? adjuntos : undefined });
    setTexto("");
    setAdjuntos([]);

    if (ajustando) {
      const a = ajustando;
      setAjustando(null);
      setTimeout(() => {
        agrega({ de: "ia", texto: "Va. Hago el ajuste sin gastar otro cambio." });
        trabajar(a.pedido, a.rondas);
      }, 500);
      return;
    }

    const c: Complejidad = conEquipo && mensajes.length <= HISTORIAL.length ? "equipo" : clasificar(t || "foto");
    const cobro = c === "equipo" ? "equipo" : restantes(c) > 0 ? "plan" : "suelto";
    setTimeout(() => {
      agrega({ de: "ia", texto: c === "equipo" ? "Esto lo resuelve mejor una persona de nuestro equipo." : `Entendido. Esto es un cambio ${tiposCambio[c].nombre.toLowerCase()}.` });
      agrega({ de: "ia", tarjeta: { tipo: "clasificacion", complejidad: c, cobro, quedan: restantes(c) } });
    }, 700);
  }

  function confirmar(m: Mensaje, pedido: string) {
    if (m.tarjeta?.tipo !== "clasificacion") return;
    const { complejidad: c, cobro } = m.tarjeta;
    actualiza(m.id, { resuelta: "si" });
    if (cobro === "equipo") {
      const folio = 1040 + folios.length + 2;
      setFolios((f) => [{ folio, texto: pedido || "Solicitud con archivos" }, ...f]);
      setTimeout(() => agrega({ de: "ia", tarjeta: { tipo: "equipo", folio } }), 500);
      return;
    }
    if (cobro === "suelto" && c !== "equipo")
      setTimeout(() => agrega({ de: "ia", texto: `Se cobraron ${precio(tiposCambio[c].suelto)} a tu ${cliente.tarjeta.marca} •••• ${cliente.tarjeta.ultimos} (demostración).` }), 300);
    if (cobro === "plan" && c !== "equipo") guardar((s) => ({ ...s, uso: { ...s.uso, [c]: s.uso[c] + 1 } }));
    setTimeout(() => trabajar(pedido, RONDAS), 600);
  }

  function dictar() {
    if (escuchando) {
      rec.current?.stop();
      return;
    }
    const w = window as unknown as { SpeechRecognition?: new () => Reconocimiento; webkitSpeechRecognition?: new () => Reconocimiento };
    const R = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!R) {
      setAviso("Tu navegador no permite dictar aquí. En la versión final la voz se graba y se convierte a texto.");
      setTimeout(() => setAviso(null), 3500);
      return;
    }
    const r = new R();
    r.lang = "es-MX";
    r.interimResults = true;
    const base = texto ? texto + " " : "";
    r.onresult = (ev) => setTexto(base + Array.from(ev.results).map((x) => x[0].transcript).join(""));
    r.onend = () => setEscuchando(false);
    rec.current = r;
    setEscuchando(true);
    r.start();
  }

  const pedidoDe = (idx: number) => {
    for (let i = idx; i >= 0; i--) if (mensajes[i].de === "cliente") return mensajes[i].texto ?? "";
    return "";
  };

  return (
    <div className="mx-auto grid max-w-[1280px] gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* Chat */}
      <section className="flex h-[calc(100dvh-190px)] min-h-[560px] flex-col overflow-hidden rounded-[22px] border border-black/[0.07] bg-white lg:h-[calc(100dvh-130px)]">
        <header className="flex items-center gap-3 border-b border-black/[0.07] px-5 py-4">
          <span className="relative grid size-10 place-items-center rounded-full bg-black text-amarillo">
            <IconoPortal nombre="chispa" className="size-5" />
            <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-amarillo" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[15px] font-bold">Cambios con IA</h1>
            <p className="truncate text-[12px] text-black/50">Escribe, habla o manda una foto. Nada se publica sin que lo apruebes.</p>
          </div>
          {plan && (
            <span className="hidden rounded-full bg-humo px-3 py-1.5 text-[12px] font-bold sm:block">
              Plan {plan.nombre} · {restantes("simple")} simples
            </span>
          )}
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-6">
          <p className="text-center text-[11px] font-semibold text-black/35 uppercase tracking-[0.16em]">10 de noviembre</p>
          {mensajes.map((m, idx) => (
            <Burbuja
              key={m.id}
              m={m}
              plan={plan?.nombre}
              alConfirmar={() => confirmar(m, pedidoDe(idx))}
              alCancelar={() => {
                actualiza(m.id, { resuelta: "no" });
                agrega({ de: "ia", texto: "Sin problema, no hice nada. ¿Te ayudo con otra cosa?" });
              }}
              alPublicar={() => {
                actualiza(m.id, { resuelta: "publicado" });
                setTimeout(() => agrega({ de: "ia", tarjeta: { tipo: "publicado" } }), 400);
              }}
              alAjustar={(pedido, rondas) => {
                actualiza(m.id, { resuelta: "ajuste" });
                setAjustando({ pedido, rondas: rondas - 1 });
                agrega({ de: "ia", texto: `¿Qué ajustamos? Te quedan ${rondas - 1} rondas sin costo en este cambio.` });
              }}
            />
          ))}
          {mensajes.length === HISTORIAL.length && (
            <div className="pt-4">
              <p className="mb-2 text-center text-[12px] text-black/45">Prueba con algo como:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGERENCIAS.map((s) => (
                  <button key={s} onClick={() => setTexto(s)} className="rounded-full border-[1.5px] border-black/10 px-3 py-1.5 text-[12px] font-semibold hover:border-black">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={fin} />
        </div>

        {/* Composer */}
        <form
          className="border-t border-black/[0.07] p-3 sm:p-4"
          onSubmit={(ev) => {
            ev.preventDefault();
            enviar();
          }}
        >
          {ajustando && (
            <p className="mb-2 flex items-center gap-2 px-2 text-[12px] font-semibold text-black/60">
              <IconoPortal nombre="regresar" className="size-3.5" /> Ajuste de: “{ajustando.pedido}”
            </p>
          )}
          {adjuntos.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 px-1">
              {adjuntos.map((a, i) => (
                <span key={a + i} className="flex items-center gap-2 rounded-full bg-humo py-1 pr-1.5 pl-3 text-[12px] font-semibold">
                  <IconoPortal nombre={/\.(jpe?g|png|webp|heic|gif)$/i.test(a) ? "imagen" : "archivo"} className="size-3.5" />
                  {a}
                  <button type="button" aria-label="Quitar" onClick={() => setAdjuntos((x) => x.filter((_, j) => j !== i))} className="grid size-5 place-items-center rounded-full hover:bg-black/10">
                    <IconoPortal nombre="cerrar" className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className={`flex items-end gap-2 rounded-[20px] border-[1.5px] bg-humo p-2 transition-colors ${escuchando ? "border-amarillo" : "border-transparent focus-within:border-black"}`}>
            <label className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-black/60 hover:bg-white hover:text-black" aria-label="Adjuntar archivos">
              <IconoPortal nombre="clip" className="size-5" />
              <input
                id="adjuntar"
                type="file"
                multiple
                className="sr-only"
                onChange={(ev) => {
                  setAdjuntos((a) => [...a, ...Array.from(ev.target.files ?? []).map((f) => f.name)]);
                  ev.target.value = "";
                }}
              />
            </label>
            <textarea
              id="mensaje"
              rows={1}
              value={texto}
              onChange={(ev) => setTexto(ev.target.value)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" && !ev.shiftKey) {
                  ev.preventDefault();
                  enviar();
                }
              }}
              placeholder={escuchando ? "Te escucho…" : ajustando ? "Dime qué ajustamos…" : "¿Qué quieres cambiar en tu página?"}
              className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-[15px] outline-none placeholder:text-black/35"
            />
            <button
              type="button"
              onClick={dictar}
              aria-label={escuchando ? "Dejar de dictar" : "Dictar con tu voz"}
              className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors ${escuchando ? "animate-pulse bg-amarillo text-black" : "text-black/60 hover:bg-white hover:text-black"}`}
            >
              <IconoPortal nombre="mic" className="size-5" />
            </button>
            <button type="submit" aria-label="Enviar" disabled={!texto.trim() && adjuntos.length === 0} className="grid size-10 shrink-0 place-items-center rounded-full bg-black text-white transition-colors hover:bg-amarillo hover:text-black disabled:opacity-30">
              <IconoPortal nombre="enviar" className="size-4" />
            </button>
          </div>
        </form>
      </section>

      {/* Panel lateral */}
      <aside className="grid content-start gap-5">
        <Tarjeta>
          <TituloTarjeta icono="chat" accion={<a href="/portal/tienda/?vista=planes" className="text-[12px] font-bold hover:underline">{plan ? "Cambiar" : "Ver planes"}</a>}>
            {plan ? `Plan ${plan.nombre} · noviembre` : "Sin plan de cambios"}
          </TituloTarjeta>
          {plan ? (
            <div className="space-y-4">
              <Medidor usado={e.uso.simple} total={plan.incluye.simple} etiqueta="Simples" />
              <Medidor usado={e.uso.mediano} total={plan.incluye.mediano} etiqueta="Medianos" />
              <Medidor usado={e.uso.complejo} total={plan.incluye.complejo} etiqueta="Complejos" />
            </div>
          ) : (
            <p className="text-[13px] text-black/60">Puedes pedir cambios sueltos y pagarlos uno por uno, o elegir un plan mensual.</p>
          )}
        </Tarjeta>

        <Tarjeta>
          <TituloTarjeta icono="chispa">Qué cuenta como qué</TituloTarjeta>
          <ul className="space-y-3">
            {(Object.keys(tiposCambio) as Complejidad[]).map((k) => (
              <li key={k} className="rounded-2xl bg-humo p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-bold">{tiposCambio[k].nombre}</span>
                  <span className="text-[12px] font-bold tabular-nums">{tiposCambio[k].suelto ? `${precio(tiposCambio[k].suelto)} suelto` : "Se cotiza"}</span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-black/55">{tiposCambio[k].ejemplos}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-black/50">Cada cambio incluye {RONDAS} rondas de ajustes. Antes de publicar guardamos un respaldo.</p>
        </Tarjeta>

        <Tarjeta oscura>
          <TituloTarjeta icono="equipo" oscura>
            Con el equipo
          </TituloTarjeta>
          <ul className="space-y-2 text-[13px]">
            {[...folios, { folio: 1041, texto: "Activar Citas en línea" }].map((f) => (
              <li key={f.folio} className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-2.5">
                <span className="text-[11px] font-bold text-amarillo tabular-nums">#{f.folio}</span>
                <span className="min-w-0 flex-1 truncate">{f.texto}</span>
                <span className="text-[11px] text-white/50">En curso</span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </aside>

      {aviso && (
        <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md rounded-2xl bg-black px-5 py-4 text-[13px] text-white shadow-2xl lg:bottom-8">{aviso}</div>
      )}
    </div>
  );
}

function Burbuja({
  m,
  plan,
  alConfirmar,
  alCancelar,
  alPublicar,
  alAjustar,
}: {
  m: Mensaje;
  plan?: string;
  alConfirmar: () => void;
  alCancelar: () => void;
  alPublicar: () => void;
  alAjustar: (pedido: string, rondas: number) => void;
}) {
  if (m.de === "cliente")
    return (
      <div className="flex flex-col items-end gap-1.5">
        {m.adjuntos?.map((a) => (
          <span key={a} className="flex items-center gap-2 rounded-2xl bg-humo px-3 py-2 text-[12px] font-semibold">
            <IconoPortal nombre={/\.(jpe?g|png|webp|heic|gif)$/i.test(a) ? "imagen" : "archivo"} className="size-4" />
            {a}
          </span>
        ))}
        {m.texto && <p className="max-w-[80%] rounded-[20px] rounded-br-md bg-black px-4 py-3 text-[14px] leading-relaxed text-white">{m.texto}</p>}
      </div>
    );

  const t = m.tarjeta;
  return (
    <div className="flex gap-3">
      <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-amarillo">
        <IconoPortal nombre="chispa" className="size-3.5" />
      </span>
      <div className="min-w-0 max-w-[88%] flex-1">
        {m.texto && <p className="text-[14px] leading-relaxed">{m.texto}</p>}

        {t?.tipo === "clasificacion" && (
          <div className="mt-1 rounded-[20px] border-[1.5px] border-black/10 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] ${t.complejidad === "equipo" ? "bg-black text-amarillo" : "bg-amarillo text-black"}`}>
                {tiposCambio[t.complejidad].nombre}
              </span>
              <span className="text-[12px] text-black/55">{tiposCambio[t.complejidad].ejemplos}</span>
            </div>
            <p className="mt-3 text-[14px] font-semibold">
              {t.cobro === "plan" && `Usa 1 de tus ${t.quedan} cambios ${tiposCambio[t.complejidad].nombre.toLowerCase()}s restantes del plan ${plan}.`}
              {t.cobro === "suelto" &&
                `Tu plan no incluye más cambios de este tipo este mes. Cuesta ${precio(tiposCambio[t.complejidad].suelto)} por única vez, o sube de plan.`}
              {t.cobro === "equipo" && "La IA no toca esto por seguridad. Se lo mandamos al equipo con tu conversación y te responden en menos de 24 horas."}
            </p>
            {!t.resuelta ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <BotonPortal onClick={alConfirmar} className="!py-2.5">
                  {t.cobro === "plan" ? "Sí, hazlo" : t.cobro === "suelto" ? `Pagar ${precio(tiposCambio[t.complejidad].suelto)} y hacerlo` : "Mandar al equipo"}
                </BotonPortal>
                {t.cobro === "suelto" && (
                  <BotonPortal href="/portal/tienda/?vista=planes" tono="contorno" className="!py-2.5">
                    Ver planes
                  </BotonPortal>
                )}
                <BotonPortal onClick={alCancelar} tono="contorno" className="!py-2.5">
                  Cancelar
                </BotonPortal>
              </div>
            ) : (
              <p className="mt-3 text-[12px] font-bold text-black/45">{t.resuelta === "si" ? "✓ Confirmado" : "Cancelado"}</p>
            )}
          </div>
        )}

        {t?.tipo === "progreso" && (
          <div className="mt-1 rounded-[20px] bg-humo p-4">
            <ul className="space-y-2.5">
              {PASOS.map((p, i) => (
                <li key={p} className={`flex items-center gap-3 text-[13px] transition-opacity ${i <= t.paso ? "opacity-100" : "opacity-35"}`}>
                  <span className={`grid size-5 place-items-center rounded-full ${i < t.paso ? "bg-black text-amarillo" : "border-[1.5px] border-black/25"}`}>
                    {i < t.paso ? <IconoPortal nombre="check" className="size-3" /> : i === t.paso && <span className="size-2 animate-ping rounded-full bg-amarillo" />}
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {t?.tipo === "vista" && (
          <div className="mt-2 overflow-hidden rounded-[20px] border-[1.5px] border-black">
            <div className="grid grid-cols-2 divide-x divide-black/10 bg-humo text-[11px] font-bold uppercase tracking-[0.12em]">
              <span className="px-4 py-2 text-black/45">Antes</span>
              <span className="px-4 py-2">Después</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-black/10">
              {[false, true].map((despues) => (
                <div key={String(despues)} className="p-3">
                  <div className="overflow-hidden rounded-xl ring-1 ring-black/10">
                    <div className="flex gap-1 bg-black/[0.04] px-2 py-1.5">
                      <span className="size-1.5 rounded-full bg-black/20" />
                      <span className="size-1.5 rounded-full bg-black/20" />
                      <span className="size-1.5 rounded-full bg-amarillo" />
                    </div>
                    <div className="space-y-1.5 p-3">
                      <div className={`h-12 rounded-md ${despues ? "bg-amarillo/70" : "bg-black/10"}`} />
                      <div className="h-2 w-3/4 rounded bg-black/15" />
                      <div className={`h-2 rounded ${despues ? "w-2/3 bg-black/70" : "w-1/2 bg-black/15"}`} />
                      <div className="h-2 w-1/2 rounded bg-black/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-black/10 p-4">
              <p className="text-[13px] text-black/60">
                <b className="text-black">“{t.pedido || "Tu cambio"}”</b>
              </p>
              {!t.resuelta ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <BotonPortal tono="amarillo" onClick={alPublicar} className="!py-2.5">
                    <IconoPortal nombre="check" className="size-4" /> Aprobar y publicar
                  </BotonPortal>
                  <BotonPortal tono="contorno" disabled={t.rondas <= 0} onClick={() => alAjustar(t.pedido, t.rondas)} className="!py-2.5">
                    Pedir ajuste · quedan {t.rondas}
                  </BotonPortal>
                  <BotonPortal tono="contorno" onClick={() => {}} className="!py-2.5">
                    <IconoPortal nombre="ojo" className="size-4" /> Abrir vista previa
                  </BotonPortal>
                </div>
              ) : (
                <p className="mt-2 text-[12px] font-bold text-black/45">{t.resuelta === "publicado" ? "✓ Aprobado" : "Ajuste solicitado"}</p>
              )}
            </div>
          </div>
        )}

        {t?.tipo === "publicado" && (
          <div className="mt-1 flex items-center gap-3 rounded-[20px] bg-black px-4 py-3 text-white">
            <span className="grid size-8 place-items-center rounded-full bg-amarillo text-black">
              <IconoPortal nombre="check" className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-bold">Publicado en {cliente.dominio}</p>
              <p className="text-[12px] text-white/55">Guardamos un respaldo antes del cambio. Puedes regresarlo desde Mi página.</p>
            </div>
          </div>
        )}

        {t?.tipo === "equipo" && (
          <div className="mt-1 rounded-[20px] bg-black p-4 text-white">
            <p className="text-[11px] font-bold text-amarillo uppercase tracking-[0.14em]">Solicitud #{t.folio}</p>
            <p className="mt-1 text-[14px] font-semibold">Ya la tiene el equipo de Phot8can.</p>
            <p className="mt-1 text-[12px] text-white/60">Te escribimos por WhatsApp en menos de 24 horas con la solución o una cotización.</p>
          </div>
        )}
      </div>
    </div>
  );
}
