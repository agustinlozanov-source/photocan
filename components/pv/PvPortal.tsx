"use client";

import { useEffect, useState } from "react";
import { Aparece } from "../ui";
import { BarraAmarilla } from "./Marca";

type Vista = "inicio" | "cambios" | "tienda";

const VISTAS: { id: Vista; texto: string }[] = [
  { id: "inicio", texto: "Tu página" },
  { id: "cambios", texto: "Cambios con IA" },
  { id: "tienda", texto: "Complementos" },
];

const BENEFICIOS = [
  { titulo: "Entras sin contraseñas", texto: "Un enlace a tu correo y listo. Nunca más pierdes el acceso." },
  { titulo: "Armas tu página con tu brief", texto: "Unos 20 minutos, escribiendo o hablando. Subes tu logo y tus fotos ahí mismo." },
  { titulo: "La ves antes de publicarla", texto: "Revisas la vista previa, pides ajustes y apruebas. Nada sale sin tu visto bueno." },
  { titulo: "La cambias tú mismo", texto: "Escribe o dicta lo que quieres cambiar. La IA lo hace y te lo enseña antes de publicar." },
  { titulo: "Creces a tu ritmo", texto: "Dominio a tu nombre y complementos cuando los necesites, sabiendo cuánto cuesta cada uno." },
  { titulo: "Tus datos son tuyos", texto: "Contactos, pedidos y respaldos guardados para tu negocio, y descargables cuando quieras." },
];

/** El portal de cliente: control total de la página, con un mockup que se recorre solo. */
export function PvPortal() {
  const [vista, setVista] = useState<Vista>("inicio");
  const [tocado, setTocado] = useState(false);

  useEffect(() => {
    if (tocado) return;
    const t = setInterval(() => setVista((v) => VISTAS[(VISTAS.findIndex((x) => x.id === v) + 1) % VISTAS.length].id), 5000);
    return () => clearInterval(t);
  }, [tocado]);

  return (
    <section id="portal" className="relative overflow-hidden bg-black py-[7%] text-white max-md:py-20">
      <div className="hero-brillo pointer-events-none absolute -right-[20%] -bottom-[30%] size-[70vw] max-w-[1000px] rounded-full opacity-25 blur-3xl" />
      <div className="contenedor relative grid items-center gap-12 xl:grid-cols-[0.9fr_1.1fr] xl:gap-[4vw]">
        <Aparece>
          <p className="etiqueta text-amarillo">Tu portal de cliente</p>
          <h2 className="titulo mt-4 max-w-[15ch] text-[clamp(36px,4.6vw,72px)] leading-[1.02]">
            Tu página, en tu mano. <span className="text-amarillo">Siempre.</span>
          </h2>
          <BarraAmarilla className="mt-6" />
          <p className="mt-6 max-w-[46ch] text-[clamp(15px,1.15vw,18px)] leading-relaxed text-white/70">
            Al contratar recibes tu propio portal. Ahí nace tu página, ahí la revisas y desde ahí la cambias cuando quieras, sin
            depender de nadie.
          </p>
          <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {BENEFICIOS.map((b, i) => (
              <li key={b.titulo} className="flex gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-amarillo text-[12px] font-extrabold text-black">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-[15px] font-bold">{b.titulo}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-white/60">{b.texto}</span>
                </span>
              </li>
            ))}
          </ul>
          <a
            href="/portal/"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-amarillo px-6 py-3.5 text-[14px] font-bold text-black transition-colors hover:bg-white"
          >
            Conoce el portal
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </Aparece>

        <Aparece retraso={120}>
          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Partes del portal">
            {VISTAS.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={vista === v.id}
                onClick={() => {
                  setTocado(true);
                  setVista(v.id);
                }}
                className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                  vista === v.id ? "bg-amarillo text-black" : "bg-white/10 text-white/70 hover:text-white"
                }`}
              >
                {v.texto}
              </button>
            ))}
          </div>
          <Mockup vista={vista} />
        </Aparece>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Mockup */

function Mockup({ vista }: { vista: Vista }) {
  const nav = ["Inicio", "Briefing", "Cambios con IA", "Tienda", "Mi página", "Dominios", "Pagos"];
  const activo = vista === "inicio" ? "Inicio" : vista === "cambios" ? "Cambios con IA" : "Tienda";
  return (
    <div className="overflow-hidden rounded-[20px] bg-[#f4f4f2] text-black shadow-[0_40px_120px_-40px_rgba(243,175,14,0.45)] ring-1 ring-white/15">
      <div className="flex items-center gap-2 bg-[#e9e8e3] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-black/20" />
        <span className="size-2.5 rounded-full bg-black/20" />
        <span className="size-2.5 rounded-full bg-amarillo" />
        <span className="ml-3 rounded-full bg-white px-3 py-0.5 text-[11px] text-black/50">phot8can.com/portal</span>
      </div>
      <div className="grid min-h-[430px] grid-cols-[150px_minmax(0,1fr)] max-sm:grid-cols-1">
        <aside className="bg-black p-3 text-white max-sm:hidden">
          <p className="px-2 text-[15px] font-extrabold tracking-tight">
            Phot<span className="text-amarillo">8</span>can
          </p>
          <div className="mt-4 rounded-xl bg-white/[0.07] p-2">
            <p className="text-[9px] text-white/40">Tu página</p>
            <p className="truncate text-[11px] font-bold">Taller Ruiz</p>
          </div>
          <ul className="mt-3 space-y-1">
            {nav.map((n) => (
              <li key={n} className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold ${n === activo ? "bg-amarillo text-black" : "text-white/60"}`}>
                {n}
              </li>
            ))}
          </ul>
        </aside>
        <div key={vista} className="aparece visible p-4 sm:p-5">
          {vista === "inicio" && <MockInicio />}
          {vista === "cambios" && <MockCambios />}
          {vista === "tienda" && <MockTienda />}
        </div>
      </div>
    </div>
  );
}

function MockInicio() {
  return (
    <>
      <p className="text-[11px] text-black/45">Taller Ruiz</p>
      <p className="titulo text-[22px] leading-tight">
        Hola, Luis. <span className="text-black/35">Tu página está lista.</span>
      </p>
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-black p-4 text-white">
        <div className="hero-brillo absolute -top-1/2 -right-1/3 size-56 rounded-full opacity-50 blur-2xl" />
        <div className="relative">
          <p className="etiqueta text-[9px] text-amarillo">Tu página</p>
          <p className="mt-1 text-[16px] font-bold">Lista para revisar</p>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {["Brief", "Diseño", "Revisión", "En línea"].map((p, i) => (
              <div key={p}>
                <div className={`h-1 rounded-full ${i < 3 ? "bg-amarillo" : "bg-white/15"}`} />
                <p className={`mt-1 text-[9px] font-semibold ${i < 3 ? "" : "text-white/40"}`}>{p}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-black">Ver vista previa</span>
            <span className="rounded-full bg-amarillo px-3 py-1.5 text-[11px] font-bold text-black">Aprobar y publicar</span>
          </div>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-3 ring-1 ring-black/[0.06]">
          <p className="text-[11px] font-bold">Lo que tienes</p>
          {[
            ["tallerruiz.mx", "A tu nombre"],
            ["Página Viva", "Activo"],
          ].map(([n, e]) => (
            <p key={n} className="mt-2 flex items-center justify-between text-[10px]">
              <span className="font-semibold">{n}</span>
              <span className="rounded-full bg-black px-2 py-0.5 font-bold text-white">{e}</span>
            </p>
          ))}
        </div>
        <div className="rounded-2xl bg-white p-3 ring-1 ring-black/[0.06]">
          <p className="text-[11px] font-bold">Este mes</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              ["412", "Visitas"],
              ["38", "Clics a WhatsApp"],
            ].map(([v, t]) => (
              <div key={t}>
                <p className="titulo text-[18px] leading-none">{v}</p>
                <p className="text-[9px] text-black/50">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function MockCambios() {
  return (
    <div className="flex h-full flex-col">
      <p className="text-[13px] font-bold">Cambios con IA</p>
      <div className="mt-3 flex-1 space-y-3">
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-semibold ring-1 ring-black/10">fachada-nueva.jpg</span>
          <p className="max-w-[80%] rounded-2xl rounded-br-md bg-[#e4e3de] px-3 py-2 text-[11px]">
            Cambia la foto del inicio por esta y sube el precio de la afinación a $1,200.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-black text-[9px] text-amarillo">✦</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px]">Listo. Revísalo antes de publicar.</p>
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-white p-2 ring-1 ring-black/10">
              {[false, true].map((d) => (
                <div key={String(d)}>
                  <p className="text-[8px] font-bold tracking-wider text-black/45 uppercase">{d ? "Después" : "Antes"}</p>
                  <div className={`mt-1 h-10 rounded ${d ? "bg-amarillo/70" : "bg-black/10"}`} />
                  <div className="mt-1 h-1.5 w-3/4 rounded bg-black/15" />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <span className="rounded-full bg-amarillo px-3 py-1 text-[10px] font-bold">Aprobar y publicar</span>
              <span className="rounded-full px-3 py-1 text-[10px] font-bold ring-1 ring-black/15">Pedir ajuste</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-2xl border border-black/10 bg-white p-2">
        <p className="px-1 text-[11px] text-black/35">Escribe o dicta lo que quieres cambiar…</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="grid size-6 place-items-center rounded-full border border-black/15 text-[13px]">+</span>
          <span className="flex gap-1.5">
            <span className="grid size-6 place-items-center rounded-full text-black/50">
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0" />
              </svg>
            </span>
            <span className="grid size-6 place-items-center rounded-full bg-black text-[11px] text-white">↑</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function MockTienda() {
  const items = [
    ["Citas en línea", "Agenda con recordatorios por WhatsApp", "Se activa al pagar"],
    ["Plan de cambios", "Cambios cada mes, por texto o voz", "Mensual"],
    ["Tienda en línea", "Vende y cobra las 24 horas", "Lo prepara el equipo"],
    ["Sesión de fotos", "Fotos reales de tu negocio", "Lo prepara el equipo"],
  ];
  return (
    <>
      <p className="text-[13px] font-bold">Complementos</p>
      <p className="text-[11px] text-black/50">Agrega lo que necesites, cuando lo necesites.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map(([n, d, e], i) => (
          <div key={n} className={`rounded-2xl bg-white p-3 ring-1 ${i === 0 ? "ring-black" : "ring-black/[0.07]"}`}>
            <p className="text-[12px] font-bold">{n}</p>
            <p className="mt-0.5 text-[10px] text-black/55">{d}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[9px] text-black/45">{e}</span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${i === 0 ? "bg-amarillo" : "bg-black text-white"}`}>
                {i === 0 ? "✓ En tu carrito" : "Agregar"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-black px-3 py-2.5 text-white">
        <span className="text-[11px]">
          <b className="text-amarillo">tallerruiz.mx</b> · a tu nombre, al costo
        </span>
        <span className="rounded-full bg-amarillo px-2.5 py-1 text-[10px] font-bold text-black">Pagar</span>
      </div>
    </>
  );
}
