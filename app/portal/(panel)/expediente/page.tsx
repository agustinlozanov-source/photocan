"use client";

import { useState } from "react";
import { IconoPortal } from "@/components/portal/Iconos";
import { BotonPortal, Encabezado, Estado, Tarjeta, TituloTarjeta } from "@/components/portal/Piezas";
import { accesos, basesDatos, cliente, respaldos } from "@/lib/portal";
import { usePortal } from "@/lib/portal-estado";

const DNS = [
  { tipo: "A", nombre: "@", valor: "75.2.60.5" },
  { tipo: "CNAME", nombre: "www", valor: "clinicasonrisa.netlify.app" },
  { tipo: "MX", nombre: "@", valor: "Sin correo configurado" },
];

export default function Expediente() {
  const e = usePortal();
  const [restaurando, setRestaurando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [verDns, setVerDns] = useState(false);
  const base = basesDatos.find((b) => b.id === e.base);

  const hecho = (t: string) => {
    setAviso(t);
    setTimeout(() => setAviso(null), 3200);
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <Encabezado etiqueta="Mi página" titulo={<>Todo a tu nombre. <span className="text-black/35">Todo en orden.</span></>}>
        <BotonPortal tono="contorno" onClick={() => hecho("Preparando tus datos. Te mandamos el archivo por correo.")}>
          <IconoPortal nombre="descarga" className="size-4" />
          Descargar todos mis datos
        </BotonPortal>
      </Encabezado>

      <div className="grid gap-5 lg:grid-cols-2">
        <Tarjeta oscura>
          <TituloTarjeta icono="expediente" oscura accion={<span className="text-[12px] text-white/50">Expediente</span>}>
            {cliente.dominio}
          </TituloTarjeta>
          <dl className="divide-y divide-white/10">
            {[
              ["Titular del dominio", cliente.nombreCompleto, "A tu nombre"],
              ["Renovación del dominio", "15 sep 2027 · automática", "Programada"],
              ["Hospedaje", "Nube de clase mundial · Netlify", "Activo"],
              ["Certificado de seguridad (HTTPS)", "Se renueva solo", "Activo"],
              ["Base de datos", base ? `${base.nombre} · ${base.registros}` : "Sin base de datos", base ? "Activo" : "—"],
              ["Velocidad en celular", "96 de 100 · ejemplo", "Excelente"],
            ].map(([k, v, s]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <dt className="text-[12px] text-white/45">{k}</dt>
                  <dd className="truncate text-[14px] font-semibold">{v}</dd>
                </div>
                <span className="shrink-0 rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-bold">{s}</span>
              </div>
            ))}
          </dl>
          <button onClick={() => setVerDns((v) => !v)} className="mt-4 flex items-center gap-2 text-[12px] font-bold text-amarillo">
            <IconoPortal nombre="dominio" className="size-4" />
            {verDns ? "Ocultar registros DNS" : "Ver registros DNS"}
          </button>
          {verDns && (
            <div className="mt-3 overflow-x-auto rounded-xl bg-white/[0.06] p-3">
              <table className="w-full text-left text-[12px]">
                <thead className="text-white/45">
                  <tr>
                    <th className="pb-2 font-semibold">Tipo</th>
                    <th className="pb-2 font-semibold">Nombre</th>
                    <th className="pb-2 font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {DNS.map((d) => (
                    <tr key={d.tipo + d.nombre}>
                      <td className="py-1 pr-4">{d.tipo}</td>
                      <td className="py-1 pr-4">{d.nombre}</td>
                      <td className="py-1">{d.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Tarjeta>

        <Tarjeta>
          <TituloTarjeta
            icono="equipo"
            accion={
              <button onClick={() => hecho("Invitación lista. En la versión final se manda por correo.")} className="text-[12px] font-bold hover:underline">
                + Invitar
              </button>
            }
          >
            Quién tiene acceso
          </TituloTarjeta>
          <ul className="divide-y divide-black/[0.07]">
            {accesos.map((a) => (
              <li key={a.correo} className="flex items-center gap-3 py-3 first:pt-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-humo text-[12px] font-extrabold">
                  {a.nombre
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">{a.nombre}</p>
                  <p className="truncate text-[12px] text-black/50">{a.correo}</p>
                </div>
                <span className="shrink-0 text-[12px] font-semibold text-black/60">{a.rol}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 rounded-xl bg-humo px-4 py-3 text-[12px] leading-relaxed text-black/65">
            <IconoPortal nombre="candado" className="size-4 shrink-0" />
            Tú decides quién entra. Si alguien deja de trabajar contigo, le quitas el acceso con un clic y tu página sigue siendo
            tuya.
          </p>
        </Tarjeta>

        <Tarjeta className="lg:col-span-2">
          <TituloTarjeta icono="regresar" accion={<span className="text-[12px] text-black/50">Se guardan 30 días</span>}>
            Respaldos
          </TituloTarjeta>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {respaldos.map((r) => (
              <li key={r.fecha} className="flex flex-col rounded-2xl border border-black/[0.07] p-4">
                <span className="text-[11px] font-bold text-black/45 uppercase tracking-[0.14em]">{r.tipo}</span>
                <span className="mt-1 text-[14px] font-bold">{r.fecha}</span>
                <span className="mt-1 text-[12px] text-black/55">{r.detalle}</span>
                {restaurando === r.fecha ? (
                  <span className="mt-4 flex items-center gap-2 text-[12px]">
                    ¿Regresar tu página a este punto?
                    <button
                      onClick={() => {
                        setRestaurando(null);
                        hecho("Listo. Tu página regresó a ese respaldo.");
                      }}
                      className="font-bold underline"
                    >
                      Sí
                    </button>
                    <button onClick={() => setRestaurando(null)} className="text-black/50">
                      No
                    </button>
                  </span>
                ) : (
                  <button onClick={() => setRestaurando(r.fecha)} className="mt-4 self-start text-[12px] font-bold hover:underline">
                    Restaurar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta className="lg:col-span-2">
          <TituloTarjeta icono="grafica">Conexiones</TituloTarjeta>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Pixel de Meta", "activo"],
              ["Google Analytics 4", "activo"],
              ["Search Console", "activo"],
              ["Perfil de Google", "activo"],
              ["Google Ads", "activo"],
              ["Pixel de TikTok", "pendiente"],
              ["WhatsApp y CRM", "activo"],
              ["Agente 24/7", "preparacion"],
            ].map(([n, s]) => (
              <li key={n} className="flex items-center justify-between gap-3 rounded-2xl bg-humo px-4 py-3">
                <span className="text-[13px] font-semibold">{n}</span>
                <Estado estado={s as "activo" | "pendiente" | "preparacion"} />
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>

      {aviso && (
        <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md rounded-2xl bg-black px-5 py-4 text-[13px] text-white shadow-2xl lg:bottom-8">
          {aviso}
        </div>
      )}
    </div>
  );
}
