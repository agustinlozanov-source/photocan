"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MarcoAdmin, type RolEquipo } from "@/components/admin/MarcoAdmin";
import { sesionActual } from "@/lib/sesion";
import { sb } from "@/lib/supabase";

type Escaneo = {
  id: string;
  zona: string;
  rubro: string;
  estado: "pendiente" | "escaneando" | "listo" | "error";
  total: number;
  revisados: number;
  detalle: string | null;
  responsable: string | null;
  creado: string;
};
type Diagnostico = {
  tiene?: boolean;
  soloRedes?: boolean;
  abre?: boolean;
  codigo?: number | string;
  gratuito?: boolean;
  https?: boolean;
  whatsapp?: boolean;
  formulario?: boolean;
  medicion?: boolean;
  anio?: number | null;
  correo?: string | null;
  velocidad?: { puntaje: number; segundos: number | null } | null;
};
type Estado = "detectado" | "elegido" | "propuesta_enviada" | "abrio" | "respondio" | "convertido" | "descartado";
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
  verificacion: { abre: boolean; por: string; nombre: string; fecha: string } | null;
  factores: { dolor?: number; valor?: number; demanda?: number; presion?: number; contacto?: number };
  indice: number | null;
  razon: string | null;
  estado: Estado;
  estado_desde: string;
  responsable: string | null;
};
type Persona = { correo: string; nombre: string | null };

const RUBROS = ["Dentistas", "Restaurantes", "Talleres mecánicos", "Estéticas", "Veterinarias", "Clínicas", "Abogados", "Contadores", "Inmobiliarias", "Gimnasios"];
const FACTORES: { k: keyof Negocio["factores"]; t: string }[] = [
  { k: "dolor", t: "Dolor" },
  { k: "valor", t: "Valor" },
  { k: "demanda", t: "Búsqueda" },
  { k: "presion", t: "Competencia" },
  { k: "contacto", t: "Contacto" },
];

/** El ciclo antes del CRM. "respondio" es la puerta de entrada al CRM. */
const ESTADOS: Record<Estado, { t: string; c: string; siguiente?: { a: Estado; t: string } }> = {
  detectado: { t: "Detectado", c: "bg-black/[0.06] text-black/60", siguiente: { a: "elegido", t: "Elegir" } },
  elegido: { t: "Elegido", c: "bg-amarillo text-black", siguiente: { a: "propuesta_enviada", t: "Propuesta enviada" } },
  propuesta_enviada: { t: "Propuesta enviada", c: "bg-[#e6ecfb] text-[#2b4aa8]", siguiente: { a: "abrio", t: "La abrió" } },
  abrio: { t: "Abrió la propuesta", c: "bg-[#efe5fb] text-[#6b2fb3]", siguiente: { a: "respondio", t: "Respondió" } },
  respondio: { t: "Respondió → CRM", c: "bg-[#e3f2ea] text-[#1f7a4d]", siguiente: { a: "convertido", t: "Compró" } },
  convertido: { t: "Cliente", c: "bg-[#1f7a4d] text-white" },
  descartado: { t: "Descartado", c: "bg-black/[0.06] text-black/40" },
};
const EN_CICLO: Estado[] = ["elegido", "propuesta_enviada", "abrio", "respondio", "convertido"];

const desde = (iso: string) => {
  const dias = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
  return dias <= 0 ? "hoy" : dias === 1 ? "ayer" : `hace ${dias} días`;
};

async function token() {
  const { data } = await sb().auth.getSession();
  return data.session?.access_token ?? "";
}

async function accion(cuerpo: Record<string, unknown>) {
  const r = await fetch("/api/radar/accion", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
    body: JSON.stringify(cuerpo),
  }).catch(() => null);
  return r?.ok ?? false;
}

/** Estado de la página: lo que verificó una persona manda; si no, la revisión automática. */
function estadoPagina(n: Negocio) {
  const d = n.diagnostico;
  const v = n.verificacion;
  if (!d || d.tiene === undefined) return { t: "Revisando…", c: "bg-black/5 text-black/50", verificado: false };
  if (!d.tiene) return d.soloRedes ? { t: "Solo redes", c: "bg-[#fde6d8] text-[#9a3b0b]", verificado: false } : { t: "Sin página", c: "bg-[#fde0de] text-[#a3231b]", verificado: false };
  if (v) return v.abre ? { t: "✓ Abre", c: "bg-[#e3f2ea] text-[#1f7a4d]", verificado: true } : { t: "✓ No abre", c: "bg-[#fde0de] text-[#a3231b]", verificado: true };
  if (!d.abre) return { t: typeof d.codigo === "number" ? `Error ${d.codigo}` : "No abrió", c: "bg-[#fde0de] text-[#a3231b]", verificado: false };
  const p = d.velocidad?.puntaje;
  if (p != null && p < 50) return { t: `Lenta ${p}/100`, c: "bg-[#fdf0d0] text-[#8a5f00]", verificado: false };
  return { t: p != null ? `Abre · ${p}/100` : "Abre", c: "bg-[#e3f2ea] text-[#1f7a4d]", verificado: false };
}

export default function Radar() {
  return <MarcoAdmin>{(rol) => <RadarContenido rol={rol} />}</MarcoAdmin>;
}

function RadarContenido({ rol }: { rol: RolEquipo }) {
  const s = sesionActual();
  const yo = s.estado === "dentro" ? s.usuario.correo.toLowerCase() : "";
  const [equipo, setEquipo] = useState<Persona[]>([]);
  const [escaneos, setEscaneos] = useState<Escaneo[]>([]);
  const [actual, setActual] = useState<string | null>(null);
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [zona, setZona] = useState("Matamoros, Tamaulipas");
  const [rubro, setRubro] = useState("");
  const [responsable, setResponsable] = useState(yo);
  const [soloMios, setSoloMios] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [filtro, setFiltro] = useState<"ranking" | "sinPagina" | "nectar" | "seguimiento" | "descartados">("ranking");
  const [abierto, setAbierto] = useState<string | null>(null);
  const nombreDe = useCallback((correo: string | null) => (correo ? (equipo.find((p) => p.correo === correo)?.nombre ?? correo) : "Sin asignar"), [equipo]);

  useEffect(() => {
    sb()
      .from("equipo")
      .select("correo, nombre")
      .order("nombre")
      .then(({ data }) => setEquipo((data ?? []) as Persona[]));
  }, []);

  const cargarEscaneos = useCallback(async () => {
    const { data } = await sb().from("radar_escaneos").select("*").order("creado", { ascending: false }).limit(50);
    const lista = (data ?? []) as Escaneo[];
    setEscaneos(lista);
    setActual((a) => a ?? lista[0]?.id ?? null);
  }, []);

  const cargarNegocios = useCallback(async (id: string) => {
    const { data } = await sb().from("radar_negocios").select("*").eq("escaneo_id", id).order("indice", { ascending: false, nullsFirst: false }).order("posicion");
    setNegocios((data ?? []) as Negocio[]);
  }, []);

  useEffect(() => {
    cargarEscaneos();
  }, [cargarEscaneos]);
  useEffect(() => {
    if (actual) cargarNegocios(actual);
  }, [actual, cargarNegocios]);

  const esc = escaneos.find((e) => e.id === actual);
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
      body: JSON.stringify({ zona, rubro, responsable }),
    }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setEnviando(false);
    if (!r?.ok) return setAviso(d.error ?? "No se pudo arrancar el escaneo.");
    setActual(d.escaneo_id);
    setRubro("");
    cargarEscaneos();
  };

  const noAbrieron = negocios.filter((n) => n.diagnostico?.tiene && n.diagnostico?.abre === false && !n.verificacion).length;
  const reintentar = async () => {
    if (!esc) return;
    const r = await fetch("/api/radar/escanear", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify({ reintentar: true, escaneo_id: esc.id }),
    }).catch(() => null);
    if (!r?.ok) return setAviso("No se pudo volver a revisar.");
    cargarEscaneos();
  };

  const cambiarEstado = async (n: Negocio, estado: Estado) => {
    setNegocios((l) => l.map((x) => (x.id === n.id ? { ...x, estado, estado_desde: new Date().toISOString(), responsable: x.responsable ?? (estado === "descartado" ? null : yo) } : x)));
    if (!(await accion({ accion: "estado", negocio_id: n.id, estado }))) setAviso("No se pudo cambiar el estado.");
    if (actual) cargarNegocios(actual);
  };
  const verificar = async (n: Negocio, abre: boolean | null) => {
    if (!(await accion({ accion: "verificar", negocio_id: n.id, abre }))) setAviso("No se pudo guardar la verificación.");
    if (actual) cargarNegocios(actual);
  };

  const escaneosVisibles = soloMios ? escaneos.filter((e) => e.responsable === yo) : escaneos;
  const visibles = useMemo(
    () =>
      negocios.filter((n) => {
        if (filtro === "descartados") return n.estado === "descartado";
        if (n.estado === "descartado") return false;
        if (filtro === "nectar") return n.estado === "elegido";
        if (filtro === "seguimiento") return EN_CICLO.includes(n.estado) && n.estado !== "elegido";
        if (filtro === "sinPagina") return !n.diagnostico?.tiene || (n.verificacion ? !n.verificacion.abre : n.diagnostico?.abre === false);
        return true;
      }),
    [negocios, filtro],
  );
  const resumen = useMemo(() => {
    const cuenta = (e: Estado[]) => negocios.filter((n) => e.includes(n.estado)).length;
    return {
      total: negocios.length,
      sin: negocios.filter((n) => n.diagnostico?.tiene === false).length,
      elegidos: cuenta(EN_CICLO),
      enviadas: cuenta(["propuesta_enviada", "abrio", "respondio", "convertido"]),
      respondieron: cuenta(["respondio", "convertido"]),
      verificados: negocios.filter((n) => n.verificacion && EN_CICLO.includes(n.estado)).length,
    };
  }, [negocios]);

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 px-[max(16px,3vw)] py-8 lg:grid-cols-[300px_1fr]">
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
          {rol === "admin" && equipo.length > 1 && (
            <>
              <label className="mt-3 block text-[12px] font-semibold text-white/60" htmlFor="responsable">
                Responsable
              </label>
              <select
                id="responsable"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-amarillo"
              >
                {equipo.map((p) => (
                  <option key={p.correo} value={p.correo} className="text-black">
                    {p.nombre || p.correo}
                  </option>
                ))}
              </select>
            </>
          )}
          <button onClick={escanear} disabled={enviando} className="mt-4 w-full rounded-full bg-amarillo py-3 text-[14px] font-bold text-black hover:bg-white disabled:opacity-50">
            {enviando ? "Arrancando…" : "Escanear"}
          </button>
          {aviso && <p className="mt-2 text-[12px] text-[#ff9b8f]">{aviso}</p>}
          <p className="mt-3 text-[11px] leading-relaxed text-white/40">Hasta 60 negocios por escaneo, en el orden en que los muestra Google Maps.</p>
        </section>

        <section className="rounded-[22px] border border-black/[0.07] bg-white p-3">
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <p className="text-[12px] font-bold text-black/45">Escaneos</p>
            <label className="flex items-center gap-1.5 text-[12px] text-black/55">
              <input type="checkbox" checked={soloMios} onChange={(e) => setSoloMios(e.target.checked)} className="accent-black" />
              Solo míos
            </label>
          </div>
          {escaneosVisibles.length === 0 && <p className="px-2 pb-2 text-[13px] text-black/50">Aún no hay escaneos.</p>}
          <ul className="grid gap-1">
            {escaneosVisibles.map((e) => (
              <li key={e.id}>
                <button onClick={() => setActual(e.id)} className={`w-full rounded-2xl px-3 py-2.5 text-left transition-colors ${e.id === actual ? "bg-black text-white" : "hover:bg-humo"}`}>
                  <span className="block text-[14px] font-bold capitalize">{e.rubro}</span>
                  <span className={`block text-[12px] ${e.id === actual ? "text-white/60" : "text-black/50"}`}>
                    {e.zona} · {e.estado === "listo" ? `${e.total} negocios` : e.estado === "error" ? "Error" : `${e.revisados}/${e.total || "…"}`}
                  </span>
                  <span className={`block text-[11px] ${e.id === actual ? "text-amarillo" : "text-black/40"}`}>{nombreDe(e.responsable)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </aside>

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
                <p className="etiqueta text-[11px] text-black/45">
                  {esc.zona} · {nombreDe(esc.responsable)}
                </p>
                <h1 className="titulo mt-1 text-[clamp(28px,3vw,40px)] leading-none capitalize">{esc.rubro}</h1>
              </div>
              <div className="flex flex-wrap gap-2 text-[12px]">
                {(
                  [
                    ["Negocios", resumen.total],
                    ["Sin página", resumen.sin],
                    ["En ciclo", resumen.elegidos],
                    ["Propuestas", resumen.enviadas],
                    ["Respondieron", resumen.respondieron],
                  ] as const
                ).map(([t, v]) => (
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

            <p className="mt-4 text-[12px] text-black/50">
              El estado de cada página sale de una <b>revisión automática</b>: tómalo como pista. Abre la página y confírmalo con <b>Sí abre</b> o <b>No abre</b>; lo verificado por
              una persona manda y recalcula el índice.
            </p>
            {esc.estado === "listo" && noAbrieron > 0 && (
              <button onClick={reintentar} className="mt-3 rounded-full bg-white px-4 py-2 text-[13px] font-bold ring-1 ring-black/10 hover:ring-black/40">
                Volver a revisar las {noAbrieron} páginas que no abrieron
              </button>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  ["ranking", "Ranking"],
                  ["sinPagina", "Sin página o no abre"],
                  ["nectar", `Néctar de la semana · ${negocios.filter((n) => n.estado === "elegido").length}`],
                  ["seguimiento", `Seguimiento · ${resumen.enviadas}`],
                  ["descartados", "Descartados"],
                ] as const
              ).map(([id, t]) => (
                <button key={id} onClick={() => setFiltro(id)} className={`rounded-full px-4 py-2 text-[13px] font-bold ${filtro === id ? "bg-black text-white" : "bg-white text-black/60 ring-1 ring-black/[0.08] hover:text-black"}`}>
                  {t}
                </button>
              ))}
            </div>
            {filtro === "nectar" && resumen.elegidos > 0 && (
              <p className="mt-3 text-[12px] text-black/55">
                {resumen.verificados} de {resumen.elegidos} en el ciclo con su página verificada por una persona.
              </p>
            )}

            <ol className="mt-4 grid gap-2">
              {visibles.map((n, i) => {
                const ep = estadoPagina(n);
                const est = ESTADOS[n.estado];
                const ab = abierto === n.id;
                const conSitio = Boolean(n.sitio) && n.diagnostico?.tiene;
                return (
                  <li key={n.id} className={`rounded-[18px] bg-white ring-1 ${EN_CICLO.includes(n.estado) ? "ring-2 ring-amarillo" : "ring-black/[0.07]"}`}>
                    <div className="grid items-center gap-x-4 gap-y-3 p-4 md:grid-cols-[52px_1fr_auto]">
                      <div className="flex items-center gap-3 md:block">
                        <span className="grid size-[52px] place-items-center rounded-2xl bg-black text-[20px] font-extrabold text-amarillo tabular-nums">{n.indice ?? "—"}</span>
                        <span className="text-[11px] text-black/40 md:mt-1 md:block md:text-center">#{i + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <button onClick={() => setAbierto(ab ? null : n.id)} className="block w-full min-w-0 text-left">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-[16px] font-bold">{n.nombre}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${ep.c}`} title={ep.verificado ? "Verificado por una persona" : "Revisión automática"}>
                              {ep.t}
                            </span>
                            {n.calificacion != null && (
                              <span className="text-[12px] text-black/55">
                                ★ {n.calificacion} · {n.resenas} reseñas
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block text-[13px] text-black/60">{n.razon ?? "Calculando…"}</span>
                        </button>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
                          <span className={`rounded-full px-2.5 py-1 font-bold ${est.c}`}>{est.t}</span>
                          {n.estado !== "detectado" && <span className="text-black/45">{desde(n.estado_desde)}</span>}
                          {n.responsable && <span className="text-black/45">· {nombreDe(n.responsable)}</span>}
                          {conSitio && (
                            <span className="flex flex-wrap items-center gap-1.5 md:ml-2">
                              <a href={n.sitio} target="_blank" rel="noopener" className="rounded-full px-2.5 py-1 font-bold ring-1 ring-black/10 hover:ring-black/40">
                                Abrir página ↗
                              </a>
                              <button
                                onClick={() => verificar(n, n.verificacion?.abre === true ? null : true)}
                                className={`rounded-full px-2.5 py-1 font-bold ${n.verificacion?.abre === true ? "bg-[#1f7a4d] text-white" : "ring-1 ring-black/10 hover:ring-black/40"}`}
                              >
                                Sí abre
                              </button>
                              <button
                                onClick={() => verificar(n, n.verificacion?.abre === false ? null : false)}
                                className={`rounded-full px-2.5 py-1 font-bold ${n.verificacion?.abre === false ? "bg-[#a3231b] text-white" : "ring-1 ring-black/10 hover:ring-black/40"}`}
                              >
                                No abre
                              </button>
                              <span className="text-black/40">
                                {n.verificacion ? `Verificado por ${n.verificacion.nombre}, ${desde(n.verificacion.fecha)}` : "Sin verificar · revisión automática"}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        {est.siguiente && (
                          <button onClick={() => cambiarEstado(n, est.siguiente!.a)} className="rounded-full bg-black px-4 py-2 text-[12px] font-bold text-white hover:bg-amarillo hover:text-black">
                            {est.siguiente.t}
                          </button>
                        )}
                        <select
                          aria-label={`Mover ${n.nombre} a otro estado`}
                          value=""
                          onChange={(e) => e.target.value && cambiarEstado(n, e.target.value as Estado)}
                          className="rounded-full bg-humo px-3 py-2 text-[12px] font-semibold text-black/60 outline-none"
                        >
                          <option value="">Mover a…</option>
                          {(Object.keys(ESTADOS) as Estado[])
                            .filter((k) => k !== n.estado)
                            .map((k) => (
                              <option key={k} value={k}>
                                {ESTADOS[k].t}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    {ab && (
                      <div className="grid gap-5 border-t border-black/[0.06] p-4 text-[13px] md:grid-cols-3">
                        <div>
                          <p className="text-[11px] font-bold text-black/40 uppercase">Por qué este índice</p>
                          <ul className="mt-2 grid gap-1.5">
                            {FACTORES.map((f) => (
                              <li key={f.k} className="grid grid-cols-[86px_1fr_28px] items-center gap-2">
                                <span className="text-black/60">{f.t}</span>
                                <span className="h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
                                  <span className="block h-full rounded-full bg-amarillo" style={{ width: `${n.factores?.[f.k] ?? 0}%` }} />
                                </span>
                                <span className="text-right tabular-nums">{n.factores?.[f.k] ?? 0}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-3 text-[12px] text-black/50">Confianza: {ep.verificado ? "alta, verificado por una persona" : "media, revisión automática"}.</p>
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
                                {n.diagnostico.gratuito && <li>✗ Hecha en un constructor gratuito</li>}
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
                            <li className="text-black/40">
                              Lugar {n.posicion} en Google{n.categoria ? ` · ${n.categoria}` : ""}
                            </li>
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
  );
}
