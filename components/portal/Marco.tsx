"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cliente } from "@/lib/portal";
import { reiniciarDemo, usePortal } from "@/lib/portal-estado";
import { salir, useSesion } from "@/lib/sesion";
import { IconoPortal, type IconoPortalNombre } from "./Iconos";

const NAV: { href: string; texto: string; icono: IconoPortalNombre; movil?: boolean }[] = [
  { href: "/portal/", texto: "Inicio", icono: "inicio", movil: true },
  { href: "/portal/briefing/", texto: "Briefing", icono: "briefing", movil: true },
  { href: "/portal/cambios/", texto: "Cambios con IA", icono: "chat", movil: true },
  { href: "/portal/tienda/", texto: "Tienda", icono: "tienda", movil: true },
  { href: "/portal/expediente/", texto: "Mi página", icono: "expediente" },
  { href: "/portal/dominio/", texto: "Dominios", icono: "dominio" },
  { href: "/portal/pagos/", texto: "Pagos", icono: "pagos" },
];

const limpia = (r: string) => (r.length > 1 ? r.replace(/\/$/, "") : r);

function BannerDemo() {
  const e = usePortal();
  const s = useSesion();
  if (s.estado !== "fuera") return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-amarillo px-4 py-2 text-[12px] font-semibold text-black lg:px-6">
      <p className="flex items-center gap-2">
        <IconoPortal nombre="chispa" className="size-4" />
        Demostración del portal · los datos son de ejemplo
        <Link href="/portal/entrar/" className="underline underline-offset-2">
          Entrar con mi correo
        </Link>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-black/60">Ver como:</span>
        <div className="flex rounded-full bg-black/10 p-0.5">
          {(
            [
              ["nuevo", "Cliente nuevo"],
              ["enlinea", "Página en línea"],
            ] as const
          ).map(([f, t]) => (
            <button
              key={f}
              onClick={() => reiniciarDemo(f)}
              className={`rounded-full px-3 py-1 transition-colors ${e.fase === f ? "bg-black text-white" : "hover:bg-black/10"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Marco({ children }: { children: React.ReactNode }) {
  const ruta = limpia(usePathname() || "/portal");
  const [menu, setMenu] = useState(false);
  const s = useSesion();
  const router = useRouter();
  const real = s.estado === "dentro";
  const negocio = real ? (s.org?.nombre ?? "Tu negocio") : cliente.negocio;
  const dominio = real ? (s.org?.dominio ?? "Dominio por definir") : cliente.dominio;
  const nombre = real ? s.nombre : cliente.nombreCompleto;
  const correo = real ? s.usuario.correo : cliente.correo;
  const iniciales = nombre
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const cerrar = async () => {
    if (real) await salir();
    router.push("/portal/entrar/");
  };
  const activo = (href: string) => {
    const h = limpia(href);
    return h === "/portal" ? ruta === h : ruta.startsWith(h);
  };

  return (
    <div className="min-h-dvh bg-humo text-black">
      <BannerDemo />
      <div className="lg:flex">
        {/* Barra lateral (escritorio) */}
        <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col bg-black px-4 py-6 text-white lg:flex">
          <Link href="/portal/" className="px-3">
            <img src="/marca/logo_color_fondo-oscuro.png" alt="Phot8can" className="h-8 w-auto" />
          </Link>
          <p className="etiqueta mt-2 px-3 text-[10px] text-white/40">Portal de cliente</p>

          <div className="mt-8 rounded-2xl bg-white/[0.06] p-3">
            <p className="text-[11px] text-white/45">Tu página</p>
            <p className="mt-0.5 truncate text-[14px] font-bold">{negocio}</p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-white/60">
              <span className="size-1.5 shrink-0 rounded-full bg-amarillo" />
              {dominio}
            </p>
          </div>

          <nav className="mt-6 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors ${
                  activo(n.href) ? "bg-amarillo text-black" : "text-white/75 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <IconoPortal nombre={n.icono} className="size-[18px]" />
                {n.texto}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            <a
              href="/portal/cambios/?equipo=1"
              className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-[13px] text-white/70 hover:border-amarillo hover:text-amarillo"
            >
              <IconoPortal nombre="equipo" className="size-[18px]" />
              Hablar con el equipo
            </a>
            <div className="flex items-center gap-3 px-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amarillo text-[13px] font-extrabold text-black">{iniciales}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">{nombre}</p>
                <p className="truncate text-[11px] text-white/45">{correo}</p>
              </div>
              <button onClick={cerrar} aria-label="Cerrar sesión" className="text-white/50 hover:text-white">
                <IconoPortal nombre="salir" className="size-[18px]" />
              </button>
            </div>
          </div>
        </aside>

        {/* Barra superior (móvil) */}
        <div className="sticky top-0 z-30 flex items-center justify-between bg-black px-4 py-3 text-white lg:hidden">
          <Link href="/portal/">
            <img src="/marca/logo_color_fondo-oscuro.png" alt="Phot8can" className="h-7 w-auto" />
          </Link>
          <button
            onClick={() => setMenu(true)}
            className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold"
          >
            <span className="grid size-6 place-items-center rounded-full bg-amarillo text-[10px] font-extrabold text-black">{iniciales}</span>
            Menú
          </button>
        </div>

        {menu && (
          <div className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={() => setMenu(false)}>
            <div
              className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-black p-5 pb-[max(20px,env(safe-area-inset-bottom))] text-white"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-bold">{negocio}</p>
                  <p className="text-[12px] text-white/50">{correo}</p>
                </div>
                <button onClick={() => setMenu(false)} aria-label="Cerrar menú" className="grid size-9 place-items-center rounded-full bg-white/10">
                  <IconoPortal nombre="cerrar" className="size-4" />
                </button>
              </div>
              <nav className="grid grid-cols-2 gap-2">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setMenu(false)}
                    className={`flex items-center gap-2.5 rounded-2xl px-3 py-3 text-[13px] font-semibold ${
                      activo(n.href) ? "bg-amarillo text-black" : "bg-white/[0.06]"
                    }`}
                  >
                    <IconoPortal nombre={n.icono} className="size-[18px]" />
                    {n.texto}
                  </Link>
                ))}
                <button onClick={cerrar} className="flex items-center gap-2.5 rounded-2xl bg-white/[0.06] px-3 py-3 text-left text-[13px] font-semibold">
                  <IconoPortal nombre="salir" className="size-[18px]" />
                  {real ? "Cerrar sesión" : "Entrar con mi correo"}
                </button>
              </nav>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-[3vw] lg:pt-10 lg:pb-16">{children}</main>
      </div>

      {/* Barra inferior (móvil) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV.filter((n) => n.movil).map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${activo(n.href) ? "text-black" : "text-black/45"}`}
          >
            <span className={`grid h-7 w-12 place-items-center rounded-full ${activo(n.href) ? "bg-amarillo" : ""}`}>
              <IconoPortal nombre={n.icono} className="size-[18px]" />
            </span>
            {n.texto.replace(" con IA", "")}
          </Link>
        ))}
      </nav>
    </div>
  );
}
