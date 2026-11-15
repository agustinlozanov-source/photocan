"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSesion } from "@/lib/sesion";
import { sb } from "@/lib/supabase";

type Escaneo = { id: string; zona: string; rubro: string; estado: "pendiente" | "escaneando" | "listo" | "error"; total: number; revisados: number; detalle: string | null; creado: string };
type Diagnostico = {
  tiene?: boolean;
  soloRedes?: boolean;
  abre?: boolean;
  https?: boolean;
  whatsapp?: boolean;
  formulario?: boolean;
  medicion?: boolean;
  anio?: number | null;
  correo?: string | null;
  velocidad?: { puntaje: number; segundos: number | null } | null;
};
type Negocio = {
  id: string;
  place_id: string;
  posicion: number;
  nombre: string;
  direccion: string;
  telefono: string;
  sitio: string;
  calificacion: number | null;
  resenas: number;
  categoria: string;
  maps_url: string;
  diagnostico: Diagnostico;
  factores: { dolor?: number; valor?: number; demanda?: number; presion?: number; contacto?: number };
  indice: number | null;
  razon: string | null;
  estado: "detectado" | "elegido" | "descartado";
};

const RUBROS = ["Dentistas", "Restaurantes", "Talleres mecánicos", "Estéticas", "Veterinarias", "Clínicas", "Abogados", "Contadores", "Inmobiliarias", "Gimnasios"];
const FACTORES: { k: keyof Negocio["factores"]; t: string }[] = [
  { k: "dolor", t: "Dolor" },
  { k: "valor", t: "Valor" },
  { k: "demanda", t: "Búsqueda" },
  { k: "presion", t: "Competencia" },
  { k: "contacto", t: "Contacto" },
];

async function token() {
  const { data } = await sb().auth.getSession();
  return data.session?.access_token ?? "";
}

function estadoPagina(d: Diagnostico) {
  if (!d || d.tiene === undefined) return { t: "Revisando…", c: "bg-black/5 text-black/50" };
  if (!d.tiene) return d.soloRedes ? { t: "Solo redes", c: "bg-[#fde6d8] text-[#9a3b0b]" } : { t: "Sin página", c: "bg-[#fde0de] text-[#a3231b]" };
  if (!d.abre) return { t: "No abre", c: "bg-[#fde0de] text-[#a3231b]" };
  const p = d.velocidad?.puntaje;
  if (p != null && p < 50) return { t: `Lenta ${p}/100`, c: "bg-[#fdf0d0] text-[#8a5f00]" };
  return { t: p != null ? `Abre · ${p}/100` : "Abre", c: "bg-[#e3f2ea] text-[#1f7a4d]" };
}

export default function Radar() {
  const sesion = useSesion();
  const [staff, setStaff] = useState<boolean | null>(null);
  const [escaneos, setEscaneos] = useState<Escaneo[]>([]);
  const [actual, setActual] = useState<string | null>(null);
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [zona, setZona] = useState("Matamoros, Tamaulipas");
  const [rubro, setRubro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "sinPagina" | "elegidos">("todos");
  const [abierto, setAbierto] = useState<string | null>(null);

  useEffect(() => {
    if (sesion.estado !== "dentro") return;
    sb()
      .from("perfiles")
      .select("es_staff")
      .eq("id", sesion.usuario.id)
      .maybeSingle()
      .then(({ data }) => setStaff(Boolean(data?.es_staff)));
  }, [sesion]);

  const cargarEscaneos = useCallback(async () => {
    const { data } = await sb().from("radar_escaneos").select("*").order("creado", { ascending: false }).limit(30);
    const lista = (data ?? []) as Escaneo[];
    setEscaneos(lista);
    setActual((a) => a ?? lista[0]?.id ?? null);
  }, []);

  const cargarNegocios = useCallback(async (id: string) => {
    const { data } = await sb().from("radar_negocios").select("*").eq("escaneo_id", id).order("indice", { ascending: false, nullsFirst: false }).order("posicion");
    setNegocios((data ?? []) as Negocio[]);
  }, []);

  useEffect(() => {
    if (staff) cargarEscaneos();
  }, [staff, cargarEscaneos]);

  useEffect(() => {
    if (actual) cargarNegocios(actual);
  }, [actual, cargarNegocios]);

  const esc = escaneos.find((e) => e.id === actual);
  // Mientras escanea, se actualiza solo.
  useEffect(() => {
    if (!esc || (esc.estado !== "escaneando" && esc.estado !== "pendiente")) return;
    const t = setInterval(() => {
      cargarEscaneos();
      cargarNegocios(esc.id);
    }, 4000);
    return () => clearInterval(t);
  }, [esc, cargarEscaneos, cargarNegocios]);

  const escanear = async () => {
    if (!zona.trim() || !rubro.trim()) return setAviso("Escribe la zona y el rubro.");
    setEnviando(true);
    setAviso("");
    const r = await fetch("/api/radar/escanear", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify({ zona, rubro }),
    }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setEnviando(false);
    if (!r?.ok) return setAviso(d.error ?? "No se pudo arrancar el escaneo.");
    setActual(d.escaneo_id);
    setRubro("");
    cargarEscaneos();
  };

  const marcar = async (n: Negocio, estado: Negocio["estado"]) => {
    const nuevo = n.estado === estado ? "detectado" : estado;
    setNegocios((l) => l.map((x) => (x.id === n.id ? { ...x, estado: nuevo } : x)));
    await sb().from("radar_negocios").update({ estado: nuevo }).eq("id", n.id);
  };

  const visibles = useMemo(
    () =>
      negocios.filter((n) =>
        filtro === "elegidos" ? n.estado === "elegido" : filtro === "sinPagina" ? n.estado !== "descartado" && (!n.diagnostico?.tiene || n.diagnostico?.abre === false) : n.estado !== "descartado",
      ),
    [negocios, filtro],
  );
  const resumen = useMemo(() => {
    const sin = negocios.filter((n) => n.diagnostico?.tiene === false).length;
    const malas = negocios.filter((n) => n.diagnostico?.tiene && ((n.factores?.dolor ?? 0) >= 50)).length;
    return { total: negocios.length, sin, malas, elegidos: negocios.filter((n) => n.estado === "elegido").length };
  }, [negocios]);

  if (sesion.estado === "cargando" || (sesion.estado === "dentro" && staff === null)) return <Pantalla><p className="text-white/60">Cargando…</p></Pantalla>;
  if (sesion.estado === "fuera")
    return (
      <Pantalla>
        <p className="text-white/70">Entra con tu correo del equipo y vuelve a esta página.</p>
        <a href="/portal/entrar/" className="mt-6 inline-flex rounded-full bg-amarillo px-6 py-3 text-[14px] font-bold text-black">
          Entrar
        </a>
      </Pantalla>
    );
  if (!staff)
    return (
      <Pantalla>
        <p className="text-white/70">El Radar es solo para el equipo de Phot8can. Tu cuenta todavía no tiene acceso.</p>
        <p className="mt-3 text-[13px] text-white/45">Entraste como {sesion.usuario.correo}</p>
      </Pantalla>
    );

  return (
    <main className="min-h-dvh bg-humo text-black">
      <header className="bg-black text-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-[max(16px,3vw)] py-5">
          <div className="flex items-center gap-4">
            <img src="/marca/logo_color_fondo-oscuro.png" alt="Phot8can" className="h-7 w-auto" />
            <span className="h-6 w-px bg-white/20" />
            <p className="text-[13px] font-bold tracking-[0.2em] text-amarillo uppercase">Radar</p>
          </div>
          <p className="text-[12px] text-white/50">Superadministrador · prospección</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-[max(16px,3vw)] py-8 lg:grid-cols-[300px_1fr]">
        {/* Columna izquierda: nuevo escaneo + historial */}
        <aside className="grid content-start gap-5">
          <section className="rounded-[22px] bg-black p-5 text-white">
            <p className="text-[15px] font-bold">Nuevo escaneo</p>
            <label className="mt-4 block text-[12px] font-semibold text-white/60" htmlFor="zona">
              Zona
            </label>
            <input id="zona" value={zona} onChange={(e) => setZona(e.target.value)} className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-amarillo" />
            <label className="mt-3 block text-[12px] font-semibold text-white/60" htmlFor="rubro">
              Rubro
            </label>
            <input
              id="rubro"
              value={rubro}
              onChange={(e) => setRubro(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && escanear()}
              placeholder="Dentistas"
              className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2.5 text-[14px] outline-none placeholder:text-white/30 focus:ring-2 focus:ring-amarillo"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {RUBROS.map((r) => (
                <button key={r} onClick={() => setRubro(r)} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/70 hover:bg-amarillo hover:text-black">
                  {r}
                </button>
              ))}
            </div>
            <button onClick={escanear} disabled={enviando} className="mt-4 w-full rounded-full bg-amarillo py-3 text-[14px] font-bold text-black hover:bg-white disabled:opacity-50">
              {enviando ? "Arrancando…" : "Escanear"}
            </button>
            {aviso && <p className="mt-2 text-[12px] text-[#ff9b8f]">{aviso}</p>}
            <p className="mt-3 text-[11px] leading-relaxed text-white/40">Hasta 60 negocios por escaneo, en el orden en que los muestra Google Maps.</p>
          </section>

          <section className="rounded-[22px] border border-black/[0.07] bg-white p-3">
            <p className="px-2 pt-1 pb-2 text-[12px] font-bold text-black/45">Escaneos</p>
            {escaneos.length === 0 && <p className="px-2 pb-2 text-[13px] text-black/50">Aún no hay escaneos.</p>}
            <ul className="grid gap-1">
              {escaneos.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => setActual(e.id)}
                    className={`w-full rounded-2xl px-3 py-2.5 text-left transition-colors ${e.id === actual ? "bg-black text-white" : "hover:bg-humo"}`}
                  >
                    <span className="block text-[14px] font-bold capitalize">{e.rubro}</span>
                    <span className={`block text-[12px] ${e.id === actual ? "text-white/60" : "text-black/50"}`}>
                      {e.zona} · {e.estado === "listo" ? `${e.total} negocios` : e.estado === "error" ? "Error" : `${e.revisados}/${e.total || "…"}`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* Ranking */}
        <section className="min-w-0">
          {!esc ? (
            <div className="grid min-h-[360px] place-items-center rounded-[22px] border border-dashed border-black/15 bg-white p-10 text-center">
              <div>
                <p className="titulo text-[28px]">Enciende el Radar</p>
                <p className="mt-2 max-w-[44ch] text-[14px] text-black/55">Elige una zona y un rubro. El Radar busca los negocios, revisa su página y los ordena por oportunidad.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="etiqueta text-[11px] text-black/45">{esc.zona}</p>
                  <h1 className="titulo mt-1 text-[clamp(28px,3vw,40px)] leading-none capitalize">{esc.rubro}</h1>
                </div>
                <div className="flex flex-wrap gap-2 text-[12px]">
                  {[
                    ["Negocios", resumen.total],
                    ["Sin página", resumen.sin],
                    ["Página con fallas", resumen.malas],
                    ["Elegidos", resumen.elegidos],
                  ].map(([t, v]) => (
                    <span key={t} className="rounded-2xl bg-white px-3.5 py-2 ring-1 ring-black/[0.07]">
                      <b className="mr-1.5 text-[16px] tabular-nums">{v}</b>
                      <span className="text-black/55">{t}</span>
                    </span>
                  ))}
                </div>
              </div>

              {esc.estado !== "listo" && (
                <div className={`mt-5 rounded-[18px] px-5 py-4 text-[14px] ${esc.estado === "error" ? "bg-[#fde0de] text-[#a3231b]" : "bg-black text-white"}`}>
                  {esc.estado === "error" ? (
                    <>No se completó: {esc.detalle}</>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="size-2.5 animate-ping rounded-full bg-amarillo" />
                      <span className="flex-1">{esc.detalle ?? "Preparando…"}</span>
                      {esc.total > 0 && (
                        <span className="tabular-nums text-white/60">
                          {esc.revisados}/{esc.total}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {(
                  [
                    ["todos", "Ranking"],
                    ["sinPagina", "Sin página o no abre"],
                    ["elegidos", "Néctar de la semana"],
                  ] as const
                ).map(([id, t]) => (
                  <button key={id} onClick={() => setFiltro(id)} className={`rounded-full px-4 py-2 text-[13px] font-bold ${filtro === id ? "bg-black text-white" : "bg-white text-black/60 ring-1 ring-black/[0.08] hover:text-black"}`}>
                    {t}
                  </button>
                ))}
              </div>

              <ol className="mt-4 grid gap-2">
                {visibles.map((n, i) => {
                  const ep = estadoPagina(n.diagnostico);
                  const ab = abierto === n.id;
                  return (
                    <li key={n.id} className={`rounded-[18px] bg-white ring-1 transition-shadow ${n.estado === "elegido" ? "ring-2 ring-amarillo" : "ring-black/[0.07]"}`}>
                      <div className="grid items-center gap-x-4 gap-y-2 p-4 sm:grid-cols-[52px_1fr_auto]">
                        <div className="flex items-center gap-3 sm:block">
                          <span className="grid size-[52px] place-items-center rounded-2xl bg-black text-[20px] font-extrabold text-amarillo tabular-nums">{n.indice ?? "—"}</span>
                          <span className="text-[11px] text-black/40 sm:mt-1 sm:block sm:text-center">#{i + 1}</span>
                        </div>
                        <button onClick={() => setAbierto(ab ? null : n.id)} className="min-w-0 text-left">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-[16px] font-bold">{n.nombre}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${ep.c}`}>{ep.t}</span>
                            {n.calificacion != null && (
                              <span className="text-[12px] text-black/55">
                                ★ {n.calificacion} · {n.resenas} reseñas
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block text-[13px] text-black/60">{n.razon ?? "Calculando…"}</span>
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => marcar(n, "elegido")}
                            className={`rounded-full px-4 py-2 text-[12px] font-bold ${n.estado === "elegido" ? "bg-amarillo text-black" : "bg-black text-white hover:bg-amarillo hover:text-black"}`}
                          >
                            {n.estado === "elegido" ? "✓ Elegido" : "Elegir"}
                          </button>
                          <button onClick={() => marcar(n, "descartado")} className="rounded-full px-3 py-2 text-[12px] font-bold text-black/45 ring-1 ring-black/10 hover:text-black" aria-label={`Descartar ${n.nombre}`}>
                            {n.estado === "descartado" ? "Recuperar" : "Descartar"}
                          </button>
                        </div>
                      </div>
                      {ab && (
                        <div className="grid gap-5 border-t border-black/[0.06] p-4 text-[13px] md:grid-cols-3">
                          <div>
                            <p className="text-[11px] font-bold text-black/40 uppercase">Por qué este índice</p>
                            <ul className="mt-2 grid gap-1.5">
                              {FACTORES.map((f) => (
                                <li key={f.k} className="grid grid-cols-[80px_1fr_28px] items-center gap-2">
                                  <span className="text-black/60">{f.t}</span>
                                  <span className="h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
                                    <span className="block h-full rounded-full bg-amarillo" style={{ width: `${n.factores?.[f.k] ?? 0}%` }} />
                                  </span>
                                  <span className="text-right tabular-nums">{n.factores?.[f.k] ?? 0}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-black/40 uppercase">Su página</p>
                            <ul className="mt-2 grid gap-1 text-black/70">
                              {n.sitio ? (
                                <li className="truncate">
                                  <a href={n.sitio} target="_blank" rel="noopener" className="underline">
                                    {n.sitio.replace(/^https?:\/\//, "")}
                                  </a>
                                </li>
                              ) : (
                                <li>Sin sitio en Google</li>
                              )}
                              {n.diagnostico?.abre && (
                                <>
                                  <li>{n.diagnostico.https ? "✓" : "✗"} Candado de seguridad</li>
                                  <li>{n.diagnostico.whatsapp ? "✓" : "✗"} WhatsApp</li>
                                  <li>{n.diagnostico.formulario ? "✓" : "✗"} Formulario</li>
                                  <li>{n.diagnostico.medicion ? "✓" : "✗"} Medición (pixel o Analytics)</li>
                                  {n.diagnostico.velocidad && (
                                    <li>
                                      Celular: {n.diagnostico.velocidad.puntaje}/100{n.diagnostico.velocidad.segundos ? ` · ${n.diagnostico.velocidad.segundos} s` : ""}
                                    </li>
                                  )}
                                  {n.diagnostico.anio && <li>© {n.diagnostico.anio}</li>}
                                </>
                              )}
                            </ul>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-black/40 uppercase">Contacto</p>
                            <ul className="mt-2 grid gap-1 text-black/70">
                              {n.telefono && <li className="select-all">{n.telefono}</li>}
                              {n.diagnostico?.correo && <li className="select-all">{n.diagnostico.correo}</li>}
                              <li className="text-black/50">{n.direccion}</li>
                              {n.maps_url && (
                                <li>
                                  <a href={n.maps_url} target="_blank" rel="noopener" className="underline">
                                    Ver en Google Maps
                                  </a>
                                </li>
                              )}
                              <li className="text-black/40">Lugar {n.posicion} en Google</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
              {visibles.length === 0 && esc.estado === "listo" && <p className="mt-6 text-center text-[14px] text-black/50">Nada en esta vista.</p>}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function Pantalla({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-black px-6 text-center text-white">
      <div>
        <p className="text-[13px] font-bold tracking-[0.2em] text-amarillo uppercase">Radar</p>
        <div className="mt-4">{children}</div>
      </div>
    </main>
  );
}
