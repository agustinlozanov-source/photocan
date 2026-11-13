// Función de fondo (hasta 15 min): crea el repo y el sitio del cliente y arranca al agente.
// La llama /api/sitio/iniciar con el mismo token del usuario.
import { usuarioDe } from "../lib/comun.mjs";
import { encargo } from "../lib/mensaje-agente.mjs";
import {
  admin,
  asegurarRepo,
  asegurarSitioNetlify,
  cambiarFase,
  esStaff,
  guardarSitio,
  iniciarSesionAgente,
  leerSitio,
  miembroDe,
  nombreRepo,
  referenciaComoArchivo,
  subirArchivosDelBrief,
} from "../lib/sitios.mjs";

const manejar = async (req) => {
  const usuario = await usuarioDe(req);
  if (!usuario) return;
  const { organizacion_id: pedida } = await req.json().catch(() => ({}));
  const miembro = await miembroDe(usuario.id);
  const orgId = miembro?.organizacion_id ?? ((await esStaff(usuario.id)) ? pedida : null);
  if (!orgId) return;

  try {
    const { data: org } = await admin().from("organizaciones").select("nombre").eq("id", orgId).single();
    const { data: brief } = await admin().from("briefings").select("respuestas").eq("organizacion_id", orgId).maybeSingle();
    const respuestas = brief?.respuestas ?? {};
    const negocio = (typeof respuestas.nombre_comercial === "string" && respuestas.nombre_comercial) || org.nombre;
    const previo = await leerSitio(orgId);

    await guardarSitio(orgId, { estado: "preparando", detalle: "Creando tu repositorio y tu sitio…" });
    const nombre = previo?.repo?.split("/")[1] ?? nombreRepo(negocio, orgId);
    const { repo, url, repoId } = await asegurarRepo(nombre);
    const netlify = await asegurarSitioNetlify(repo, repoId, nombre, previo?.netlify_site_id, previo?.netlify_hook);
    await guardarSitio(orgId, { repo, netlify_site_id: netlify.id, netlify_url: netlify.url, netlify_hook: netlify.hook, detalle: "Preparando tus archivos para el diseñador…" });

    const { recursos, omitidos } = await subirArchivosDelBrief(orgId);
    const ref = typeof respuestas.referencia_url === "string" && respuestas.referencia_url ? await referenciaComoArchivo(respuestas.referencia_url.split(/\s+/)[0]) : null;
    const archivos = ref ? [...recursos, ref] : recursos;
    const rama = `pagina-viva-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36).slice(-4)}`;

    const sesion = await iniciarSesionAgente({
      orgId,
      repoUrl: url,
      rama,
      archivos,
      mensaje: encargo({ negocio, respuestas, archivos: recursos, omitidos, hayReferencia: Boolean(ref), rama }),
    });

    await guardarSitio(orgId, {
      estado: "construyendo",
      sesion_id: sesion.id,
      rama,
      pr_numero: null,
      vista_previa_url: null,
      detalle: "Nuestro diseñador con IA está armando tu página.",
    });
    await cambiarFase(orgId, "diseno");
    console.log("Sesión del agente creada", sesion.id, "para", orgId);
  } catch (e) {
    console.error("No se pudo arrancar la construcción:", e);
    await guardarSitio(orgId, { estado: "error", detalle: String(e.message ?? e).slice(0, 500) }).catch(() => {});
  }
};

export default manejar;
