"use client";

import { useState } from "react";
import { IconoPortal } from "@/components/portal/Iconos";
import { BotonPortal, Encabezado, Estado, Medidor, Tarjeta, TituloTarjeta, precio } from "@/components/portal/Piezas";
import { Amex, Mastercard, Visa } from "@/components/pv/Tarjetas";
import { cliente, historialCobros } from "@/lib/portal";
import { guardar, usePortal } from "@/lib/portal-estado";

export default function Pagos() {
  const e = usePortal();
  const [cancelar, setCancelar] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const recurrentes = e.contratados.filter((c) => c.cobro !== "unico");
  const mensual = recurrentes.filter((c) => c.cobro === "mensual").reduce((s, c) => s + (c.precio ?? 0), 0);

  const hecho = (t: string) => {
    setAviso(t);
    setTimeout(() => setAviso(null), 3200);
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <Encabezado etiqueta="Pagos" titulo={<>Sin sorpresas. <span className="text-black/35">Sabes qué pagas y por qué.</span></>} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="grid content-start gap-5">
          {/* Tarjeta guardada */}
          <Tarjeta oscura>
            <TituloTarjeta icono="pagos" oscura>
              Método de pago
            </TituloTarjeta>
            <div className="relative aspect-[1.586] w-full max-w-[340px] overflow-hidden rounded-[18px] bg-gradient-to-br from-[#2a2a2a] to-[#0d0d0d] p-5 ring-1 ring-white/10">
              <div className="hero-brillo absolute -right-16 -bottom-20 size-56 rounded-full opacity-60 blur-xl" />
              <div className="relative flex h-full flex-col">
                <Visa className="h-5 self-end text-white" />
                <p className="mt-auto font-mono text-[17px] tracking-[0.18em]">•••• •••• •••• {cliente.tarjeta.ultimos}</p>
                <div className="mt-3 flex justify-between text-[11px] text-white/60">
                  <span>{cliente.nombreCompleto.toUpperCase()}</span>
                  <span>{cliente.tarjeta.vence}</span>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <BotonPortal tono="claro" onClick={() => hecho("En la versión final se abre la pantalla segura de Stripe para cambiar tu tarjeta.")}>
                Cambiar tarjeta
              </BotonPortal>
              <span className="flex items-center gap-2 text-white/50">
                <Visa className="h-3" />
                <Mastercard className="h-4" />
                <Amex className="h-4" />
              </span>
            </div>
            <p className="mt-4 flex items-center gap-2 text-[12px] text-white/45">
              <IconoPortal nombre="candado" className="size-4" />
              Tu tarjeta la guarda Stripe con estándar PCI DSS. Phot8can nunca ve el número completo.
            </p>
          </Tarjeta>

          {/* Uso agéntico */}
          <Tarjeta>
            <TituloTarjeta icono="rayo" accion={<span className="text-[12px] text-black/50">Noviembre</span>}>
              Uso del Agente 24/7
            </TituloTarjeta>
            <p className="titulo text-[30px] leading-none tabular-nums">{precio(64)}</p>
            <p className="mt-1 text-[12px] text-black/50">Ejemplo · se cobra por uso al cierre del mes</p>
            <div className="mt-5 space-y-4">
              <Medidor usado={412} total={1000} etiqueta="Conversaciones atendidas" />
              <Medidor usado={23} total={100} etiqueta="Citas agendadas por el agente" />
            </div>
            <p className="mt-4 text-[12px] text-black/55">Pon un tope de gasto mensual y te avisamos antes de llegar.</p>
          </Tarjeta>
        </div>

        <div className="grid content-start gap-5">
          {/* Cobros recurrentes */}
          <Tarjeta>
            <TituloTarjeta icono="reloj" accion={<span className="text-[13px] font-bold tabular-nums">{precio(mensual)} / mes</span>}>
              Cobros recurrentes
            </TituloTarjeta>
            <ul className="divide-y divide-black/[0.07]">
              {recurrentes.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{c.nombre}</p>
                    <p className="text-[12px] text-black/50">
                      {c.precio === null ? "Precio por definir" : precio(c.precio, c.cobro === "mensual" ? " / mes" : " / año")} · desde {c.fecha}
                    </p>
                  </div>
                  <Estado estado={c.estado} />
                  {c.tipo === "plan" || c.tipo === "base" ? (
                    cancelar === c.id ? (
                      <span className="flex items-center gap-2 text-[12px]">
                        ¿Cancelar al final del mes?
                        <button
                          onClick={() => {
                            guardar((s) => ({
                              ...s,
                              contratados: s.contratados.filter((x) => x.id !== c.id),
                              plan: c.tipo === "plan" ? null : s.plan,
                              base: c.tipo === "base" ? null : s.base,
                            }));
                            setCancelar(null);
                            hecho(`${c.nombre} se cancela al final del mes.`);
                          }}
                          className="font-bold underline"
                        >
                          Sí
                        </button>
                        <button onClick={() => setCancelar(null)} className="text-black/50">
                          No
                        </button>
                      </span>
                    ) : (
                      <button onClick={() => setCancelar(c.id)} className="text-[12px] font-semibold text-black/50 hover:text-black">
                        Cancelar
                      </button>
                    )
                  ) : null}
                </li>
              ))}
            </ul>
          </Tarjeta>

          {/* Historial */}
          <Tarjeta>
            <TituloTarjeta icono="archivo">Historial y facturas</TituloTarjeta>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[13px]">
                <thead>
                  <tr className="text-[11px] tracking-[0.14em] text-black/45 uppercase">
                    <th className="pb-3 font-bold">Fecha</th>
                    <th className="pb-3 font-bold">Concepto</th>
                    <th className="pb-3 text-right font-bold">Monto</th>
                    <th className="pb-3 text-right font-bold">Factura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.07]">
                  {historialCobros.map((h) => (
                    <tr key={h.fecha + h.concepto}>
                      <td className="py-3 pr-4 whitespace-nowrap text-black/60">{h.fecha}</td>
                      <td className="py-3 pr-4 font-semibold">{h.concepto}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">{precio(h.monto)}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => hecho("En la versión final se descargan el PDF y el XML de tu factura.")} className="inline-flex items-center gap-1 text-[12px] font-bold hover:underline">
                          <IconoPortal nombre="descarga" className="size-3.5" />
                          PDF · XML
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tarjeta>

          <Tarjeta>
            <TituloTarjeta icono="usuario" accion={<button onClick={() => hecho("Datos de facturación guardados.")} className="text-[12px] font-bold hover:underline">Editar</button>}>
              Datos de facturación
            </TituloTarjeta>
            <dl className="grid gap-4 text-[13px] sm:grid-cols-2">
              {[
                ["Razón social", "Clínica Dental Sonrisa S.A. de C.V. (ejemplo)"],
                ["RFC", "CDS110215XXX"],
                ["Uso de CFDI", "G03 · Gastos en general"],
                ["Correo para facturas", "facturas@clinicasonrisa.mx"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12px] text-black/50">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </Tarjeta>
        </div>
      </div>

      {aviso && (
        <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md rounded-2xl bg-black px-5 py-4 text-[13px] text-white shadow-2xl lg:bottom-8">
          {aviso}
        </div>
      )}
    </div>
  );
}
