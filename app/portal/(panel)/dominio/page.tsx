"use client";

import { useState } from "react";
import { IconoPortal } from "@/components/portal/Iconos";
import { BotonPortal, Encabezado, Estado, Tarjeta, TituloTarjeta, precio } from "@/components/portal/Piezas";
import { cliente, extensiones } from "@/lib/portal";
import { guardar, hoy, usePortal } from "@/lib/portal-estado";

const limpiar = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\..*$/, "")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 63);

/** Disponibilidad simulada y estable para la demo. En producción se consulta al registrador. */
function disponible(nombre: string, ext: string) {
  if (`${nombre}${ext}` === cliente.dominio) return false;
  let h = 0;
  for (const ch of nombre + ext) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 5 !== 0;
}

export default function Dominio() {
  const e = usePortal();
  const [busqueda, setBusqueda] = useState("");
  const [nombre, setNombre] = useState("");
  const [comprando, setComprando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const mios = e.contratados.filter((c) => c.tipo === "dominio");

  return (
    <div className="mx-auto max-w-[1100px]">
      <Encabezado etiqueta="Dominios" titulo={<>El nombre de tu negocio en internet. <span className="text-black/35">Al costo.</span></>} />

      <Tarjeta oscura className="relative overflow-hidden">
        <div className="hero-brillo pointer-events-none absolute -right-40 -bottom-60 size-[520px] rounded-full opacity-40 blur-2xl" />
        <form
          className="relative"
          onSubmit={(ev) => {
            ev.preventDefault();
            setNombre(limpiar(busqueda));
          }}
        >
          <label htmlFor="buscar-dominio" className="text-[14px] font-bold">
            Busca tu dominio
          </label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-full bg-white px-5 text-black">
              <IconoPortal nombre="dominio" className="size-5 shrink-0 text-black/40" />
              <input
                id="buscar-dominio"
                value={busqueda}
                onChange={(ev) => setBusqueda(ev.target.value)}
                placeholder="clinicasonrisa"
                className="min-w-0 flex-1 bg-transparent py-4 text-[16px] outline-none placeholder:text-black/30"
              />
            </div>
            <BotonPortal type="submit" tono="amarillo" className="!px-7 !py-4" disabled={!limpiar(busqueda)}>
              Buscar
            </BotonPortal>
          </div>
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/65">
            {["Queda a tu nombre", "Sin ganancia para Phot8can", "Renovación automática con aviso"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <IconoPortal nombre="check" className="size-4 text-amarillo" /> {t}
              </span>
            ))}
          </p>
        </form>
      </Tarjeta>

      {nombre && (
        <Tarjeta className="mt-5">
          <TituloTarjeta icono="dominio" accion={<span className="text-[12px] text-black/45">Precios de ejemplo por año</span>}>
            Resultados para “{nombre}”
          </TituloTarjeta>
          <ul className="divide-y divide-black/[0.07]">
            {extensiones.map((x) => {
              const dominio = `${nombre}${x.ext}`;
              const libre = disponible(nombre, x.ext);
              const ya = mios.some((m) => m.nombre === dominio);
              return (
                <li key={x.ext} className="flex flex-wrap items-center gap-3 py-3.5">
                  <span className="min-w-0 flex-1 truncate text-[16px] font-bold">
                    {nombre}
                    <span className="text-black/40">{x.ext}</span>
                  </span>
                  {ya ? (
                    <Estado estado="activo" />
                  ) : libre ? (
                    <>
                      <span className="text-[14px] font-bold tabular-nums">{precio(x.precio)} / año</span>
                      {comprando === dominio ? (
                        <span className="flex items-center gap-2 text-[12px]">
                          ¿Cobrar a tu {cliente.tarjeta.marca} •••• {cliente.tarjeta.ultimos}?
                          <button
                            onClick={() => {
                              guardar((s) => ({
                                ...s,
                                contratados: [
                                  ...s.contratados,
                                  { id: `dominio-${dominio}`, nombre: dominio, tipo: "dominio", estado: "activo", precio: x.precio, cobro: "anual", fecha: hoy() },
                                ],
                              }));
                              setComprando(null);
                              setAviso(`${dominio} ya es tuyo. Lo registramos a tu nombre.`);
                              setTimeout(() => setAviso(null), 3500);
                            }}
                            className="font-bold underline"
                          >
                            Sí
                          </button>
                          <button onClick={() => setComprando(null)} className="text-black/50">
                            No
                          </button>
                        </span>
                      ) : (
                        <BotonPortal className="!py-2.5" onClick={() => setComprando(dominio)}>
                          Comprar
                        </BotonPortal>
                      )}
                    </>
                  ) : (
                    <span className="rounded-full bg-humo px-3 py-1.5 text-[12px] font-semibold text-black/45">Ocupado</span>
                  )}
                </li>
              );
            })}
          </ul>
        </Tarjeta>
      )}

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Tarjeta>
          <TituloTarjeta icono="expediente">Tus dominios</TituloTarjeta>
          <ul className="divide-y divide-black/[0.07]">
            {mios.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-bold">{m.nombre}</span>
                  <span className="block text-[12px] text-black/50">
                    {precio(m.precio)} / año · desde {m.fecha}
                  </span>
                </span>
                <Estado estado={m.estado} />
              </li>
            ))}
          </ul>
        </Tarjeta>
        <Tarjeta className="bg-amarillo/15 !border-amarillo/40">
          <TituloTarjeta icono="pagos">¿Por qué al costo?</TituloTarjeta>
          <p className="text-[14px] leading-relaxed text-black/70">
            Tu dominio es tuyo, no un negocio para nosotros. Te cobramos exactamente lo que cobra el registrador, sin comisión. Si un día te
            vas, te lo llevas.
          </p>
        </Tarjeta>
      </div>

      {aviso && (
        <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md rounded-2xl bg-black px-5 py-4 text-[13px] text-white shadow-2xl lg:bottom-8">{aviso}</div>
      )}
    </div>
  );
}
