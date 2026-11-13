"use client";

import Link from "next/link";
import { IconoPortal } from "@/components/portal/Iconos";
import { BotonPortal, Estado, Medidor, Tarjeta, TituloTarjeta, precio } from "@/components/portal/Piezas";
import { avanceBriefing } from "@/lib/briefing";
import { cliente, etapasProyecto, planesCambios, reporteMes } from "@/lib/portal";
import { usePortal } from "@/lib/portal-estado";

export default function Inicio() {
  const e = usePortal();
  const avance = avanceBriefing(e.briefing.respuestas, e.briefing.archivos);
  const plan = planesCambios.find((p) => p.id === e.plan);
  const mensual = e.contratados.filter((c) => c.cobro === "mensual" && c.precio !== null).reduce((s, c) => s + (c.precio ?? 0), 0);
  const enPreparacion = e.contratados.filter((c) => c.estado === "preparacion");
  const etapa = e.fase === "nuevo" ? (e.briefing.enviado ? 1 : 0) : 3;

  return (
    <div className="mx-auto max-w-[1200px]">
      <p className="text-[14px] text-black/55">{cliente.negocio}</p>
      <h1 className="titulo mt-1 text-[clamp(30px,3.6vw,50px)] leading-[1.02]">
        Hola, {cliente.nombre}. <span className="text-black/35">{e.fase === "nuevo" ? "Empecemos tu página." : "Tu página está trabajando."}</span>
      </h1>

      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Tarjeta principal */}
        {e.fase === "nuevo" ? (
          <Tarjeta oscura className="relative overflow-hidden">
            <div className="hero-brillo pointer-events-none absolute -top-1/2 -right-1/3 size-[520px] rounded-full opacity-50 blur-2xl" />
            <div className="relative">
              <p className="etiqueta text-[11px] text-amarillo">Paso 1 de 4</p>
              <h2 className="titulo mt-3 max-w-[18ch] text-[clamp(26px,2.6vw,38px)] leading-[1.05]">Cuéntanos todo de tu negocio.</h2>
              <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-white/70">
                Tu briefing es lo más importante. Con él hacemos tus textos, tus páginas y tus campañas. Se guarda solo y puedes
                pedir que te ayudemos a llenarlo por teléfono.
              </p>
              <div className="mt-6 max-w-[420px]">
                <Medidor usado={avance} total={100} etiqueta="Briefing completado" oscuro porcentaje />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <BotonPortal href="/portal/briefing/" tono="amarillo">
                  {avance > 0 ? "Seguir con mi briefing" : "Llenar mi briefing"}
                  <IconoPortal nombre="flecha" className="size-4" />
                </BotonPortal>
                <BotonPortal href="/portal/briefing/?asistido=1" tono="claro">
                  <IconoPortal nombre="telefono" className="size-4" />
                  Que me ayuden
                </BotonPortal>
              </div>
            </div>
          </Tarjeta>
        ) : (
          <Tarjeta oscura className="relative overflow-hidden">
            <div className="hero-brillo pointer-events-none absolute -top-1/2 -right-1/3 size-[520px] rounded-full opacity-40 blur-2xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-bold">
                  <span className="size-2 animate-pulse rounded-full bg-amarillo" />
                  En línea · {cliente.dominio}
                </span>
                <span className="text-[12px] text-white/45">Reporte de noviembre · ejemplo</span>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
                {reporteMes.map((r) => (
                  <div key={r.dato}>
                    <p className="titulo text-[clamp(28px,3vw,42px)] leading-none tabular-nums">{r.valor}</p>
                    <p className="mt-2 text-[12px] text-white/55">{r.dato}</p>
                    <p className="mt-1 text-[12px] font-bold text-amarillo">{r.cambio}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <BotonPortal href="/portal/cambios/" tono="amarillo">
                  <IconoPortal nombre="chat" className="size-4" />
                  Pedir un cambio
                </BotonPortal>
                <BotonPortal href="/portal/expediente/" tono="claro">
                  <IconoPortal nombre="expediente" className="size-4" />
                  Mi página
                </BotonPortal>
              </div>
            </div>
          </Tarjeta>
        )}

        {/* Etapas */}
        <Tarjeta>
          <TituloTarjeta icono="reloj">Tu proyecto</TituloTarjeta>
          <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[13px] before:w-px before:bg-black/10">
            {etapasProyecto.map((p, i) => (
              <li key={p.nombre} className="relative flex gap-4">
                <span
                  className={`relative z-10 grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-extrabold ${
                    i < etapa ? "bg-black text-amarillo" : i === etapa ? "bg-amarillo text-black ring-4 ring-amarillo/25" : "border-[1.5px] border-black/15 bg-white text-black/35"
                  }`}
                >
                  {i < etapa ? <IconoPortal nombre="check" className="size-3.5" /> : i + 1}
                </span>
                <div>
                  <p className={`text-[14px] font-bold ${i > etapa ? "text-black/40" : ""}`}>{p.nombre}</p>
                  <p className="text-[13px] text-black/55">{p.detalle}</p>
                </div>
              </li>
            ))}
          </ol>
        </Tarjeta>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {/* Plan de cambios */}
        <Tarjeta>
          <TituloTarjeta
            icono="chat"
            accion={
              <Link href="/portal/tienda/?vista=planes" className="text-[12px] font-bold underline-offset-2 hover:underline">
                {plan ? "Cambiar plan" : "Ver planes"}
              </Link>
            }
          >
            {plan ? `Plan ${plan.nombre}` : "Cambios con IA"}
          </TituloTarjeta>
          {plan ? (
            <div className="space-y-4">
              <Medidor usado={e.uso.simple} total={plan.incluye.simple} etiqueta="Cambios simples" />
              <Medidor usado={e.uso.mediano} total={plan.incluye.mediano} etiqueta="Cambios medianos" />
              <Medidor usado={e.uso.complejo} total={plan.incluye.complejo} etiqueta="Cambios complejos" />
              <p className="text-[12px] text-black/50">Se renuevan el 1 de diciembre. Los que no uses no se acumulan.</p>
            </div>
          ) : (
            <p className="text-[14px] leading-relaxed text-black/60">
              Cuando tu página esté en línea, pide cambios escribiendo, hablando o con una foto. Desde {precio(planesCambios[0].precio)} al mes.
            </p>
          )}
        </Tarjeta>

        {/* Lo contratado */}
        <Tarjeta>
          <TituloTarjeta
            icono="tienda"
            accion={
              <Link href="/portal/tienda/" className="text-[12px] font-bold underline-offset-2 hover:underline">
                Agregar
              </Link>
            }
          >
            Lo que tienes
          </TituloTarjeta>
          <ul className="divide-y divide-black/[0.07]">
            {e.contratados.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold">{c.nombre}</span>
                  <span className="block text-[12px] text-black/50">
                    {c.precio === null ? "Precio por definir" : precio(c.precio, c.cobro === "mensual" ? " / mes" : c.cobro === "anual" ? " / año" : "")}
                  </span>
                </span>
                <Estado estado={c.estado} />
              </li>
            ))}
          </ul>
        </Tarjeta>

        {/* Cobros y avisos */}
        <div className="grid gap-5">
          <Tarjeta>
            <TituloTarjeta icono="pagos">Próximo cobro</TituloTarjeta>
            <p className="titulo text-[34px] leading-none tabular-nums">{precio(mensual)}</p>
            <p className="mt-2 text-[13px] text-black/55">
              1 de diciembre · {cliente.tarjeta.marca} •••• {cliente.tarjeta.ultimos}
            </p>
            <Link href="/portal/pagos/" className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold underline-offset-2 hover:underline">
              Ver pagos y facturas <IconoPortal nombre="flecha" className="size-3.5" />
            </Link>
          </Tarjeta>
          <Tarjeta className="bg-amarillo/15 !border-amarillo/40">
            <TituloTarjeta icono="campana">Avisos</TituloTarjeta>
            <ul className="space-y-3 text-[13px]">
              {enPreparacion.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-black" />
                  <span>
                    <b>{c.nombre}</b> está en preparación. El equipo te escribe en menos de 24 horas.
                  </span>
                </li>
              ))}
              <li className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-black" />
                <span>
                  Tu dominio <b>{cliente.dominio}</b> se renueva el 15 de septiembre de 2027. Te avisamos 30 días antes.
                </span>
              </li>
            </ul>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}
