"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { entrarConCodigo, pedirEnlace, salir, useSesion } from "@/lib/sesion";
import { sb } from "@/lib/supabase";

export type RolEquipo = "admin" | "equipo";

const NAV: { href: string; texto: string; soloAdmin?: boolean }[] = [
  { href: "/admin/", texto: "Inicio" },
  { href: "/admin/equipo/", texto: "Equipo" },
];

/**
 * Marco del superadministrador: pide entrar (correo + código), revisa que la cuenta sea del
 * equipo y pinta la barra. Las páginas reciben el rol.
 */
export function MarcoAdmin({ children }: { children: (rol: RolEquipo) => React.ReactNode }) {
  const sesion = useSesion();
  const ruta = usePathname();
  const [rol, setRol] = useState<RolEquipo | null | undefined>(undefined);

  useEffect(() => {
    if (sesion.estado !== "dentro") return;
    let vivo = true;
    sb()
      .rpc("mi_rol_equipo")
      .then(({ data }) => vivo && setRol((data as RolEquipo | null) ?? null));
    return () => {
      vivo = false;
    };
  }, [sesion]);

  if (sesion.estado === "cargando" || (sesion.estado === "dentro" && rol === undefined)) return <Pantalla>Cargando…</Pantalla>;
  if (sesion.estado === "fuera") return <Entrar />;
  if (!rol)
    return (
      <Pantalla>
        <p className="text-white/70">Esta cuenta no es del equipo de Phot8can.</p>
        <p className="mt-2 text-[13px] text-white/45">Entraste como {sesion.usuario.correo}</p>
        <button onClick={() => salir()} className="mt-6 rounded-full bg-amarillo px-6 py-3 text-[14px] font-bold text-black hover:bg-white">
          Entrar con otro correo
        </button>
      </Pantalla>
    );

  const activo = (href: string) => (href === "/admin/" ? ruta === "/admin" || ruta === "/admin/" : ruta?.startsWith(href.replace(/\/$/, "")));
  return (
    <main className="min-h-dvh bg-humo text-black">
      <header className="bg-black text-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-[max(16px,3vw)] py-4">
          <div className="flex items-center gap-4">
            <img src="/marca/logo_color_fondo-oscuro.png" alt="Phot8can" className="h-7 w-auto" />
            <span className="h-6 w-px bg-white/20" />
            <p className="text-[12px] font-bold tracking-[0.2em] text-amarillo uppercase">Superadmin</p>
          </div>
          <nav className="flex flex-wrap gap-1 text-[13px] font-semibold">
            {NAV.filter((n) => !n.soloAdmin || rol === "admin").map((n) => (
              <a key={n.href} href={n.href} className={`rounded-full px-4 py-2 ${activo(n.href) ? "bg-white text-black" : "text-white/70 hover:text-white"}`}>
                {n.texto}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-[12px] text-white/55">
            <span>
              {sesion.usuario.correo} · {rol === "admin" ? "Administrador" : "Equipo"}
            </span>
            <button onClick={() => salir()} className="rounded-full px-3 py-1.5 ring-1 ring-white/20 hover:text-white">
              Salir
            </button>
          </div>
        </div>
      </header>
      {children(rol)}
    </main>
  );
}

function Entrar() {
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [trabajando, setTrabajando] = useState(false);
  const [aviso, setAviso] = useState("");

  const pedir = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim())) return setAviso("Escribe un correo válido.");
    setTrabajando(true);
    setAviso("");
    const e = await pedirEnlace(correo.trim().toLowerCase(), window.location.pathname);
    setTrabajando(false);
    if (e) return setAviso(e);
    setEnviado(true);
  };
  const entrar = async () => {
    setTrabajando(true);
    setAviso("");
    const e = await entrarConCodigo(correo.trim().toLowerCase(), codigo);
    setTrabajando(false);
    if (e) setAviso(e);
  };

  return (
    <Pantalla>
      <h1 className="titulo text-[clamp(28px,4vw,40px)] leading-none">Superadministrador</h1>
      <p className="mx-auto mt-3 max-w-[38ch] text-[14px] text-white/60">Entra con tu correo del equipo. Te mandamos un enlace y un código.</p>
      <div className="mx-auto mt-8 grid w-full max-w-[360px] gap-3 text-left">
        <label htmlFor="correo-admin" className="text-[12px] font-semibold text-white/60">
          Correo
        </label>
        <input
          id="correo-admin"
          type="email"
          autoComplete="email"
          value={correo}
          disabled={enviado}
          onChange={(e) => setCorreo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !enviado && pedir()}
          className="rounded-xl bg-white/10 px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-amarillo disabled:opacity-60"
        />
        {enviado && (
          <>
            <label htmlFor="codigo-admin" className="mt-2 text-[12px] font-semibold text-white/60">
              Código del correo
            </label>
            <input
              id="codigo-admin"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
              onKeyDown={(e) => e.key === "Enter" && codigo.length >= 6 && entrar()}
              className="rounded-xl bg-white/10 px-4 py-3 text-[18px] tracking-[0.3em] outline-none focus:ring-2 focus:ring-amarillo"
            />
          </>
        )}
        <button
          onClick={enviado ? entrar : pedir}
          disabled={trabajando || (enviado && codigo.length < 6)}
          className="mt-2 rounded-full bg-amarillo py-3.5 text-[14px] font-bold text-black hover:bg-white disabled:opacity-50"
        >
          {trabajando ? "Un momento…" : enviado ? "Entrar" : "Mandar enlace y código"}
        </button>
        {enviado && <p className="text-[12px] text-white/50">Revisa tu correo (y spam). También puedes abrir el enlace directo.</p>}
        {aviso && <p className="text-[12px] text-[#ff9b8f]">{aviso}</p>}
      </div>
    </Pantalla>
  );
}

function Pantalla({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-black px-6 py-16 text-center text-white">
      <div className="w-full">
        <img src="/marca/logo_color_fondo-oscuro.png" alt="Phot8can" className="mx-auto mb-8 h-8 w-auto" />
        {children}
      </div>
    </main>
  );
}
