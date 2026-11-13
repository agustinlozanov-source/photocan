// Briefing de Página Viva. VERSIÓN PRELIMINAR: se reemplaza por el briefing completo
// que mande el equipo. Para agregar o quitar preguntas basta con editar este arreglo.

export type Campo =
  | { id: string; tipo: "texto" | "url" | "telefono" | "correo"; etiqueta: string; ayuda?: string; ejemplo?: string; obligatorio?: boolean }
  | { id: string; tipo: "area"; etiqueta: string; ayuda?: string; ejemplo?: string; obligatorio?: boolean }
  | { id: string; tipo: "opciones" | "multiple"; etiqueta: string; ayuda?: string; opciones: string[]; obligatorio?: boolean }
  | { id: string; tipo: "archivo"; etiqueta: string; ayuda?: string; acepta?: string; obligatorio?: boolean }
  | { id: string; tipo: "servicios"; etiqueta: string; ayuda?: string; obligatorio?: boolean };

export type Seccion = { id: string; titulo: string; intro: string; minutos: number; campos: Campo[] };

export const secciones: Seccion[] = [
  {
    id: "negocio",
    titulo: "Tu negocio",
    intro: "Lo básico: quién eres y qué haces. Con esto escribimos los textos de tu página.",
    minutos: 4,
    campos: [
      { id: "nombre", tipo: "texto", etiqueta: "Nombre de tu negocio", ejemplo: "Clínica Dental Sonrisa", obligatorio: true },
      {
        id: "giro",
        tipo: "opciones",
        etiqueta: "Giro",
        opciones: ["Salud", "Belleza y bienestar", "Restaurante o comida", "Servicios profesionales", "Tienda", "Educación", "Inmobiliaria", "Construcción e industria", "Otro"],
        obligatorio: true,
      },
      { id: "dedica", tipo: "area", etiqueta: "¿A qué se dedica tu negocio?", ayuda: "Cuéntalo como se lo dirías a un cliente nuevo.", obligatorio: true },
      { id: "diferente", tipo: "area", etiqueta: "¿Qué te hace diferente de la competencia?", ejemplo: "Atendemos el mismo día, tenemos estacionamiento, 15 años de experiencia…" },
      { id: "desde", tipo: "texto", etiqueta: "¿Desde cuándo existe?", ejemplo: "2011" },
      {
        id: "local",
        tipo: "opciones",
        etiqueta: "¿Cómo atiendes?",
        opciones: ["Tengo local físico", "Voy a domicilio", "Solo en línea", "Local y a domicilio"],
        obligatorio: true,
      },
    ],
  },
  {
    id: "contacto",
    titulo: "Contacto y ubicación",
    intro: "Cómo te encuentran y te escriben. Estos datos aparecen en tu página y en Google Maps.",
    minutos: 3,
    campos: [
      { id: "whatsapp", tipo: "telefono", etiqueta: "WhatsApp del negocio", ejemplo: "868 123 4567", obligatorio: true },
      { id: "telefono", tipo: "telefono", etiqueta: "Teléfono fijo (si tienes)" },
      { id: "correo", tipo: "correo", etiqueta: "Correo de contacto", ejemplo: "hola@tunegocio.mx", obligatorio: true },
      { id: "direccion", tipo: "area", etiqueta: "Dirección", ayuda: "Calle, número, colonia, ciudad y código postal." },
      { id: "zona", tipo: "texto", etiqueta: "Zona o ciudades que atiendes", ejemplo: "Matamoros y Brownsville" },
      { id: "horarios", tipo: "area", etiqueta: "Horarios", ejemplo: "Lunes a viernes 9 a 7, sábado 9 a 2" },
    ],
  },
  {
    id: "servicios",
    titulo: "Servicios y precios",
    intro: "Cada servicio puede tener su propia página. Así te encuentran en Google por cada cosa que haces.",
    minutos: 6,
    campos: [
      { id: "lista", tipo: "servicios", etiqueta: "Tus servicios o productos", ayuda: "Agrega todos. Si un precio varía, escribe “desde”.", obligatorio: true },
      { id: "estrella", tipo: "texto", etiqueta: "¿Cuál es el que más quieres vender?", obligatorio: true },
      { id: "promos", tipo: "area", etiqueta: "Promociones vigentes", ejemplo: "Limpieza + blanqueamiento a $1,990 hasta diciembre" },
      { id: "pagos", tipo: "multiple", etiqueta: "¿Qué formas de pago aceptas?", opciones: ["Efectivo", "Tarjeta", "Transferencia", "Meses sin intereses", "Pago en línea"] },
    ],
  },
  {
    id: "cliente",
    titulo: "Tu cliente",
    intro: "Escribimos para la persona que te compra, con sus palabras.",
    minutos: 4,
    campos: [
      { id: "ideal", tipo: "area", etiqueta: "¿Quién es tu cliente ideal?", ejemplo: "Mamás de 30 a 45 años que buscan ortodoncia para sus hijos…", obligatorio: true },
      { id: "preguntas", tipo: "area", etiqueta: "¿Qué te preguntan siempre?", ayuda: "Una por línea. Se vuelven tus preguntas frecuentes.", obligatorio: true },
      { id: "eligen", tipo: "area", etiqueta: "¿Por qué te eligen tus clientes?" },
      { id: "competencia", tipo: "area", etiqueta: "Tu competencia", ayuda: "Nombres o páginas de 2 o 3 negocios como el tuyo." },
    ],
  },
  {
    id: "identidad",
    titulo: "Identidad",
    intro: "Tu logo, tus colores y tu estilo. Si no tienes, te ayudamos a crearlos.",
    minutos: 3,
    campos: [
      { id: "logo", tipo: "opciones", etiqueta: "¿Tienes logo?", opciones: ["Sí, tengo logo", "Tengo, pero quiero renovarlo", "No, necesito uno"], obligatorio: true },
      { id: "logoArchivo", tipo: "archivo", etiqueta: "Sube tu logo", ayuda: "De preferencia PNG, SVG o PDF en buena calidad.", acepta: "image/*,.pdf,.svg,.ai,.eps" },
      { id: "manual", tipo: "archivo", etiqueta: "Manual de identidad (si tienes)", acepta: ".pdf,image/*" },
      { id: "colores", tipo: "texto", etiqueta: "Tus colores", ejemplo: "Azul marino y blanco" },
      {
        id: "estilo",
        tipo: "multiple",
        etiqueta: "¿Cómo quieres que se sienta tu página?",
        opciones: ["Moderna", "Elegante", "Cercana", "Divertida", "Minimalista", "Tradicional", "Tecnológica", "Natural"],
      },
    ],
  },
  {
    id: "presencia",
    titulo: "Redes y presencia",
    intro: "Conectamos tu página con tus redes y revisamos lo que ya existe de ti en internet.",
    minutos: 3,
    campos: [
      { id: "facebook", tipo: "url", etiqueta: "Página de Facebook", ejemplo: "facebook.com/tunegocio" },
      { id: "instagram", tipo: "url", etiqueta: "Instagram", ejemplo: "@tunegocio" },
      { id: "tiktok", tipo: "url", etiqueta: "TikTok" },
      { id: "maps", tipo: "url", etiqueta: "Perfil de Google Maps" },
      { id: "web", tipo: "url", etiqueta: "Página actual (si tienes)" },
      {
        id: "accesos",
        tipo: "area",
        etiqueta: "¿Quién tiene los accesos de tu página o dominio actual?",
        ayuda: "Aunque no lo sepas, dinos quién la hizo. Nosotros lo rastreamos.",
      },
    ],
  },
  {
    id: "material",
    titulo: "Fotos y video",
    intro: "Las fotos reales venden más que las de banco. Sube lo que tengas, aunque sea del celular.",
    minutos: 3,
    campos: [
      { id: "fotos", tipo: "archivo", etiqueta: "Fotos de tu negocio, equipo y trabajos", acepta: "image/*" },
      { id: "videos", tipo: "archivo", etiqueta: "Videos", acepta: "video/*" },
      {
        id: "sesion",
        tipo: "opciones",
        etiqueta: "¿Necesitas sesión de fotos o video?",
        opciones: ["No, tengo suficiente material", "Sí, sesión de fotos", "Sí, fotos y video", "No sé, recomiéndenme"],
      },
    ],
  },
  {
    id: "pagina",
    titulo: "Tu página",
    intro: "Qué quieres que haga tu página por ti.",
    minutos: 4,
    campos: [
      {
        id: "objetivo",
        tipo: "opciones",
        etiqueta: "Lo más importante es que la gente…",
        opciones: ["Me escriba por WhatsApp", "Agende una cita", "Compre en línea", "Pida una cotización", "Me llame", "Visite mi local"],
        obligatorio: true,
      },
      {
        id: "paginas",
        tipo: "multiple",
        etiqueta: "Páginas que imaginas",
        opciones: ["Inicio", "Una página por servicio", "Nosotros", "Galería", "Preguntas frecuentes", "Blog", "Contacto", "Tienda", "Citas"],
      },
      { id: "gustan", tipo: "area", etiqueta: "Páginas que te gustan", ayuda: "Pega enlaces y dinos qué te gusta de cada una." },
      { id: "no", tipo: "area", etiqueta: "¿Algo que NO quieras?" },
      { id: "idioma", tipo: "opciones", etiqueta: "Idioma", opciones: ["Solo español", "Español e inglés"] },
    ],
  },
  {
    id: "legal",
    titulo: "Datos legales",
    intro: "Para tu aviso de privacidad, tus términos y tu facturación. Se guardan cifrados.",
    minutos: 3,
    campos: [
      { id: "razon", tipo: "texto", etiqueta: "Razón social o nombre del responsable", obligatorio: true },
      { id: "rfc", tipo: "texto", etiqueta: "RFC" },
      { id: "domicilioFiscal", tipo: "area", etiqueta: "Domicilio fiscal" },
      { id: "correoFacturas", tipo: "correo", etiqueta: "Correo para facturas" },
      {
        id: "datos",
        tipo: "multiple",
        etiqueta: "¿Qué datos pedirá tu página a tus clientes?",
        ayuda: "Con esto hacemos tu aviso de privacidad conforme a la ley.",
        opciones: ["Nombre", "Teléfono o WhatsApp", "Correo", "Dirección", "Datos de salud", "Datos de pago", "Ninguno"],
      },
    ],
  },
];

export const totalCampos = secciones.reduce((n, s) => n + s.campos.length, 0);

export function respondido(v: unknown) {
  if (Array.isArray(v))
    return v.some((x) => {
      if (!x.startsWith("{")) return x.trim().length > 0;
      try {
        return Boolean(JSON.parse(x).n?.trim());
      } catch {
        return false;
      }
    });
  return typeof v === "string" && v.trim().length > 0;
}

export function avanceBriefing(respuestas: Record<string, unknown>, archivos: Record<string, string[]>) {
  let n = 0;
  for (const s of secciones)
    for (const c of s.campos) {
      const k = `${s.id}.${c.id}`;
      if (c.tipo === "archivo" ? (archivos[k]?.length ?? 0) > 0 : respondido(respuestas[k])) n++;
    }
  return Math.round((n / totalCampos) * 100);
}

export function avanceSeccion(s: Seccion, respuestas: Record<string, unknown>, archivos: Record<string, string[]>) {
  const n = s.campos.filter((c) => {
    const k = `${s.id}.${c.id}`;
    return c.tipo === "archivo" ? (archivos[k]?.length ?? 0) > 0 : respondido(respuestas[k]);
  }).length;
  return { n, total: s.campos.length, faltanObligatorios: s.campos.filter((c) => c.obligatorio && !respondido(respuestas[`${s.id}.${c.id}`])).length };
}
