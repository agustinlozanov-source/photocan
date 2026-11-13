"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { whatsapp } from "@/lib/content";
import { incluido, modulos, mxn, pagos, totalIncluido } from "@/lib/pagina-viva";
import { usePrecio } from "@/lib/precio";
import { Aparece } from "../ui";
import { Icono } from "./Icono";

type Metodo = "transferencia" | "tarjeta";

function Chevron({ abierto }: { abierto: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`size-4 transition-transform duration-300 ${abierto ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

/** Todo lo que trae el precio base, agrupado por categoría. */
function Incluido() {
  const { precio: precioBase } = usePrecio();
  return (
    <div className="rounded-[24px] bg-black p-[clamp(20px,2.6vw,40px)] text-white">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[13px] font-semibold text-amarillo">Incluido en {mxn(precioBase)}</p>
          <h3 className="titulo mt-3 max-w-[16ch] text-[clamp(26px,2.6vw,40px)] leading-[1.05]">Todo esto viene adentro.</h3>
        </div>
        <p className="text-right">
          <span className="titulo block text-[clamp(56px,6vw,96px)] leading-none text-amarillo tabular-nums">{totalIncluido}</span>
          <span className="text-[12px] text-white/50">funciones incluidas</span>
        </p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {incluido.map((c) => (
          <div key={c.categoria} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-amarillo text-black">
                <Icono nombre={c.icono} className="size-[18px]" />
              </span>
              <h4 className="text-[16px] font-semibold">{c.categoria}</h4>
              <span className="ml-auto text-[12px] text-white/40 tabular-nums">{c.items.length}</span>
            </div>
            <ul className="mt-4 space-y-2">
              {c.items.map((it) => (
                <li key={it} className="flex gap-2.5 text-[13.5px] leading-snug text-white/75">
                  <span className="mt-[3px] text-[10px] text-amarillo">✓</span>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Modulo({
  m,
  agregado,
  alternar,
}: {
  m: (typeof modulos)[number];
  agregado: boolean;
  alternar: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  return (
    <li className={`rounded-2xl border bg-white transition-colors ${agregado ? "border-black" : "border-black/8"}`}>
      <div className="flex items-center gap-4 p-4 md:p-5">
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="flex min-w-0 flex-1 items-center gap-4 text-left"
        >
          <span className={`grid size-11 shrink-0 place-items-center rounded-xl transition-colors ${agregado ? "bg-amarillo" : "bg-humo"}`}>
            <Icono nombre={m.icono} />
          </span>
          <span className="min-w-0">
            <span className="block text-[15.5px] leading-tight font-semibold">{m.nombre}</span>
            <span className="mt-1 block text-[13px] leading-snug text-gris">{m.resumen}</span>
            <span className={`mt-1.5 block text-[12px] font-semibold sm:hidden ${m.precio == null ? "text-black/40" : ""}`}>
              {m.precio == null ? "Por definir" : `+ ${mxn(m.precio)}`}
            </span>
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-3 pl-2">
            <span className={`text-right text-[13px] font-semibold whitespace-nowrap max-sm:hidden ${m.precio == null ? "text-black/40" : ""}`}>
              {m.precio == null ? "Por definir" : `+ ${mxn(m.precio)}`}
            </span>
            <Chevron abierto={abierto} />
          </span>
        </button>
        <button
          type="button"
          onClick={alternar}
          aria-pressed={agregado}
          className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors max-sm:px-3 ${
            agregado ? "bg-black text-white" : "border border-black/20 hover:border-black"
          }`}
        >
          {agregado ? "✓ Agregado" : "Agregar"}
        </button>
      </div>
      <div className={`grid transition-[grid-template-rows] duration-400 ease-out ${abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="grid gap-5 border-t border-black/8 px-5 py-5 sm:pl-[76px] xl:grid-cols-3">
            {[
              ["Qué es", m.que],
              ["Para qué sirve", m.para],
              ["Impacto", m.impacto],
            ].map(([t, d]) => (
              <div key={t}>
                <p className="text-[11px] font-semibold tracking-wide text-black/40 uppercase">{t}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

function folio() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `PV-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

/** Cotización imprimible: solo se ve al exportar a PDF. */
function Cotizacion({
  elegidos,
  total,
  porDefinir,
  metodo,
  meses,
  nombre,
  correo,
}: {
  elegidos: typeof modulos;
  total: number;
  porDefinir: number;
  metodo: Metodo;
  meses: number;
  nombre: string;
  correo: string;
}) {
  const { precio: precioBase } = usePrecio();
  // Solo en el navegador: en el servidor no hay document.body.
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!montado) return null;
  const nodo = document.body;
  const hoy = new Date();
  const vence = new Date(hoy.getTime() + pagos.vigenciaDias * 864e5);
  const f = (d: Date) => d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  return createPortal(
    <div id="cotizacion" className="hidden bg-white p-10 text-black print:block">
      <div className="flex items-start justify-between border-b-2 border-black pb-6">
        <img src="/marca/logo_color_fondo-claro.png" alt="Phot8can" className="h-12 w-auto" />
        <div className="text-right text-[12px]">
          <p className="titulo text-[20px]">Cotización</p>
          <p>Folio {folio()}</p>
          <p>{f(hoy)}</p>
          <p>Vigente hasta el {f(vence)}</p>
        </div>
      </div>
      <div className="mt-6 text-[13px]">
        <p className="text-black/50">Para</p>
        <p className="font-semibold">{nombre || "—"}</p>
        <p>{correo}</p>
      </div>
      <table className="mt-8 w-full text-[13px]">
        <thead>
          <tr className="border-b border-black/20 text-left">
            <th className="py-2">Concepto</th>
            <th className="py-2 text-right">Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black/10">
            <td className="py-3">
              <p className="font-semibold">Página Viva</p>
              <p className="text-black/60">{totalIncluido} funciones incluidas: {incluido.map((c) => c.categoria).join(", ")}.</p>
            </td>
            <td className="py-3 text-right align-top">{mxn(precioBase)}</td>
          </tr>
          {elegidos.map((m) => (
            <tr key={m.id} className="border-b border-black/10">
              <td className="py-3">
                <p className="font-semibold">{m.nombre}</p>
                <p className="text-black/60">{m.que}</p>
              </td>
              <td className="py-3 text-right align-top">{m.precio == null ? "Por definir" : mxn(m.precio)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 ml-auto w-72 text-[13px]">
        <div className="flex justify-between border-t-2 border-black pt-3 text-[16px] font-bold">
          <span>Total</span>
          <span>{mxn(total)}</span>
        </div>
        <p className="mt-1 text-right text-black/50">{pagos.notaPrecio}</p>
        {porDefinir > 0 && <p className="mt-2 text-right text-black/60">+ {porDefinir} módulo(s) por definir</p>}
        <p className="mt-4">
          Forma de pago:{" "}
          <b>{metodo === "transferencia" ? "Transferencia" : `Tarjeta, ${meses} meses sin intereses de ${mxn(Math.ceil(total / meses))}`}</b>
        </p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 text-[11px]">
        {incluido.map((c) => (
          <div key={c.categoria}>
            <p className="font-semibold">{c.categoria}</p>
            <p className="text-black/60">{c.items.join(" · ")}</p>
          </div>
        ))}
      </div>
      <p className="mt-10 border-t border-black/20 pt-4 text-[11px] text-black/60">
        Phot8can · Agencia creativa · WhatsApp +52 868 107 9743 · phot8can.com
      </p>
    </div>,
    nodo,
  );
}

export function PvConfigurador() {
  const { precio: precioBase, regular, etapa } = usePrecio();
  const [sel, setSel] = useState<string[]>([]);
  const [metodo, setMetodo] = useState<Metodo>("tarjeta");
  const [meses, setMeses] = useState(12);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const seccion = useRef<HTMLElement>(null);
  const [enVista, setEnVista] = useState(false);

  useEffect(() => {
    const el = seccion.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setEnVista(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const elegidos = useMemo(() => modulos.filter((m) => sel.includes(m.id)), [sel]);
  const total = precioBase + elegidos.reduce((n, m) => n + (m.precio ?? 0), 0);
  const porDefinir = elegidos.filter((m) => m.precio == null).length;
  const mensual = Math.ceil(total / meses);

  const alternar = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const mensaje = [
    "Hola Phot8can, quiero contratar mi Página Viva.",
    "",
    `• Página Viva: ${mxn(precioBase)}`,
    ...elegidos.map((m) => `• ${m.nombre}: ${m.precio == null ? "por definir" : mxn(m.precio)}`),
    "",
    `Total: ${mxn(total)} ${pagos.notaPrecio}${porDefinir ? ` + ${porDefinir} módulo(s) por definir` : ""}`,
    `Pago: ${metodo === "transferencia" ? "transferencia" : `tarjeta a ${meses} meses sin intereses`}`,
    ...(nombre ? [`Nombre: ${nombre}`] : []),
    ...(correo ? [`Correo: ${correo}`] : []),
  ].join("\n");

  return (
    <section id="arma-tu-proyecto" ref={seccion} className="bg-humo py-[7%] max-md:py-20">
      <div className="contenedor">
        <Aparece className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="etiqueta">Arma tu proyecto</p>
            <h2 className="titulo mt-4 max-w-[16ch] text-[clamp(34px,4.4vw,68px)] leading-[1.02]">Un precio. Todo lo importante adentro.</h2>
          </div>
          <p className="max-w-[44ch] text-[clamp(15px,1.15vw,18px)] leading-relaxed text-gris">
            Tu Página Viva ya trae {totalIncluido} funciones. Si tu negocio necesita más, súmale módulos con precio fijo, cotiza
            al momento y contrata desde aquí.
          </p>
        </Aparece>

        <div className="mt-[clamp(36px,4vw,64px)] grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <Incluido />

            <div>
              <div className="flex flex-wrap items-end justify-between gap-4 px-1">
                <div>
                  <h3 className="titulo text-[clamp(24px,2.2vw,34px)] leading-tight">Súmale módulos</h3>
                  <p className="mt-1 text-[14px] text-gris">Toca cualquiera para ver qué es, para qué sirve y qué impacto tiene.</p>
                </div>
                <span className="text-[13px] text-black/50">
                  {sel.length} de {modulos.length} agregados
                </span>
              </div>
              <ul className="mt-5 space-y-2.5">
                {modulos.map((m) => (
                  <Modulo key={m.id} m={m} agregado={sel.includes(m.id)} alternar={() => alternar(m.id)} />
                ))}
              </ul>
            </div>
          </div>

          {/* Resumen */}
          <aside id="resumen" className="rounded-[24px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-semibold">Tu proyecto</h3>
              {etapa && <span className="etiqueta rounded-full bg-amarillo px-3 py-1 text-[10px]">{etapa.nombre}</span>}
            </div>

            <ul className="mt-5 space-y-3 border-b border-black/10 pb-5 text-[14px]">
              <li className="flex items-baseline justify-between gap-3">
                <span className="font-semibold">Página Viva</span>
                <span className="text-right">
                  {etapa && <span className="mr-2 text-[12px] text-black/40 line-through">{mxn(regular)}</span>}
                  {mxn(precioBase)}
                </span>
              </li>
              {elegidos.map((m) => (
                <li key={m.id} className="flex items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-baseline gap-2">
                    <button type="button" onClick={() => alternar(m.id)} className="text-black/30 hover:text-black" aria-label={`Quitar ${m.nombre}`}>
                      ×
                    </button>
                    <span className="truncate">{m.nombre}</span>
                  </span>
                  <span className={`shrink-0 ${m.precio == null ? "text-black/40" : ""}`}>{m.precio == null ? "Por definir" : mxn(m.precio)}</span>
                </li>
              ))}
              {elegidos.length === 0 && <li className="text-[13px] text-black/40">Sin módulos extra. Ya trae todo lo esencial.</li>}
            </ul>

            <div className="flex items-baseline justify-between pt-5">
              <span className="text-[14px] font-semibold">Total</span>
              <span className="titulo text-[34px] leading-none tabular-nums">{mxn(total)}</span>
            </div>
            <p className="mt-1 text-right text-[12px] text-black/50">
              {pagos.notaPrecio}
              {porDefinir > 0 && ` · + ${porDefinir} por definir`}
            </p>

            <p className="mt-6 text-[12px] font-semibold tracking-wide text-black/40 uppercase">Forma de pago</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  ["tarjeta", "Tarjeta", "Hasta 12 MSI"],
                  ["transferencia", "Transferencia", "Pago único"],
                ] as const
              ).map(([v, t, s]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMetodo(v)}
                  aria-pressed={metodo === v}
                  className={`rounded-xl border p-3 text-left transition-colors ${metodo === v ? "border-black bg-black text-white" : "border-black/15 hover:border-black/40"}`}
                >
                  <span className="block text-[14px] font-semibold">{t}</span>
                  <span className={`block text-[12px] ${metodo === v ? "text-white/60" : "text-black/50"}`}>{s}</span>
                </button>
              ))}
            </div>

            {metodo === "tarjeta" && (
              <div className="mt-3 rounded-xl bg-humo p-4">
                <div className="flex gap-1.5">
                  {pagos.meses.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setMeses(n)}
                      aria-pressed={meses === n}
                      className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition-colors ${meses === n ? "bg-amarillo" : "bg-white hover:bg-white/60"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-center text-[14px]">
                  <b className="titulo text-[22px]">{mxn(mensual)}</b> al mes · {meses} meses sin intereses
                </p>
              </div>
            )}

            <div className="mt-5 space-y-2">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre o el de tu negocio"
                className="w-full rounded-xl border border-black/15 px-4 py-3 text-[14px] outline-none focus:border-black"
              />
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Tu correo (para la cotización)"
                className="w-full rounded-xl border border-black/15 px-4 py-3 text-[14px] outline-none focus:border-black"
              />
            </div>

            <a
              href={whatsapp(mensaje)}
              target="_blank"
              rel="noopener"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-amarillo px-6 py-4 text-[15px] font-semibold text-black transition-colors hover:bg-black hover:text-white"
            >
              Contratar ahora
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-black/20 px-6 py-3.5 text-[14px] font-semibold transition-colors hover:border-black"
            >
              Descargar cotización en PDF
            </button>
            <p className="mt-4 text-center text-[12px] leading-relaxed text-black/50">
              Al contratar te confirmamos por WhatsApp y te enviamos {metodo === "tarjeta" ? "tu link de pago a meses" : "los datos para transferir"}.
            </p>
          </aside>
        </div>
      </div>

      {/* Barra fija en celular */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[60] flex items-center justify-between gap-4 border-t border-black/10 bg-white/95 px-5 py-3 backdrop-blur transition-transform duration-300 lg:hidden ${
          enVista ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div>
          <p className="titulo text-[20px] leading-none tabular-nums">{mxn(total)}</p>
          <p className="text-[11px] text-black/50">o {mxn(Math.ceil(total / 12))} × 12 MSI</p>
        </div>
        <a href="#resumen" className="rounded-full bg-black px-5 py-3 text-[14px] font-semibold text-white">
          Ver resumen
        </a>
      </div>

      <Cotizacion elegidos={elegidos} total={total} porDefinir={porDefinir} metodo={metodo} meses={meses} nombre={nombre} correo={correo} />
    </section>
  );
}
