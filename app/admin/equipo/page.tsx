"use client";

import { useCallback, useEffect, useState } from "react";
import { MarcoAdmin, type RolEquipo } from "@/components/admin/MarcoAdmin";
import { sesionActual } from "@/lib/sesion";
import { sb } from "@/lib/supabase";

type Miembro = { correo: string; nombre: string | null; rol: RolEquipo; creado: string };

export default function Equipo() {
  return <MarcoAdmin>{(rol) => <EquipoContenido rol={rol} />}</MarcoAdmin>;
}

function EquipoContenido({ rol }: { rol: RolEquipo }) {
  const [lista, setLista] = useState<Miembro[]>([]);
  const [correo, setCorreo] = useState("");
  const [nombre, setNombre] = useState("");
  const [nuevoRol, setNuevoRol] = useState<RolEquipo>("equipo");
  const [aviso, setAviso] = useState("");
  const esAdmin = rol === "admin";
  const s = sesionActual();
  const yo = s.estado === "dentro" ? s.usuario.correo.toLowerCase() : "";

  const cargar = useCallback(async () => {
    const { data } = await sb().from("equipo").select("*").order("creado");
    setLista((data ?? []) as Miembro[]);
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const agregar = async () => {
    const c = correo.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) return setAviso("Escribe un correo válido.");
    const { error } = await sb()
      .from("equipo")
      .insert({ correo: c, nombre: nombre.trim() || null, rol: nuevoRol, invitado_por: s.estado === "dentro" ? s.usuario.id : null });
    if (error) return setAviso(error.code === "23505" ? "Ese correo ya está en el equipo." : `No se pudo agregar: ${error.message}`);
    setCorreo("");
    setNombre("");
    setAviso(`Listo. ${c} ya puede entrar en phot8can.studio/admin/ con su correo.`);
    cargar();
  };
  const cambiarRol = async (m: Miembro, r: RolEquipo) => {
    await sb().from("equipo").update({ rol: r }).eq("correo", m.correo);
    cargar();
  };
  const quitar = async (m: Miembro) => {
    await sb().from("equipo").delete().eq("correo", m.correo);
    cargar();
  };

  return (
    <div className="mx-auto max-w-[900px] px-[max(16px,3vw)] py-10">
      <p className="etiqueta text-[11px] text-black/45">Equipo</p>
      <h1 className="titulo mt-2 text-[clamp(30px,3.4vw,44px)] leading-[1.02]">
        Quién entra al superadmin. <span className="text-black/35">Por correo.</span>
      </h1>
      <p className="mt-3 max-w-[60ch] text-[14px] text-black/60">
        Agrega el correo de la persona y su rol. Entra en phot8can.studio/admin/ con ese correo: le llega un enlace y un código, sin contraseñas.
      </p>

      {esAdmin && (
        <section className="mt-8 rounded-[22px] bg-black p-5 text-white">
          <p className="text-[15px] font-bold">Agregar al equipo</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1.3fr_1fr_auto_auto]">
            <input
              aria-label="Correo"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="rounded-xl bg-white/10 px-3 py-2.5 text-[14px] outline-none placeholder:text-white/30 focus:ring-2 focus:ring-amarillo"
            />
            <input
              aria-label="Nombre"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="rounded-xl bg-white/10 px-3 py-2.5 text-[14px] outline-none placeholder:text-white/30 focus:ring-2 focus:ring-amarillo"
            />
            <select
              aria-label="Rol"
              value={nuevoRol}
              onChange={(e) => setNuevoRol(e.target.value as RolEquipo)}
              className="rounded-xl bg-white/10 px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-amarillo"
            >
              <option value="equipo" className="text-black">
                Equipo
              </option>
              <option value="admin" className="text-black">
                Administrador
              </option>
            </select>
            <button onClick={agregar} className="rounded-full bg-amarillo px-5 py-2.5 text-[14px] font-bold text-black hover:bg-white">
              Agregar
            </button>
          </div>
          {aviso && <p className="mt-3 text-[13px] text-white/70">{aviso}</p>}
          <p className="mt-3 text-[12px] text-white/40">Administrador: todo, incluido el equipo. Equipo: Radar y clientes, sin administrar el equipo.</p>
        </section>
      )}

      <ul className="mt-6 grid gap-2">
        {lista.map((m) => (
          <li key={m.correo} className="flex flex-wrap items-center gap-4 rounded-[18px] bg-white p-4 ring-1 ring-black/[0.07]">
            <span className="grid size-10 place-items-center rounded-full bg-black text-[15px] font-bold text-amarillo">{(m.nombre || m.correo).charAt(0).toUpperCase()}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-bold">
                {m.nombre || m.correo}
                {m.correo === yo && <span className="ml-2 text-[12px] font-semibold text-black/40">(tú)</span>}
              </span>
              <span className="block truncate text-[13px] text-black/55">{m.correo}</span>
            </span>
            {esAdmin && m.correo !== yo ? (
              <>
                <select
                  aria-label={`Rol de ${m.correo}`}
                  value={m.rol}
                  onChange={(e) => cambiarRol(m, e.target.value as RolEquipo)}
                  className="rounded-full bg-humo px-3 py-2 text-[13px] font-semibold outline-none"
                >
                  <option value="equipo">Equipo</option>
                  <option value="admin">Administrador</option>
                </select>
                <button onClick={() => quitar(m)} className="rounded-full px-3 py-2 text-[12px] font-bold text-black/45 ring-1 ring-black/10 hover:text-[#a3231b]">
                  Quitar
                </button>
              </>
            ) : (
              <span className="rounded-full bg-humo px-3 py-1.5 text-[12px] font-bold text-black/60">{m.rol === "admin" ? "Administrador" : "Equipo"}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
