// API del sitio del cliente para el portal.
//   POST /api/sitio/iniciar   arranca la construcción (crea repo, sitio y sesión del agente en segundo plano)
//   GET  /api/sitio/estado    estado actual; avanza solo: abre la propuesta y busca la vista previa
//   POST /api/sitio/ajustar   { mensaje } pide cambios al agente sobre la misma propuesta
//   POST /api/sitio/aprobar   publica la propuesta en la página real
import { json, usuarioDe } from "../lib/comun.mjs";
import {
  asegurarPR,
  buscarPublicacion,
  cambiarFase,
  enviarAlAgente,
  esStaff,
  estadoSesion,
  shaDeRama,
  fusionarPR,
  guardarSitio,
  leerSitio,
  miembroDe,
} from "../lib/sitios.mjs";

export const config = { path: ["/api/sitio/iniciar", "/api/sitio/estado", "/api/sitio/ajustar", "/api/sitio/aprobar"] };

const publico = (s) =>
  s && {
    estado: s.estado,
    detalle: s.detalle,
    vista_previa_url: s.vista_previa_url,
    produccion_url: s.produccion_url,
    netlify_url: s.netlify_url,
    repo: s.repo,
    pr_numero: s.pr_numero,
    resumen_agente: s.resumen_agente,
    actualizado: s.actualizado,
  };

async function avanzar(orgId, s) {
  if (!s) return s;
  if (s.estado === "construyendo" && s.sesion_id) {
    const e = await estadoSesion(s.sesion_id);
    const costo = e.costo ?? s.costo_centavos_usd;
    if (e.fase === "corriendo") return costo !== s.costo_centavos_usd ? guardarSitio(orgId, { costo_centavos_usd: costo }) : s;
    if (e.fase === "sin_presupuesto")
      return guardarSitio(orgId, { estado: "error", detalle: "El diseñador llegó a su límite de presupuesto. El equipo lo revisa.", costo_centavos_usd: costo, resumen_agente: e.resumen });
    // Terminó: debe haber subido su rama.
    const sha = await shaDeRama(s.repo, s.rama);
    if (!sha)
      return guardarSitio(orgId, { estado: "error", detalle: "El diseñador terminó sin subir la página. El equipo lo revisa.", costo_centavos_usd: costo, resumen_agente: e.resumen });
    const pr = s.pr_numero ?? (await asegurarPR(s.repo, s.rama, "Página Viva · propuesta", e.resumen || "Propuesta generada por el agente de Página Viva."));
    s = await guardarSitio(orgId, { pr_numero: pr, commit_revision: sha, resumen_agente: e.resumen, costo_centavos_usd: costo, estado: "revision", detalle: "Preparando tu vista previa…" });
    await cambiarFase(orgId, "revision");
  }
  if (s.estado === "revision" && s.pr_numero && s.netlify_site_id && !s.vista_previa_url) {
    const p = await buscarPublicacion(s.netlify_site_id, { pr: s.pr_numero, commit: s.commit_revision });
    if (p?.estado === "ready") return guardarSitio(orgId, { vista_previa_url: p.url, detalle: "Tu página está lista para revisar." });
    if (p?.estado === "error") return guardarSitio(orgId, { detalle: `La vista previa no compiló: ${p.error ?? "error de Netlify"}. El equipo lo revisa.` });
  }
  if (s.estado === "publicando" && s.netlify_site_id) {
    const p = await buscarPublicacion(s.netlify_site_id, { produccion: true, commit: s.commit_publicado });
    if (p?.estado === "ready") {
      await cambiarFase(orgId, "en_linea");
      return guardarSitio(orgId, { estado: "en_linea", produccion_url: s.netlify_url, detalle: "¡Tu página está en línea!" });
    }
    if (p?.estado === "error") return guardarSitio(orgId, { detalle: `La publicación falló: ${p.error ?? "error de Netlify"}. El equipo lo revisa.` });
  }
  return s;
}

const manejar = async (req) => {
  const usuario = await usuarioDe(req);
  if (!usuario) return json({ error: "Inicia sesión." }, 401);
  const accion = new URL(req.url).pathname.split("/").pop();
  const cuerpo = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const miembro = await miembroDe(usuario.id);
  const staff = await esStaff(usuario.id);
  const orgId = miembro?.organizacion_id ?? (staff ? (cuerpo.organizacion_id ?? new URL(req.url).searchParams.get("organizacion_id")) : null);
  if (!orgId) return json({ error: "No encontramos tu negocio." }, 404);

  try {
    let s = await leerSitio(orgId);

    if (accion === "iniciar") {
      if (s && ["preparando", "construyendo", "publicando"].includes(s.estado)) return json({ sitio: publico(s) });
      s = await guardarSitio(orgId, { estado: "preparando", detalle: "Arrancando…", sesion_id: null, vista_previa_url: null });
      // La función de fondo hace lo lento (crear repo, sitio, subir archivos, arrancar al agente).
      const base = process.env.URL ?? new URL(req.url).origin;
      await fetch(`${base}/.netlify/functions/sitio-construir-background`, {
        method: "POST",
        headers: { Authorization: req.headers.get("authorization"), "Content-Type": "application/json" },
        body: JSON.stringify({ organizacion_id: orgId }),
      });
      return json({ sitio: publico(s) }, 202);
    }

    if (accion === "estado") return json({ sitio: publico(await avanzar(orgId, s)) });

    if (accion === "ajustar") {
      const mensaje = String(cuerpo.mensaje ?? "").trim().slice(0, 4000);
      if (!mensaje) return json({ error: "Escribe qué quieres cambiar." }, 400);
      if (!s?.sesion_id || s.estado !== "revision") return json({ error: "Tu página no está en revisión." }, 409);
      await enviarAlAgente(
        s.sesion_id,
        `El cliente revisó la vista previa y pide estos cambios:\n\n${mensaje}\n\nHazlos en la misma rama (${s.rama}), revisa con npm run revisar, haz commit y push. Termina con un resumen corto.`,
      );
      s = await guardarSitio(orgId, { estado: "construyendo", vista_previa_url: null, detalle: "Aplicando tus cambios…" });
      return json({ sitio: publico(s) });
    }

    if (accion === "aprobar") {
      if (miembro && miembro.rol !== "dueno" && !staff) return json({ error: "Solo el dueño puede publicar." }, 403);
      if (!s?.pr_numero || s.estado !== "revision" || !s.vista_previa_url) return json({ error: "Todavía no hay una vista previa lista." }, 409);
      const sha = await fusionarPR(s.repo, s.pr_numero);
      s = await guardarSitio(orgId, { estado: "publicando", commit_publicado: sha, detalle: "Publicando tu página…" });
      return json({ sitio: publico(s) });
    }

    return json({ error: "Acción desconocida." }, 404);
  } catch (e) {
    console.error(`Error en /api/sitio/${accion}:`, e);
    return json({ error: "Algo falló de nuestro lado. Intenta de nuevo en un momento." }, 500);
  }
};

export default manejar;
