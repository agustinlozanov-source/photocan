"use client";

import { useCallback, useEffect, useState } from "react";
import { MarcoAdmin, type RolEquipo } from "@/components/admin/MarcoAdmin";
import { sesionActual } from "@/lib/sesion";
import { sb } from "@/lib/supabase";

export type Miembro = {
  correo: string;
  nombre: string | null;
  puesto: string | null;
  telefono: string | null;
  rol: RolEquipo;
  firma_institucional: boolean;
  creado: string;
};

export default function Equipo() {
  return <MarcoAdmin>{(rol) => <EquipoContenido rol={rol} />}</MarcoAdmin>;
}

const campo = "rounded-xl bg-white/10 px-3 py-2.5 text-[14px] outline-none placeholder:text-white/30 focus:ring-2 focus:ring-amarillo";
const campoClaro = "rounded-xl bg-humo px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-amarillo";

function EquipoContenido({ rol }: { rol: RolEquipo }) {
  const [lista, setLista] = useState<Miembro[]>([]);
  const [nuevo, setNuevo] = useState({ correo: "", nombre: "", puesto: "", rol: "equipo" as RolEquipo });
  const [mio, setMio] = useState({ nombre: "", puesto: "", telefono: "" });
  const [aviso, setAviso] = useState("");
  const [avisoMio, setAvisoMio] = useState("");
  const esAdmin = rol === "admin";
  const s = sesionActual();
  const yo = s.estado === "dentro" ? s.usuario.correo.toLowerCase() : "";

  const cargar = useCallback(async () => {
    const { data } = await sb().from("equipo").select("*").order("creado");
    const l = (data ?? []) as Miembro[];
    setLista(l);
    const m = l.find((x) => x.correo === yo);
    if (m) setMio({ nombre: m.nombre ?? "", puesto: m.puesto ?? "", telefono: m.telefono ?? "" });
  }, [yo]);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardarMio = async () => {
    const { error } = await sb().rpc("actualizar_mi_perfil_equipo", { p_nombre: mio.nombre, p_puesto: mio.puesto, p_telefono: mio.telefono });
    setAvisoMio(error ? `No se pudo guardar: ${error.message}` : "Guardado. Así aparecerás en las propuestas que firmes.");
    cargar();
  };

  const agregar = async () => {
    const c = nuevo.correo.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) return setAviso("Escribe un correo válido.");
    const { error } = await sb()
      .from("equipo")
      .insert({ correo: c, nombre: nuevo.nombre.trim() || null, puesto: nuevo.puesto.trim() || null, rol: nuevo.rol, invitado_por: s.estado === "dentro" ? s.usuario.id : null });
    if (error) return setAviso(error.code === "23505" ? "Ese correo ya está en el equipo." : `No se pudo agregar: ${error.message}`);
    setNuevo({ correo: "", nombre: "", puesto: "", rol: "equipo" });
    setAviso(`Listo. ${c} ya puede entrar en phot8can.studio/admin/ con su correo.`);
    cargar();
  };
  const actualizar = async (m: Miembro, cambios: Partial<Miembro>) => {
    const { error } = await sb().from("equipo").update(cambios).eq("correo", m.correo);
    if (error) setAviso(`No se pudo guardar: ${error.message}`);
    cargar();
  };
  const hacerFirma = async (m: Miembro) => {
    // Solo una firma institucional: se quita la anterior y se pone la nueva.
    const actual = lista.find((x) => x.firma_institucional);
    if (actual && actual.correo !== m.correo) await sb().from("equipo").update({ firma_institucional: false }).eq("correo", actual.correo);
    await actualizar(m, { firma_institucional: !m.firma_institucional });
  };
  const quitar = async (m: Miembro) => {
    await sb().from("equipo").delete().eq("correo", m.correo);
    cargar();
  };

  const firma = lista.find((x) => x.firma_institucional);

  return (
    <div className="mx-auto max-w-[980px] px-[max(16px,3vw)] py-10">
      <p className="etiqueta text-[11px] text-black/45">Equipo</p>
      <h1 className="titulo mt-2 text-[clamp(30px,3.4vw,44px)] leading-[1.02]">
        Quién prospecta y quién firma. <span className="text-black/35">Por correo.</span>
      </h1>
      <p className="mt-3 max-w-[64ch] text-[14px] text-black/60">
        Cada propuesta lleva dos firmas: la de quien prospecta y la firma institucional. Los nombres y puestos salen de aquí.
      </p>

      {/* Mi perfil */}
      <section className="mt-8 rounded-[22px] border border-black/[0.07] bg-white p-5">
        <p className="text-[15px] font-bold">Mi perfil para firmar</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input aria-label="Mi nombre" placeholder="Nombre completo" value={mio.nombre} onChange={(e) => setMio({ ...mio, nombre: e.target.value })} className={campoClaro} />
          <input aria-label="Mi puesto" placeholder="Puesto" value={mio.puesto} onChange={(e) => setMio({ ...mio, puesto: e.target.value })} className={campoClaro} />
          <input aria-label="Mi teléfono" placeholder="Teléfono / WhatsApp" value={mio.telefono} onChange={(e) => setMio({ ...mio, telefono: e.target.value })} className={campoClaro} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={guardarMio} className="rounded-full bg-black px-5 py-2.5 text-[13px] font-bold text-white hover:bg-amarillo hover:text-black">
            Guardar mi perfil
          </button>
          {avisoMio && <p className="text-[13px] text-black/60">{avisoMio}</p>}
        </div>
      </section>

      {esAdmin && (
        <section className="mt-5 rounded-[22px] bg-black p-5 text-white">
          <p className="text-[15px] font-bold">Agregar al equipo</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1.3fr_1fr_1fr_auto_auto]">
            <input aria-label="Correo" placeholder="correo@ejemplo.com" value={nuevo.correo} onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })} className={campo} />
            <input aria-label="Nombre" placeholder="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} className={campo} />
            <input aria-label="Puesto" placeholder="Puesto" value={nuevo.puesto} onChange={(e) => setNuevo({ ...nuevo, puesto: e.target.value })} className={campo} />
            <select aria-label="Rol" value={nuevo.rol} onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value as RolEquipo })} className={campo}>
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
          <p className="mt-3 text-[12px] text-white/40">Administrador: todo, incluido el equipo y los objetivos. Equipo: Radar y clientes.</p>
        </section>
      )}

      <div className="mt-5 rounded-[18px] bg-amarillo/15 px-5 py-4 text-[13px]">
        <b>Firma institucional:</b>{" "}
        {firma ? (
          <>
            {firma.nombre || firma.correo}
            {firma.puesto ? `, ${firma.puesto}` : ""}. Aparece en todas las propuestas junto a quien prospecta.
          </>
        ) : (
          <>nadie todavía. {esAdmin ? "Elige a quién con el botón “Firma institucional”." : "Un administrador la elige."}</>
        )}
      </div>

      <ul className="mt-4 grid gap-2">
        {lista.map((m) => (
          <li key={m.correo} className="grid gap-3 rounded-[18px] bg-white p-4 ring-1 ring-black/[0.07] md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="grid size-11 place-items-center rounded-full bg-black text-[16px] font-bold text-amarillo">{(m.nombre || m.correo).charAt(0).toUpperCase()}</span>
            {esAdmin ? (
              <div className="grid min-w-0 gap-2 sm:grid-cols-3">
                <input
                  aria-label={`Nombre de ${m.correo}`}
                  defaultValue={m.nombre ?? ""}
                  placeholder="Nombre"
                  onBlur={(e) => e.target.value !== (m.nombre ?? "") && actualizar(m, { nombre: e.target.value.trim() || null })}
                  className={campoClaro}
                />
                <input
                  aria-label={`Puesto de ${m.correo}`}
                  defaultValue={m.puesto ?? ""}
                  placeholder="Puesto"
                  onBlur={(e) => e.target.value !== (m.puesto ?? "") && actualizar(m, { puesto: e.target.value.trim() || null })}
                  className={campoClaro}
                />
                <span className="self-center truncate text-[13px] text-black/55">
                  {m.correo}
                  {m.correo === yo && <b className="ml-1 text-black/40">(tú)</b>}
                </span>
              </div>
            ) : (
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-bold">{m.nombre || m.correo}</span>
                <span className="block truncate text-[13px] text-black/55">
                  {m.puesto || "Sin puesto"} · {m.correo}
                </span>
              </span>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {m.firma_institucional && <span className="rounded-full bg-amarillo px-3 py-1.5 text-[12px] font-bold text-black">Firma institucional</span>}
              {esAdmin ? (
                <>
                  <button onClick={() => hacerFirma(m)} className="rounded-full px-3 py-2 text-[12px] font-bold text-black/60 ring-1 ring-black/10 hover:text-black">
                    {m.firma_institucional ? "Quitar firma" : "Firma institucional"}
                  </button>
                  {m.correo !== yo && (
                    <>
                      <select
                        aria-label={`Rol de ${m.correo}`}
                        value={m.rol}
                        onChange={(e) => actualizar(m, { rol: e.target.value as RolEquipo })}
                        className="rounded-full bg-humo px-3 py-2 text-[12px] font-semibold outline-none"
                      >
                        <option value="equipo">Equipo</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <button onClick={() => quitar(m)} className="rounded-full px-3 py-2 text-[12px] font-bold text-black/45 ring-1 ring-black/10 hover:text-[#a3231b]">
                        Quitar
                      </button>
                    </>
                  )}
                </>
              ) : (
                <span className="rounded-full bg-humo px-3 py-1.5 text-[12px] font-bold text-black/60">{m.rol === "admin" ? "Administrador" : "Equipo"}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
