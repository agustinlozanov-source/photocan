// Todo lo que el servidor necesita para crear y publicar el sitio de un cliente:
// Supabase (con la llave secreta), GitHub, Netlify y el agente de Claude.
//
// Variables de entorno en Netlify:
//   SUPABASE_SECRET_KEY            llave secreta de Supabase
//   GITHUB_TOKEN_SITIOS            token de phot8can-dotcom (repos de clientes)
//   NETLIFY_API_TOKEN              token de Netlify (crear sitios)
//   NETLIFY_GITHUB_INSTALLATION_ID id de la app de Netlify instalada en phot8can-dotcom
//   ANTHROPIC_API_KEY              llave de Claude
//   SITIOS_GITHUB_DUENO            opcional (por defecto phot8can-dotcom)
//   SITIOS_PLANTILLA               opcional (por defecto phot8can-sitios)

import Anthropic, { toFile } from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./comun.mjs";

export const DUENO = process.env.SITIOS_GITHUB_DUENO ?? "phot8can-dotcom";
export const PLANTILLA = process.env.SITIOS_PLANTILLA ?? "phot8can-sitios";
const MODELO_AGENTE = process.env.ANTHROPIC_MODELO_AGENTE ?? "claude-opus-5-5";
/** Súbelo cuando cambies las instrucciones del agente: se actualiza solo en la siguiente corrida. */
const VERSION_AGENTE = "2026-11-14.1";
const PRESUPUESTO_CENTAVOS = process.env.AGENTE_PRESUPUESTO_CENTAVOS ?? "3000"; // $30 USD por sesión

const requerida = (nombre) => {
  const v = process.env[nombre];
  if (!v) throw new Error(`Falta la variable de entorno ${nombre} en Netlify.`);
  return v;
};

/* ---------------------------------------------------------------- Supabase */

let _admin;
export const admin = () =>
  (_admin ??= createClient(SUPABASE_URL, requerida("SUPABASE_SECRET_KEY"), { auth: { persistSession: false, autoRefreshToken: false } }));

export async function miembroDe(usuarioId) {
  const { data } = await admin().from("miembros").select("organizacion_id, rol").eq("usuario_id", usuarioId).order("creado").limit(1).maybeSingle();
  return data;
}

export async function esStaff(usuarioId) {
  const { data } = await admin().from("perfiles").select("es_staff").eq("id", usuarioId).maybeSingle();
  return Boolean(data?.es_staff);
}

export async function leerSitio(orgId) {
  const { data } = await admin().from("sitios").select("*").eq("organizacion_id", orgId).maybeSingle();
  return data;
}

export async function guardarSitio(orgId, cambios) {
  const { data, error } = await admin()
    .from("sitios")
    .upsert({ organizacion_id: orgId, ...cambios }, { onConflict: "organizacion_id" })
    .select("*")
    .single();
  if (error) throw new Error(`No se pudo guardar el sitio: ${error.message}`);
  return data;
}

export const cambiarFase = (orgId, fase) => admin().from("organizaciones").update({ fase }).eq("id", orgId);

/* ---------------------------------------------------------------- GitHub */

async function gh(ruta, opciones = {}) {
  const r = await fetch(`https://api.github.com${ruta}`, {
    ...opciones,
    headers: {
      Authorization: `Bearer ${requerida("GITHUB_TOKEN_SITIOS")}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opciones.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const texto = await r.text();
  const datos = texto ? JSON.parse(texto) : null;
  return { ok: r.ok, status: r.status, datos };
}

export const nombreRepo = (nombre, orgId) =>
  `${nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "sitio"}-${orgId.slice(0, 6)}`;

/** Crea el repo del cliente desde la plantilla (si no existe) y espera a que tenga main. */
export async function asegurarRepo(nombre) {
  const existe = await gh(`/repos/${DUENO}/${nombre}`);
  if (!existe.ok) {
    const r = await gh(`/repos/${DUENO}/${PLANTILLA}/generate`, {
      method: "POST",
      body: JSON.stringify({ owner: DUENO, name: nombre, private: true, description: "Página Viva · Phot8can" }),
    });
    if (!r.ok) throw new Error(`GitHub no creó el repo (${r.status}): ${r.datos?.message ?? ""}`);
  }
  for (let i = 0; i < 15; i++) {
    const rama = await gh(`/repos/${DUENO}/${nombre}/branches/main`);
    if (rama.ok) {
      const info = await gh(`/repos/${DUENO}/${nombre}`);
      return { repo: `${DUENO}/${nombre}`, url: `https://github.com/${DUENO}/${nombre}`, repoId: info.datos.id };
    }
    await new Promise((res) => setTimeout(res, 2000));
  }
  throw new Error("El repo se creó, pero la rama main no aparece todavía.");
}

/** Último commit de una rama, o null si no existe. */
export async function shaDeRama(repo, rama) {
  const r = await gh(`/repos/${repo}/branches/${encodeURIComponent(rama)}`);
  return r.ok ? r.datos.commit.sha : null;
}

export async function asegurarPR(repo, rama, titulo, cuerpo) {
  const abiertos = await gh(`/repos/${repo}/pulls?state=open&head=${repo.split("/")[0]}:${encodeURIComponent(rama)}`);
  if (abiertos.ok && abiertos.datos?.length) return abiertos.datos[0].number;
  const r = await gh(`/repos/${repo}/pulls`, { method: "POST", body: JSON.stringify({ title: titulo, head: rama, base: "main", body: cuerpo }) });
  if (!r.ok) throw new Error(`GitHub no abrió la propuesta (${r.status}): ${r.datos?.message ?? ""}`);
  return r.datos.number;
}

export async function fusionarPR(repo, numero) {
  const r = await gh(`/repos/${repo}/pulls/${numero}/merge`, { method: "PUT", body: JSON.stringify({ merge_method: "squash" }) });
  if (!r.ok && r.status !== 405) throw new Error(`GitHub no publicó la propuesta (${r.status}): ${r.datos?.message ?? ""}`);
  return r.datos?.sha ?? null;
}

/* ---------------------------------------------------------------- Netlify */

async function nf(ruta, opciones = {}) {
  const r = await fetch(`https://api.netlify.com/api/v1${ruta}`, {
    ...opciones,
    headers: { Authorization: `Bearer ${requerida("NETLIFY_API_TOKEN")}`, ...(opciones.body ? { "Content-Type": "application/json" } : {}) },
  });
  const texto = await r.text();
  return { ok: r.ok, status: r.status, datos: texto ? JSON.parse(texto) : null };
}

/** Crea el sitio en Netlify ligado al repo (publica main y genera vistas previas de las propuestas). */
export async function asegurarSitioNetlify(repo, repoId, nombre, idExistente, hookExistente) {
  if (idExistente) {
    const r = await nf(`/sites/${idExistente}`);
    if (r.ok) return { id: r.datos.id, url: r.datos.ssl_url || r.datos.url, hook: hookExistente ?? (await crearGancho(r.datos.id)) };
  }
  const r = await nf("/sites", {
    method: "POST",
    body: JSON.stringify({
      name: `pv-${nombre}`.slice(0, 63),
      repo: {
        // Sin el id numérico del repo, Netlify no recibe los avisos de GitHub (pushes y propuestas).
        id: repoId,
        provider: "github",
        repo,
        private: true,
        branch: "main",
        cmd: "npm run build",
        dir: "out",
        installation_id: Number(requerida("NETLIFY_GITHUB_INSTALLATION_ID")),
      },
    }),
  });
  if (!r.ok) throw new Error(`Netlify no creó el sitio (${r.status}): ${r.datos?.message ?? JSON.stringify(r.datos)}`);
  return { id: r.datos.id, url: r.datos.ssl_url || r.datos.url, hook: await crearGancho(r.datos.id) };
}

async function crearGancho(siteId) {
  const r = await nf(`/sites/${siteId}/build_hooks`, { method: "POST", body: JSON.stringify({ title: "phot8can-servidor", branch: "main" }) });
  if (!r.ok) throw new Error(`Netlify no creó el gancho de compilación (${r.status}).`);
  return r.datos.url;
}

/**
 * Compila una rama como vista previa (branch deploy). No dependemos de los avisos de
 * propuestas de GitHub: el servidor le pide a Netlify compilar la rama directamente.
 */
export async function compilarRama(siteId, hook, rama) {
  const sitio = await nf(`/sites/${siteId}`);
  const permitidas = new Set([...(sitio.datos?.build_settings?.allowed_branches ?? ["main"]), rama]);
  await nf(`/sites/${siteId}`, { method: "PATCH", body: JSON.stringify({ build_settings: { allowed_branches: [...permitidas] } }) });
  const r = await fetch(`${hook}?trigger_branch=${encodeURIComponent(rama)}&trigger_title=${encodeURIComponent("Vista previa del agente")}`, { method: "POST", body: "{}" });
  if (!r.ok) throw new Error(`Netlify no aceptó compilar la rama (${r.status}).`);
}

/** Compila main (respaldo por si el aviso del push no llega). */
export async function compilarProduccion(hook) {
  await fetch(`${hook}?trigger_title=${encodeURIComponent("Publicación aprobada")}`, { method: "POST", body: "{}" }).catch(() => {});
}

/** Busca la publicación de una propuesta (vista previa) o de producción. */
export async function buscarPublicacion(siteId, { rama, produccion, commit }) {
  const r = await nf(`/sites/${siteId}/deploys?per_page=30`);
  if (!r.ok) return null;
  const candidatos = (r.datos ?? []).filter(
    (x) => (produccion ? x.context === "production" : x.context !== "production" && x.branch === rama) && (!commit || x.commit_ref === commit),
  );
  // Si hay una lista, esa; si no, la más reciente (en proceso o con error).
  const d = candidatos.find((x) => x.state === "ready") ?? candidatos[0];
  if (!d) return null;
  return { estado: d.state, url: d.links?.branch || d.links?.permalink || d.deploy_ssl_url || d.ssl_url, error: d.error_message, commit: d.commit_ref };
}

/* ---------------------------------------------------------------- Agente de Claude */

let _claude;
export const claude = () => (_claude ??= new Anthropic({ apiKey: requerida("ANTHROPIC_API_KEY") }));

const SISTEMA = `Eres el diseñador y desarrollador web de Phot8can, una agencia creativa en México. Construyes "Páginas Vivas": páginas web para negocios locales que venden.

Trabajas sobre el repo de un cliente creado desde la plantilla de Página Viva. Antes de empezar, lee CLAUDE.md del repo: ahí está cómo está hecho y las reglas.

Tu meta: que el dueño del negocio abra la vista previa y sienta que la página es suya, profesional y lista para vender.
- Textos en español de México, cálidos, concretos y en palabras del cliente final. Nada inventado: si falta un dato, omítelo y repórtalo.
- Diseño a la medida de la marca y el rubro, celular primero, rápido y accesible.
- Una página útil por cada servicio.
- Si hay página de referencia, toma su estilo sin copiar textos, imágenes ni marcas.
- Revisa con "npm run revisar" hasta que no haya errores.
- Trabaja solo en la rama que te indiquen, haz commits claros y súbela con git push. Nunca toques main.
Al terminar, responde con un resumen breve en español: qué hiciste, qué datos faltaron y qué debe revisar el equipo.`;

/** Crea el entorno y el agente una sola vez y guarda sus ids en Supabase (ajustes). */
export async function asegurarAgente() {
  const { data } = await admin().from("ajustes").select("valor").eq("clave", "agente").maybeSingle();
  const guardado = data?.valor ?? {};
  const c = claude();

  let environmentId = guardado.environment_id;
  if (!environmentId) {
    const env = await c.beta.environments.create({
      name: "pagina-viva",
      config: { type: "cloud", networking: { type: "limited", allow_package_managers: true, allow_mcp_servers: false } },
    });
    environmentId = env.id;
  }

  const config = {
    name: "Página Viva · constructor",
    model: { id: MODELO_AGENTE, effort: "high" },
    system: SISTEMA,
    tools: [
      {
        type: "agent_toolset_20260401",
        default_config: { enabled: true, permission_policy: { type: "auto" } },
        configs: [
          { name: "web_fetch", enabled: false },
          { name: "web_search", enabled: false },
        ],
      },
    ],
    metadata: { version: VERSION_AGENTE },
  };

  let agentId = guardado.agent_id;
  if (!agentId) {
    const a = await c.beta.agents.create(config);
    agentId = a.id;
  } else if (guardado.version !== VERSION_AGENTE) {
    await c.beta.agents.update(agentId, config);
  }

  if (agentId !== guardado.agent_id || environmentId !== guardado.environment_id || guardado.version !== VERSION_AGENTE) {
    await admin()
      .from("ajustes")
      .upsert({ clave: "agente", valor: { agent_id: agentId, environment_id: environmentId, version: VERSION_AGENTE } });
  }
  return { agentId, environmentId };
}

/** Sube a Anthropic los archivos del brief (logo, fotos, catálogo) para montarlos en la sesión. */
export async function subirArchivosDelBrief(orgId) {
  const { data: filas } = await admin().from("briefing_archivos").select("pregunta, ruta, nombre, tamano_bytes, tipo_mime").eq("organizacion_id", orgId).order("creado");
  const recursos = [];
  const omitidos = [];
  let total = 0;
  for (const f of (filas ?? []).slice(0, 40)) {
    if ((f.tamano_bytes ?? 0) > 30 * 1024 * 1024 || total > 200 * 1024 * 1024) {
      omitidos.push(f.nombre);
      continue;
    }
    const { data: blob, error } = await admin().storage.from("briefing").download(f.ruta);
    if (error || !blob) {
      omitidos.push(f.nombre);
      continue;
    }
    total += f.tamano_bytes ?? 0;
    const limpio = f.nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-");
    const subido = await claude().files.upload({ file: await toFile(blob, limpio, { type: f.tipo_mime || undefined }) });
    recursos.push({ type: "file", file_id: subido.id, mount_path: `/brief/${recursos.length + 1}-${limpio}` });
  }
  return { recursos, omitidos };
}

/** Descarga la página de referencia (solo HTML, sin scripts) para que el agente estudie su estilo. */
export async function referenciaComoArchivo(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (!/^https?:$/.test(u.protocol) || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(u.hostname)) return null;
    const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 (Phot8can referencia)" }, redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (!r.ok || !(r.headers.get("content-type") ?? "").includes("html")) return null;
    const html = (await r.text())
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
      .slice(0, 400_000);
    const subido = await claude().files.upload({ file: await toFile(Buffer.from(html, "utf8"), "referencia.html", { type: "text/html" }) });
    return { type: "file", file_id: subido.id, mount_path: "/brief/referencia.html" };
  } catch {
    return null;
  }
}

/** Arranca la sesión del agente sobre el repo del cliente. */
export async function iniciarSesionAgente({ orgId, repoUrl, rama, mensaje, archivos }) {
  const { agentId, environmentId } = await asegurarAgente();
  const sesion = await claude().beta.sessions.create({
    agent: agentId,
    environment_id: environmentId,
    title: `Página Viva · ${orgId.slice(0, 8)}`,
    metadata: { organizacion_id: orgId, rama },
    budget: { type: "limit", max_list_cost: { amount: String(PRESUPUESTO_CENTAVOS), currency: "USD" } },
    resources: [
      {
        type: "github_repository",
        url: repoUrl,
        authorization_token: requerida("GITHUB_TOKEN_SITIOS"),
        mount_path: "/workspace/sitio",
        checkout: { type: "branch", name: "main" },
      },
      ...archivos,
    ],
    initial_events: [{ type: "user.message", content: [{ type: "text", text: mensaje }] }],
  });
  return sesion;
}

export async function enviarAlAgente(sesionId, texto) {
  await claude().beta.sessions.events.send(sesionId, { events: [{ type: "user.message", content: [{ type: "text", text: texto }] }] });
}

/** Estado de la sesión: corriendo, terminó (con su resumen), esperando permiso o sin presupuesto. */
export async function estadoSesion(sesionId) {
  const c = claude();
  const s = await c.beta.sessions.retrieve(sesionId);
  const costo = s.usage?.list_cost?.amount ? Number(s.usage.list_cost.amount) : null;
  if (s.status === "running" || s.status === "rescheduling") return { fase: "corriendo", costo };

  const pagina = await c.beta.sessions.events.list(sesionId, { order: "desc", limit: 60 });
  const eventos = pagina.data ?? [];
  const idle = eventos.find((e) => e.type === "session.status_idle");
  const motivo = idle?.stop_reason?.type;
  const mensajes = eventos.filter((e) => e.type === "agent.message");
  const resumen = mensajes.length
    ? (mensajes[0].content ?? [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
    : "";
  if (s.status === "terminated") return { fase: "terminada", resumen, costo };
  if (motivo === "requires_action") {
    // Nadie está viendo la sesión: rechaza lo que pidió permiso para que siga sin eso.
    const pendientes = eventos.filter((e) => (e.type === "agent.tool_use" || e.type === "agent.mcp_tool_use") && e.evaluated_permission === "ask");
    const resueltos = new Set(eventos.filter((e) => e.type === "user.tool_confirmation").map((e) => e.tool_use_id));
    const porResolver = pendientes.filter((e) => !resueltos.has(e.id));
    if (porResolver.length)
      await c.beta.sessions.events.send(sesionId, {
        events: porResolver.map((e) => ({ type: "user.tool_confirmation", tool_use_id: e.id, result: "deny", deny_message: "Sin supervisión: sigue sin esta acción." })),
      });
    return { fase: "corriendo", costo };
  }
  if (motivo === "budget_reached") return { fase: "sin_presupuesto", resumen, costo };
  return { fase: "terminada", resumen, costo };
}
