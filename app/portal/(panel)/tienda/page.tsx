"use client";

import { useState } from "react";
import { IconoPortal } from "@/components/portal/Iconos";
import { BotonPortal, Encabezado, Estado, Tarjeta, precio } from "@/components/portal/Piezas";
import { Icono } from "@/components/pv/Icono";
import { modulos } from "@/lib/pagina-viva";
import { basesDatos, cliente, planesCambios } from "@/lib/portal";
import { guardar, hoy, useParametro, usePortal, type Contratado } from "@/lib/portal-estado";

type Vista = "planes" | "base" | "complementos";
type Item = { id: string; nombre: string; tipo: Contratado["tipo"]; precio: number | null; cobro: Contratado["cobro"]; automatico: boolean };

/** Complementos que se activan solos; el resto los prepara el equipo. */
const AUTOMATICOS = new Set(["citas", "ingles", "paginas"]);
const complementos = modulos.filter((m) => m.id !== "cuidado");

export default function Tienda() {
  const e = usePortal();
  const param = useParametro("vista") as Vista | null;
  const [tab, setTab] = useState<Vista | null>(null);
  const vista: Vista = tab ?? (param && ["planes", "base", "complementos"].includes(param) ? param : "complementos");
  const [carrito, setCarrito] = useState<Item[]>([]);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [pago, setPago] = useState<"cerrado" | "revisar" | "procesando" | "listo">("cerrado");
  const [verCarrito, setVerCarrito] = useState(false);

  const enCarrito = (id: string) => carrito.some((i) => i.id === id);
  const contratado = (id: string) => e.contratados.find((c) => c.id === id);
  const agregar = (it: Item) =>
    setCarrito((c) => {
      // Solo un plan y una base a la vez.
      const sinMismoTipo = it.tipo === "plan" || it.tipo === "base" ? c.filter((x) => x.tipo !== it.tipo) : c;
      return enCarrito(it.id) ? c.filter((x) => x.id !== it.id) : [...sinMismoTipo, it];
    });

  const hoyPagas = carrito.reduce((s, i) => s + (i.precio ?? 0), 0);
  const cadaMes = carrito.filter((i) => i.cobro === "mensual").reduce((s, i) => s + (i.precio ?? 0), 0);
  const porConfirmar = carrito.some((i) => i.precio === null);

  function pagar() {
    setPago("procesando");
    setTimeout(() => {
      guardar((s) => {
        let lista = s.contratados;
        const plan = carrito.find((i) => i.tipo === "plan");
        const base = carrito.find((i) => i.tipo === "base");
        if (plan) lista = lista.filter((c) => c.tipo !== "plan");
        if (base) lista = lista.filter((c) => c.tipo !== "base");
        const nuevos: Contratado[] = carrito.map((i) => ({
          id: i.id,
          nombre: i.nombre,
          tipo: i.tipo,
          precio: i.precio,
          cobro: i.cobro,
          estado: i.automatico ? "activo" : "preparacion",
          fecha: hoy(),
        }));
        return {
          ...s,
          plan: plan ? (plan.id.replace("plan-", "") as typeof s.plan) : s.plan,
          base: base ? (base.id.replace("base-", "") as typeof s.base) : s.base,
          contratados: [...lista.filter((c) => !nuevos.some((n) => n.id === c.id)), ...nuevos],
        };
      });
      setPago("listo");
    }, 1600);
  }

  const pestañas: { id: Vista; texto: string; icono: Parameters<typeof IconoPortal>[0]["nombre"] }[] = [
    { id: "complementos", texto: "Complementos", icono: "tienda" },
    { id: "planes", texto: "Planes de cambios", icono: "chat" },
    { id: "base", texto: "Base de datos", icono: "base" },
  ];

  return (
    <div className="mx-auto max-w-[1280px]">
      <Encabezado etiqueta="Tienda" titulo={<>Haz crecer tu página <span className="text-black/35">cuando quieras.</span></>} />

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {pestañas.map((p) => (
          <button
            key={p.id}
            onClick={() => setTab(p.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition-colors ${
              vista === p.id ? "bg-black text-white" : "bg-white text-black/70 ring-1 ring-black/[0.07] hover:text-black"
            }`}
          >
            <IconoPortal nombre={p.icono} className="size-4" />
            {p.texto}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {vista === "complementos" && (
            <div className="grid gap-4 md:grid-cols-2">
              {complementos.map((m) => {
                const id = `modulo-${m.id}`;
                const ya = contratado(id);
                const sel = enCarrito(id);
                return (
                  <Tarjeta key={m.id} className={`flex flex-col transition-colors ${sel ? "!border-black" : ""}`}>
                    <div className="flex items-start gap-4">
                      <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${sel || ya ? "bg-amarillo" : "bg-humo"}`}>
                        <Icono nombre={m.icono} className="size-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] leading-snug font-bold">{m.nombre}</h3>
                        <p className="mt-1 text-[13px] text-black/55">{m.resumen}</p>
                      </div>
                    </div>
                    <button onClick={() => setAbierto(abierto === m.id ? null : m.id)} className="mt-3 self-start text-[12px] font-bold text-black/60 hover:text-black">
                      {abierto === m.id ? "Menos detalles ↑" : "¿Qué es y para qué sirve? ↓"}
                    </button>
                    {abierto === m.id && (
                      <dl className="mt-3 space-y-3 rounded-2xl bg-humo p-4 text-[13px] leading-relaxed">
                        {[
                          ["Qué es", m.que],
                          ["Para quién", m.para],
                          ["Impacto", m.impacto],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <dt className="text-[11px] font-bold tracking-[0.14em] text-black/45 uppercase">{k}</dt>
                            <dd>{v}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                      <div>
                        <p className="text-[15px] font-bold">{precio(m.precio)}</p>
                        <p className="text-[11px] text-black/45">{AUTOMATICOS.has(m.id) ? "Se activa al pagar" : "Lo prepara el equipo"}</p>
                      </div>
                      {ya ? (
                        <Estado estado={ya.estado} />
                      ) : (
                        <BotonPortal
                          tono={sel ? "amarillo" : "negro"}
                          className="!py-2.5"
                          onClick={() =>
                            agregar({ id, nombre: m.nombre, tipo: "complemento", precio: m.precio, cobro: "unico", automatico: AUTOMATICOS.has(m.id) })
                          }
                        >
                          {sel ? "✓ En tu carrito" : "Agregar"}
                        </BotonPortal>
                      )}
                    </div>
                  </Tarjeta>
                );
              })}
            </div>
          )}

          {vista === "planes" && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {planesCambios.map((p) => {
                  const id = `plan-${p.id}`;
                  const actual = e.plan === p.id;
                  const sel = enCarrito(id);
                  const oscuro = "destacado" in p && p.destacado;
                  return (
                    <Tarjeta key={p.id} oscura={oscuro} className={`flex flex-col ${sel ? "ring-2 ring-amarillo" : ""}`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-extrabold tracking-[0.16em] uppercase">{p.nombre}</h3>
                        {actual ? (
                          <span className="rounded-full bg-amarillo px-2.5 py-1 text-[11px] font-bold text-black">Tu plan</span>
                        ) : oscuro ? (
                          <span className="rounded-full border border-white/30 px-2.5 py-1 text-[11px] font-bold">El más elegido</span>
                        ) : null}
                      </div>
                      <p className="titulo mt-4 text-[40px] leading-none tabular-nums">
                        {precio(p.precio)}
                        <span className={`ml-1 text-[13px] font-semibold tracking-normal ${oscuro ? "text-white/50" : "text-black/45"}`}>/ mes</span>
                      </p>
                      <p className={`mt-2 text-[13px] ${oscuro ? "text-white/60" : "text-black/55"}`}>{p.para}</p>
                      <ul className="mt-5 space-y-2.5 text-[14px]">
                        {(
                          [
                            ["simple", "cambios simples"],
                            ["mediano", "cambios medianos"],
                            ["complejo", "cambio complejo"],
                          ] as const
                        ).map(([k, t]) =>
                          p.incluye[k] > 0 ? (
                            <li key={k} className="flex items-center gap-2.5">
                              <IconoPortal nombre="check" className="size-4 text-amarillo" />
                              <span>
                                <b className="tabular-nums">{p.incluye[k]}</b> {p.incluye[k] === 1 ? t : t.replace("cambio ", "cambios ").replace("complejo", "complejos")}
                              </span>
                            </li>
                          ) : null,
                        )}
                        <li className="flex items-center gap-2.5">
                          <IconoPortal nombre="check" className="size-4 text-amarillo" />3 rondas de ajustes por cambio
                        </li>
                        <li className="flex items-center gap-2.5">
                          <IconoPortal nombre="check" className="size-4 text-amarillo" />
                          Respaldo antes de cada cambio
                        </li>
                      </ul>
                      <div className="mt-auto pt-6">
                        {actual ? (
                          <p className={`text-center text-[13px] font-semibold ${oscuro ? "text-white/55" : "text-black/45"}`}>Es tu plan actual</p>
                        ) : (
                          <BotonPortal
                            tono={oscuro ? "amarillo" : sel ? "amarillo" : "negro"}
                            className="w-full"
                            onClick={() => agregar({ id, nombre: `Plan de cambios ${p.nombre}`, tipo: "plan", precio: p.precio, cobro: "mensual", automatico: true })}
                          >
                            {sel ? "✓ En tu carrito" : e.plan ? "Cambiar a este plan" : "Elegir este plan"}
                          </BotonPortal>
                        )}
                      </div>
                    </Tarjeta>
                  );
                })}
              </div>
              <p className="mt-5 max-w-[70ch] text-[13px] leading-relaxed text-black/55">
                Los cambios se renuevan cada mes y no se acumulan. Si un mes necesitas más, pides un cambio suelto sin cambiar de plan.
                Puedes cancelar cuando quieras.
              </p>
            </>
          )}

          {vista === "base" && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {basesDatos.map((b, i) => {
                  const id = `base-${b.id}`;
                  const actual = e.base === b.id;
                  const sel = enCarrito(id);
                  return (
                    <Tarjeta key={b.id} className={`flex flex-col ${sel ? "!border-black" : ""}`}>
                      <div className="flex items-end gap-1" aria-hidden>
                        {[0, 1, 2].map((n) => (
                          <span key={n} className={`w-4 rounded-sm ${n <= i ? "bg-amarillo" : "bg-black/[0.07]"}`} style={{ height: 12 + n * 10 }} />
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <h3 className="text-[13px] font-extrabold tracking-[0.16em] uppercase">{b.nombre}</h3>
                        {actual && <span className="rounded-full bg-amarillo px-2.5 py-1 text-[11px] font-bold">Tu base</span>}
                      </div>
                      <p className="titulo mt-3 text-[36px] leading-none tabular-nums">
                        {"desde" in b && b.desde && <span className="mr-1 text-[13px] font-semibold tracking-normal text-black/45">desde</span>}
                        {precio(b.precio)}
                        <span className="ml-1 text-[13px] font-semibold tracking-normal text-black/45">/ mes</span>
                      </p>
                      <ul className="mt-5 space-y-2 text-[14px]">
                        <li className="flex items-center gap-2.5">
                          <IconoPortal nombre="base" className="size-4" />
                          {b.registros}
                        </li>
                        <li className="flex items-center gap-2.5">
                          <IconoPortal nombre="archivo" className="size-4" />
                          {b.archivos}
                        </li>
                        <li className="flex items-center gap-2.5">
                          <IconoPortal nombre="regresar" className="size-4" />
                          Respaldo diario
                        </li>
                      </ul>
                      <p className="mt-4 text-[13px] text-black/55">{b.para}</p>
                      <div className="mt-auto pt-6">
                        {actual ? (
                          <p className="text-center text-[13px] font-semibold text-black/45">Es tu base actual</p>
                        ) : (
                          <BotonPortal
                            tono={sel ? "amarillo" : "negro"}
                            className="w-full"
                            onClick={() => agregar({ id, nombre: `Base de datos ${b.nombre}`, tipo: "base", precio: b.precio, cobro: "mensual", automatico: b.id !== "dedicada" })}
                          >
                            {sel ? "✓ En tu carrito" : e.base ? "Cambiar a esta" : "Elegir esta"}
                          </BotonPortal>
                        )}
                      </div>
                    </Tarjeta>
                  );
                })}
              </div>
              <Tarjeta className="mt-5">
                <p className="flex gap-3 text-[13px] leading-relaxed text-black/65">
                  <IconoPortal nombre="candado" className="size-5 shrink-0" />
                  Tus datos viven separados de los de otros clientes, cifrados y con respaldo diario. Puedes descargarlos completos cuando quieras
                  desde Mi página.
                </p>
              </Tarjeta>
            </>
          )}
        </div>

        {/* Carrito (escritorio) */}
        <aside className="hidden xl:block">
          <div className="sticky top-6">
            <Carrito
              carrito={carrito}
              quitar={(id) => setCarrito((c) => c.filter((x) => x.id !== id))}
              hoyPagas={hoyPagas}
              cadaMes={cadaMes}
              porConfirmar={porConfirmar}
              alPagar={() => setPago("revisar")}
            />
          </div>
        </aside>
      </div>

      {/* Carrito (móvil) */}
      {carrito.length > 0 && (
        <button
          onClick={() => setVerCarrito(true)}
          className="fixed inset-x-4 bottom-[88px] z-30 flex items-center justify-between rounded-full bg-black px-5 py-3.5 text-white shadow-2xl xl:hidden"
        >
          <span className="flex items-center gap-2 text-[13px] font-bold">
            <span className="grid size-6 place-items-center rounded-full bg-amarillo text-[11px] text-black">{carrito.length}</span>
            Ver carrito
          </span>
          <span className="text-[14px] font-bold tabular-nums">{precio(hoyPagas)}</span>
        </button>
      )}
      {verCarrito && (
        <div className="fixed inset-0 z-50 bg-black/50 xl:hidden" onClick={() => setVerCarrito(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[28px] bg-humo p-4 pb-[max(16px,env(safe-area-inset-bottom))]" onClick={(ev) => ev.stopPropagation()}>
            <Carrito
              carrito={carrito}
              quitar={(id) => setCarrito((c) => c.filter((x) => x.id !== id))}
              hoyPagas={hoyPagas}
              cadaMes={cadaMes}
              porConfirmar={porConfirmar}
              alPagar={() => {
                setVerCarrito(false);
                setPago("revisar");
              }}
            />
          </div>
        </div>
      )}

      {/* Pago */}
      {pago !== "cerrado" && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => pago !== "procesando" && setPago("cerrado")}>
          <div className="w-full max-w-[460px] rounded-[28px] bg-white p-6 sm:p-8" onClick={(ev) => ev.stopPropagation()}>
            {pago === "listo" ? (
              <div className="text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-amarillo">
                  <IconoPortal nombre="check" className="size-8" />
                </span>
                <h2 className="titulo mt-6 text-[28px]">¡Listo, {cliente.nombre}!</h2>
                <ul className="mt-5 space-y-2 text-left">
                  {carrito.map((i) => (
                    <li key={i.id} className="flex items-center justify-between gap-3 rounded-2xl bg-humo px-4 py-3 text-[13px]">
                      <span className="min-w-0 truncate font-semibold">{i.nombre}</span>
                      <Estado estado={i.automatico ? "activo" : "preparacion"} />
                    </li>
                  ))}
                </ul>
                {carrito.some((i) => !i.automatico) && (
                  <p className="mt-4 text-[13px] text-black/60">Lo que está en preparación ya le llegó al equipo. Te escribimos en menos de 24 horas.</p>
                )}
                <BotonPortal
                  className="mt-6 w-full"
                  onClick={() => {
                    setCarrito([]);
                    setPago("cerrado");
                  }}
                >
                  Seguir
                </BotonPortal>
              </div>
            ) : (
              <>
                <h2 className="titulo text-[26px]">Confirma tu pago</h2>
                <ul className="mt-5 divide-y divide-black/[0.07]">
                  {carrito.map((i) => (
                    <li key={i.id} className="flex justify-between gap-3 py-2.5 text-[13px]">
                      <span className="min-w-0">{i.nombre}</span>
                      <span className="shrink-0 font-semibold tabular-nums">{precio(i.precio, i.cobro === "mensual" ? " / mes" : "")}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-baseline justify-between border-t-2 border-black pt-4">
                  <span className="text-[14px] font-bold">Hoy pagas</span>
                  <span className="titulo text-[28px] tabular-nums">{precio(hoyPagas)}</span>
                </div>
                {porConfirmar && <p className="mt-1 text-[12px] text-black/50">Los precios por definir se cobran cuando el equipo te confirme la cotización.</p>}
                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-humo px-4 py-3 text-[13px]">
                  <IconoPortal nombre="pagos" className="size-5" />
                  <span className="flex-1 font-semibold">
                    {cliente.tarjeta.marca} •••• {cliente.tarjeta.ultimos}
                  </span>
                  <a href="/portal/pagos/" className="text-[12px] font-bold hover:underline">
                    Cambiar
                  </a>
                </div>
                <BotonPortal tono="amarillo" className="mt-5 w-full !py-4" onClick={pagar} disabled={pago === "procesando"}>
                  <IconoPortal nombre="candado" className="size-4" />
                  {pago === "procesando" ? "Procesando…" : `Pagar ${precio(hoyPagas)}`}
                </BotonPortal>
                <p className="mt-3 text-center text-[11px] text-black/45">Demostración: no se hace ningún cobro real.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Carrito({
  carrito,
  quitar,
  hoyPagas,
  cadaMes,
  porConfirmar,
  alPagar,
}: {
  carrito: Item[];
  quitar: (id: string) => void;
  hoyPagas: number;
  cadaMes: number;
  porConfirmar: boolean;
  alPagar: () => void;
}) {
  return (
    <Tarjeta>
      <h2 className="flex items-center gap-2 text-[15px] font-bold">
        <IconoPortal nombre="tienda" className="size-5" /> Tu carrito
      </h2>
      {carrito.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-humo px-4 py-6 text-center text-[13px] text-black/50">
          Agrega un complemento, un plan o una base de datos.
        </p>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-black/[0.07]">
            {carrito.map((i) => (
              <li key={i.id} className="flex items-start gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold">{i.nombre}</p>
                  <p className="text-[12px] text-black/50">
                    {precio(i.precio, i.cobro === "mensual" ? " / mes" : "")} · {i.automatico ? "Se activa al pagar" : "Lo prepara el equipo"}
                  </p>
                </div>
                <button onClick={() => quitar(i.id)} aria-label={`Quitar ${i.nombre}`} className="text-black/35 hover:text-black">
                  <IconoPortal nombre="cerrar" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1.5 border-t-2 border-black pt-4 text-[13px]">
            <div className="flex justify-between">
              <dt className="font-bold">Hoy pagas</dt>
              <dd className="text-[18px] font-extrabold tabular-nums">{precio(hoyPagas)}</dd>
            </div>
            <div className="flex justify-between text-black/55">
              <dt>Después, cada mes</dt>
              <dd className="tabular-nums">{precio(cadaMes)}</dd>
            </div>
          </dl>
          {porConfirmar && <p className="mt-2 text-[11px] text-black/45">Incluye precios por definir; se confirman antes de cobrarse.</p>}
          <BotonPortal tono="amarillo" className="mt-5 w-full" onClick={alPagar}>
            <IconoPortal nombre="candado" className="size-4" /> Pagar
          </BotonPortal>
        </>
      )}
    </Tarjeta>
  );
}
