"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MarcoAdmin, type RolEquipo } from "@/components/admin/MarcoAdmin";
import { sb } from "@/lib/supabase";

type Persona = { correo: string; nombre: string | null; puesto: string | null };
type Meta = "propuestas" | "abiertas" | "respuestas" | "ventas";
type Objetivo = { correo: string; semana: string } & Record<Meta, number>;

const METAS: { k: Meta; t: string; estado: string }[] = [
  { k: "propuestas", t: "Propuestas enviadas", estado: "propuesta_enviada" },
  { k: "abiertas", t: "Abiertas", estado: "abrio" },
  { k: "respuestas", t: "Respuestas", estado: "respondio" },
  { k: "ventas", t: "Ventas", estado: "convertido" },
];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function lunesDe(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}
const sumarDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const fecha = (d: Date) => d.toLocaleDateString("es-MX", { day: "numeric", month: "short" }).replace(".", "");

/** Lunes de cada semana que empieza dentro del mes (así cada semana cuenta en un solo mes). */
function semanasDelMes(d: Date) {
  const lista: Date[] = [];
  let x = lunesDe(new Date(d.getFullYear(), d.getMonth(), 1));
  if (x.getMonth() !== d.getMonth()) x = sumarDias(x, 7);
  while (x.getMonth() === d.getMonth()) {
    lista.push(x);
    x = sumarDias(x, 7);
  }
  return lista;
}

export default function Objetivos() {
  return <MarcoAdmin>{(rol) => <ObjetivosContenido rol={rol} />}</MarcoAdmin>;
}

function ObjetivosContenido({ rol }: { rol: RolEquipo }) {
  const [lunes, setLunes] = useState(() => lunesDe(new Date()));
  const [equipo, setEquipo] = useState<Persona[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [hechos, setHechos] = useState<{ responsable: string | null; a: string; creado: string }[]>([]);
  const [aviso, setAviso] = useState("");
  const esAdmin = rol === "admin";

  const semanasMes = useMemo(() => semanasDelMes(lunes), [lunes]);
  const inicioMes = semanasMes[0] ?? lunes;
  const finMes = sumarDias(semanasMes[semanasMes.length - 1] ?? lunes, 7);

  const cargar = useCallback(async () => {
    const [{ data: eq }, { data: ob }, { data: ev }] = await Promise.all([
      sb().from("equipo").select("correo, nombre, puesto").order("nombre"),
      sb().from("radar_objetivos").select("*").gte("semana", iso(inicioMes)).lt("semana", iso(finMes)),
      sb()
        .from("radar_eventos")
        .select("a, creado, radar_negocios(responsable)")
        .eq("tipo", "estado")
        .gte("creado", inicioMes.toISOString())
        .lt("creado", finMes.toISOString()),
    ]);
    setEquipo((eq ?? []) as Persona[]);
    setObjetivos((ob ?? []) as Objetivo[]);
    setHechos(
      ((ev ?? []) as unknown as { a: string; creado: string; radar_negocios: { responsable: string | null } | null }[]).map((e) => ({
        a: e.a,
        creado: e.creado,
        responsable: e.radar_negocios?.responsable ?? null,
      })),
    );
  }, [inicioMes, finMes]);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const semana = iso(lunes);
  const objetivoDe = (correo: string, sem: string) => objetivos.find((o) => o.correo === correo && o.semana === sem);
  const hechosDe = (correo: string, estado: string, desde: Date, hasta: Date) =>
    hechos.filter((h) => h.responsable === correo && h.a === estado && Date.parse(h.creado) >= desde.getTime() && Date.parse(h.creado) < hasta.getTime()).length;

  const guardar = async (correo: string, k: Meta, valor: number) => {
    const actual = objetivoDe(correo, semana) ?? { correo, semana, propuestas: 0, abiertas: 0, respuestas: 0, ventas: 0 };
    const { error } = await sb()
      .from("radar_objetivos")
      .upsert({ ...actual, [k]: Math.max(0, Math.round(valor) || 0), actualizado: new Date().toISOString() });
    setAviso(error ? `No se pudo guardar: ${error.message}` : "");
    cargar();
  };
  const copiarSemanaAnterior = async () => {
    const anterior = iso(sumarDias(lunes, -7));
    const { data } = await sb().from("radar_objetivos").select("*").eq("semana", anterior);
    if (!data?.length) return setAviso("La semana anterior no tiene objetivos.");
    const { error } = await sb()
      .from("radar_objetivos")
      .upsert(data.map((o) => ({ ...o, semana, actualizado: new Date().toISOString() })));
    setAviso(error ? `No se pudo copiar: ${error.message}` : "Copiados los objetivos de la semana anterior.");
    cargar();
  };

  const finSemana = sumarDias(lunes, 7);
  const mes = lunes.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-[1200px] px-[max(16px,3vw)] py-10">
      <p className="etiqueta text-[11px] text-black/45">Objetivos de prospección</p>
      <h1 className="titulo mt-2 text-[clamp(30px,3.4vw,44px)] leading-[1.02]">
        Cuánto prospecta cada quien. <span className="text-black/35">Contra su meta.</span>
      </h1>
      <p className="mt-3 max-w-[66ch] text-[14px] text-black/60">
        Los objetivos se ponen por semana y el mes se ve sumando sus semanas. Lo logrado sale del Radar: cada negocio cuenta para su responsable. El objetivo trimestral vive en el CRM.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button onClick={() => setLunes(sumarDias(lunes, -7))} className="rounded-full bg-white px-4 py-2 text-[13px] font-bold ring-1 ring-black/10 hover:ring-black/40" aria-label="Semana anterior">
          ←
        </button>
        <p className="text-[15px] font-bold">
          Semana del {fecha(lunes)} al {fecha(sumarDias(lunes, 6))}
        </p>
        <button onClick={() => setLunes(sumarDias(lunes, 7))} className="rounded-full bg-white px-4 py-2 text-[13px] font-bold ring-1 ring-black/10 hover:ring-black/40" aria-label="Semana siguiente">
          →
        </button>
        <button onClick={() => setLunes(lunesDe(new Date()))} className="rounded-full px-4 py-2 text-[13px] font-bold text-black/55 hover:text-black">
          Esta semana
        </button>
        {esAdmin && (
          <button onClick={copiarSemanaAnterior} className="ml-auto rounded-full bg-black px-4 py-2 text-[13px] font-bold text-white hover:bg-amarillo hover:text-black">
            Copiar objetivos de la semana anterior
          </button>
        )}
      </div>
      {aviso && <p className="mt-3 text-[13px] text-black/60">{aviso}</p>}

      <div className="mt-5 overflow-x-auto rounded-[22px] bg-white ring-1 ring-black/[0.07]">
        <table className="w-full min-w-[860px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-black/[0.07] text-[11px] text-black/45 uppercase">
              <th className="px-5 py-3 font-bold">Persona</th>
              {METAS.map((m) => (
                <th key={m.k} className="px-3 py-3 font-bold">
                  {m.t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {equipo.map((p) => {
              const ob = objetivoDe(p.correo, semana);
              return (
                <tr key={p.correo} className="border-b border-black/[0.05] last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-bold">{p.nombre || p.correo}</p>
                    <p className="text-[12px] text-black/45">{p.puesto || "Sin puesto"}</p>
                  </td>
                  {METAS.map((m) => {
                    const meta = ob?.[m.k] ?? 0;
                    const logro = hechosDe(p.correo, m.estado, lunes, finSemana);
                    const metaMes = semanasMes.reduce((s, l) => s + (objetivoDe(p.correo, iso(l))?.[m.k] ?? 0), 0);
                    const logroMes = hechosDe(p.correo, m.estado, inicioMes, finMes);
                    const pct = meta ? Math.min(100, Math.round((logro / meta) * 100)) : 0;
                    return (
                      <td key={m.k} className="px-3 py-4 align-top">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[20px] font-extrabold tabular-nums">{logro}</span>
                          <span className="text-black/45">de</span>
                          {esAdmin ? (
                            <input
                              key={`${p.correo}-${semana}-${m.k}-${meta}`}
                              aria-label={`Objetivo de ${m.t} para ${p.nombre || p.correo}`}
                              type="number"
                              min={0}
                              defaultValue={meta}
                              onBlur={(e) => Number(e.target.value) !== meta && guardar(p.correo, m.k, Number(e.target.value))}
                              className="w-16 rounded-lg bg-humo px-2 py-1 text-[14px] font-bold tabular-nums outline-none focus:ring-2 focus:ring-amarillo"
                            />
                          ) : (
                            <span className="font-bold tabular-nums">{meta}</span>
                          )}
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
                          <div className={`h-full rounded-full ${pct >= 100 ? "bg-[#1f7a4d]" : "bg-amarillo"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-1.5 text-[11px] text-black/45 capitalize">
                          {mes}: {logroMes} de {metaMes}
                        </p>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!esAdmin && <p className="mt-3 text-[12px] text-black/45">Los objetivos los pone un administrador.</p>}
    </div>
  );
}
