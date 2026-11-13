// Convierte el brief del cliente en el encargo para el agente.

const ETIQUETAS = {
  rubro: "Rubro",
  objetivo: "Objetivo principal de la página",
  informacion: "Información que debe aparecer",
  atencion: "Cómo atiende",
  materiales: "Materiales que tiene",
  colores_ruta: "Colores (tiene logo sin identidad)",
  logo_tipo: "Tipo de logo que prefiere",
  logo_transmite: "Lo que debe transmitir la marca",
  colores: "Colores elegidos",
  precios: "Cómo mostrar precios",
  lista_productos: "Lista de productos o servicios",
  funciones: "Funciones que necesita",
  referencia: "Página de referencia",
  dominio: "¿Tiene dominio?",
  nombre_comercial: "Nombre comercial",
  que_vende: "Qué vende u ofrece",
  otro_rubro: "Rubro (otro)",
  responsable: "Responsable",
  whatsapp: "WhatsApp de contacto del proyecto",
  correo: "Correo del proyecto",
  whatsapp_negocio: "WhatsApp para publicar",
  correo_publico: "Correo para publicar",
  direccion: "Dirección o Google Maps",
  zonas: "Zonas que atiende",
  horarios: "Horarios",
  redes: "Redes sociales",
  logo_nombre: "Nombre exacto del logo",
  enlace_materiales: "Enlace a materiales",
  referencia_url: "Enlace de la página de referencia",
  referencia_gusta: "Lo que le gusta de la referencia",
  atiende_nombre: "Quién atiende las solicitudes",
  atiende_contacto: "Contacto de quien atiende",
  dominio_url: "Dominio actual",
  fecha_publicacion: "Fecha deseada",
  aprobador: "Quién aprueba",
  indispensable: "Algo indispensable",
  notas: "Notas extra que dio el cliente",
};

const valor = (v) => (Array.isArray(v) ? v.join(", ") : String(v ?? "")).trim();

export function encargo({ negocio, respuestas, archivos, omitidos, hayReferencia, rama }) {
  const r = respuestas ?? {};
  const datos = Object.entries(ETIQUETAS)
    .filter(([k]) => valor(r[k]))
    .map(([k, etiqueta]) => `- ${etiqueta}: ${valor(r[k])}`)
    .join("\n");

  const conversacion = (Array.isArray(r._chat) ? r._chat : [])
    .map((x) => {
      try {
        return JSON.parse(x);
      } catch {
        return null;
      }
    })
    .filter((m) => m && m.de === "cliente" && m.texto)
    .map((m) => `- ${m.texto}`)
    .join("\n");

  return `Construye la Página Viva de "${negocio}".

## Brief del cliente
${datos || "(el brief viene casi vacío: haz una página sobria con lo que haya y reporta lo que falta)"}

## Lo que dijo el cliente en el chat (sus palabras)
${conversacion || "(sin conversación)"}

## Archivos del cliente
${
  archivos.length
    ? `Están en /mnt/session/uploads/brief/ (solo lectura):\n${archivos.map((a) => `- ${a.mount_path.replace("/brief/", "")}`).join("\n")}\nCopia a public/img/ los que uses (logo, fotos). Usa el logo si lo hay.`
    : "No subió archivos: usa los recuadros de color de la plantilla donde irían fotos y repórtalo."
}${omitidos.length ? `\nNo se pudieron adjuntar (muy pesados): ${omitidos.join(", ")}.` : ""}
${hayReferencia ? "\n## Página de referencia\nEl HTML (sin scripts) está en /mnt/session/uploads/brief/referencia.html. Estudia su estructura, ritmo, tipografía y paleta para inspirarte; no copies textos, imágenes ni marcas.\n" : ""}
## Cómo entregar
1. El repo está en /workspace/sitio. Lee CLAUDE.md.
2. Crea la rama \`${rama}\` desde main y trabaja solo ahí.
3. Llena contenido/sitio.json y adapta el diseño a la marca.
4. Corre \`npm install\` y \`npm run revisar\` hasta que pase.
5. Haz commit y \`git push -u origin ${rama}\`.
6. Termina con tu resumen (qué hiciste, qué faltó, qué revisar).`;
}
