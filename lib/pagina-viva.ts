// Contenido de /pagina-viva. Todo lo que dice la página se edita aquí.
// Los precios en `null` se muestran como "Por definir" hasta que se capturen.

export const PRECIO_BASE = 17000;

export const mxn = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

/**
 * Precios por fecha (hora del centro de México, UTC−6). Se usa la primera etapa vigente;
 * cuando todas vencen, rige PRECIO_BASE. Para una nueva campaña, agrega una etapa aquí.
 */
export const etapas = [
  {
    nombre: "Buen Fin",
    codigo: "BUENFIN",
    precio: 11900,
    hasta: "2026-11-17T23:59:59-06:00",
    vigencia: "Del 13 al 17 de noviembre.",
  },
  {
    nombre: "Precio de lanzamiento",
    codigo: "PAGINAVIVA",
    precio: 14450,
    hasta: "2026-12-11T23:59:59-06:00",
    vigencia: "Hasta el 11 de diciembre.",
  },
];

export type Etapa = (typeof etapas)[number];

/** Índice de la etapa vigente, o -1 si ya rige el precio regular. */
export function indiceEtapa(ahora: number) {
  return etapas.findIndex((e) => ahora <= Date.parse(e.hasta));
}

/** Normaliza lo que teclea el cliente: sin espacios, acentos ni mayúsculas/minúsculas. */
export const normalizarCodigo = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/gi, "").toUpperCase();

/** Valida un código contra la etapa vigente. Un código de una etapa vencida ya no aplica. */
export function validarCodigo(texto: string, ahora: number): { ok: true; etapa: Etapa } | { ok: false; motivo: string } {
  const c = normalizarCodigo(texto);
  if (!c) return { ok: false, motivo: "Escribe un código." };
  const i = indiceEtapa(ahora);
  const vigente = i >= 0 ? etapas[i] : null;
  if (vigente && normalizarCodigo(vigente.codigo) === c) return { ok: true, etapa: vigente };
  const j = etapas.findIndex((e) => normalizarCodigo(e.codigo) === c);
  if (j >= 0 && (i < 0 || j < i)) return { ok: false, motivo: "Ese código ya no está vigente." };
  if (j >= 0) return { ok: false, motivo: "Ese código todavía no está activo." };
  return { ok: false, motivo: "Ese código no existe." };
}

/** Texto completo de vigencia: "Del 13 al 17 de noviembre. Después, $14,450 hasta el 11 de diciembre." */
export function textoVigencia(i: number) {
  if (i < 0) return "";
  const sig = etapas[i + 1];
  return sig ? `${etapas[i].vigencia} Después, ${mxn(sig.precio)} ${sig.vigencia.replace(/^Hasta/, "hasta").replace(/\.$/, "")}.` : etapas[i].vigencia;
}

export const hero = {
  etiqueta: "Página Viva · por Phot8can",
  titulo: "No vendemos paquetes. Interpretamos tu negocio.",
  texto:
    "Una página web pensada de principio a fin para lo que vendes: conectada, medida, bien indexada y en regla. Hecha para traerte clientes, no solo para verse bonita.",
};

export const contraste = {
  ellos: [
    "Paquete básico, estándar o premium",
    "Eliges 4 o 5 secciones de una lista",
    "Una sola página para todo",
    "Una plantilla con tu logo encima",
    "Se entrega y se olvida",
  ],
  nosotros: [
    "Un solo precio, con todo lo importante incluido",
    "Interpretamos tu negocio de principio a fin",
    "Una página por cada servicio que vendes",
    "Tu identidad, tus fotos y tu video reales",
    "Viva: se mide, se actualiza y te reporta",
  ],
};

/** Lo técnico que va conectado desde el primer día. */
export const sistema = [
  { nombre: "Pixel de Meta", detalle: "Facebook e Instagram miden quién llega y quién te escribe." },
  { nombre: "Pixel de TikTok", detalle: "Tus campañas en TikTok saben qué funcionó." },
  { nombre: "Google Analytics 4", detalle: "Visitas, origen y cada clic importante, medido." },
  { nombre: "Google Ads", detalle: "Cuenta clara y conversiones listas para tus campañas." },
  { nombre: "Search Console", detalle: "Google conoce cada página y la indexa bien." },
  { nombre: "Perfil de Google", detalle: "Apareces en Maps con horarios, fotos y reseñas." },
  { nombre: "WhatsApp y CRM", detalle: "Cada contacto llega ordenado y no se pierde." },
  { nombre: "Agente 24/7", detalle: "Contesta, cotiza y agenda aunque estés dormido." },
  { nombre: "Velocidad", detalle: "Carga rápido en celular, que es donde te buscan." },
  { nombre: "Aviso de privacidad", detalle: "Hecho a tu medida y conforme a la ley." },
];

/** Ejemplo para explicar el volumen de páginas. */
export const volumen = {
  negocio: "Clínica dental",
  paginas: [
    { ruta: "/", nombre: "Inicio", nivel: 0 },
    { ruta: "/servicios", nombre: "Servicios", nivel: 0 },
    { ruta: "/servicios/limpieza-dental", nombre: "Limpieza dental", nivel: 1 },
    { ruta: "/servicios/ortodoncia", nombre: "Ortodoncia", nivel: 1, campana: true },
    { ruta: "/servicios/blanqueamiento", nombre: "Blanqueamiento", nivel: 1 },
    { ruta: "/servicios/implantes", nombre: "Implantes", nivel: 1 },
    { ruta: "/soy-candidato", nombre: "¿Soy candidato?", nivel: 0 },
    { ruta: "/preguntas", nombre: "Preguntas frecuentes", nivel: 0 },
    { ruta: "/ubicacion", nombre: "Ubicación y horarios", nivel: 0 },
    { ruta: "/aviso-de-privacidad", nombre: "Aviso de privacidad", nivel: 0 },
  ],
  razones: [
    { titulo: "Más páginas, más Google", texto: "Cada servicio con su página es una puerta más para que te encuentren." },
    { titulo: "Campañas que caen donde deben", texto: "Quien busca ortodoncia llega a ortodoncia, no a tu página de inicio." },
    { titulo: "Lista para crecer", texto: "Cada página se puede personalizar o promover por separado." },
  ],
};

// Íconos disponibles: ver components/pv/Icono.tsx
export type IconoNombre =
  | "estrategia" | "diseno" | "paginas" | "medicion" | "google" | "chat" | "legal" | "viva"
  | "tienda" | "pos" | "admin" | "citas" | "reservas" | "idioma" | "mas" | "camara" | "video" | "marca" | "cohete" | "cuidado";

// TODO: completar con la lista oficial de funciones conforme llegue.
export const incluido: { categoria: string; icono: IconoNombre; items: string[] }[] = [
  {
    categoria: "Estrategia",
    icono: "estrategia",
    items: [
      "Junta de arranque para entender tu negocio",
      "Mapa de páginas según cómo vendes",
      "Textos en palabras de tu cliente",
      "Botón principal según tu giro",
      "Análisis de tu competencia",
    ],
  },
  {
    categoria: "Diseño",
    icono: "diseno",
    items: [
      "Diseño a tu medida, sin plantillas",
      "Primero celular, carga rápida",
      "Tu identidad aplicada en todo",
      "Animaciones que atrapan sin trabar",
      "Iconografía propia",
    ],
  },
  {
    categoria: "Páginas",
    icono: "paginas",
    items: [
      "Las 11 secciones que convierten",
      "Una página por servicio, hasta 10",
      "Herramienta interactiva de tu giro",
      "Preguntas frecuentes",
      "Ubicación, mapa y horarios",
      "Página de gracias para medir conversiones",
    ],
  },
  {
    categoria: "Medición",
    icono: "medicion",
    items: [
      "Pixel de Meta (Facebook e Instagram)",
      "Pixel de TikTok",
      "Google Analytics 4",
      "Conversiones de Google Ads",
      "Cada botón medido",
      "Origen de cada cliente",
    ],
  },
  {
    categoria: "Google",
    icono: "google",
    items: [
      "Alta en Search Console",
      "Mapa del sitio e indexación",
      "Datos estructurados para buscadores",
      "Títulos y descripciones por página",
      "Perfil de Google en Maps",
    ],
  },
  {
    categoria: "Atención 24/7",
    icono: "chat",
    items: [
      "Agente que contesta, cotiza y agenda",
      "WhatsApp en cada página",
      "Formulario conectado al CRM",
      "Aviso inmediato de cada contacto",
    ],
  },
  {
    categoria: "Legal",
    icono: "legal",
    items: [
      "Aviso de privacidad conforme a la ley",
      "Consentimiento de cookies",
      "Términos y políticas",
      "Certificado de seguridad (HTTPS)",
    ],
  },
  {
    categoria: "Siempre viva",
    icono: "viva",
    items: [
      "Panel para editar desde tu celular",
      "Reporte mensual de resultados",
      "3 actualizaciones de temporada al año",
      "Respaldos automáticos",
      "Entrega en 10 días hábiles",
    ],
  },
];

export const totalIncluido = incluido.reduce((n, c) => n + c.items.length, 0);

// TODO: capturar el precio fijo de cada módulo (null = "Por definir").
export const modulos: {
  id: string;
  nombre: string;
  icono: IconoNombre;
  resumen: string;
  que: string;
  para: string;
  impacto: string;
  precio: number | null;
}[] = [
  {
    id: "tienda",
    nombre: "Tienda en línea con cobro y facturación",
    icono: "tienda",
    resumen: "Vende en línea y factura sin hacer nada a mano.",
    que: "Catálogo, carrito y cobro con tarjeta, transferencia o meses sin intereses, con factura automática.",
    para: "Para negocios que quieren vender productos o servicios las 24 horas, sin depender de un vendedor.",
    impacto: "Tu página deja de solo informar y empieza a cobrar. Cada venta llega pagada y facturada.",
    precio: null,
  },
  {
    id: "pos",
    nombre: "Punto de venta",
    icono: "pos",
    resumen: "Tu mostrador y tu tienda en línea, con un solo inventario.",
    que: "Sistema para cobrar en tu local conectado al mismo inventario y a las mismas ventas de tu tienda en línea.",
    para: "Para negocios con local físico que también venden en línea.",
    impacto: "Se acaban los inventarios descuadrados y las ventas que no sabes de dónde salieron.",
    precio: null,
  },
  {
    id: "admin",
    nombre: "Súper administrador",
    icono: "admin",
    resumen: "Todo tu negocio en un solo tablero.",
    que: "Panel con ventas, inventario, usuarios, permisos y reportes de tu tienda y tu punto de venta.",
    para: "Para dueños que quieren controlar su operación desde el celular, estén donde estén.",
    impacto: "Decides con números reales, no con corazonadas.",
    precio: null,
  },
  {
    id: "citas",
    nombre: "Citas en línea",
    icono: "citas",
    resumen: "Tu cliente elige día y hora sin llamarte.",
    que: "Agenda conectada a tu calendario, con recordatorios por WhatsApp y correo.",
    para: "Para consultorios, estéticas, talleres y cualquier negocio que trabaja con citas.",
    impacto: "Menos llamadas, menos faltas y tu agenda llena aunque estés ocupado.",
    precio: null,
  },
  {
    id: "reservas",
    nombre: "Reservaciones con pago",
    icono: "reservas",
    resumen: "Aparta con anticipo y deja de perder fechas.",
    que: "Reservaciones con cobro de anticipo en línea y confirmación automática.",
    para: "Para eventos, salones, hospedaje, tours y restaurantes.",
    impacto: "Quien aparta, paga. Se acaban las reservas fantasma.",
    precio: null,
  },
  {
    id: "ingles",
    nombre: "Versión en inglés",
    icono: "idioma",
    resumen: "Tu página y tu agente, también en inglés.",
    que: "Textos traducidos y revisados por una persona, y el agente 24/7 respondiendo en inglés.",
    para: "Para negocios con clientes extranjeros o en zonas turísticas y fronterizas.",
    impacto: "Le vendes a un mercado que tu competencia ni ve.",
    precio: null,
  },
  {
    id: "paginas",
    nombre: "Más páginas",
    icono: "mas",
    resumen: "Para quien vende más de 10 servicios.",
    que: "Páginas adicionales con el mismo cuidado: textos, fotos, medición e indexación.",
    para: "Para negocios con un catálogo amplio de servicios o sucursales.",
    impacto: "Más puertas de entrada en Google y campañas más precisas.",
    precio: null,
  },
  {
    id: "fotos",
    nombre: "Sesión de fotos",
    icono: "camara",
    resumen: "Fotos reales de tu negocio, hechas por Phot8can.",
    que: "Sesión profesional de tu lugar, tu equipo, tus productos y tu servicio en acción.",
    para: "Para quien no tiene fotos o tiene fotos que no le hacen justicia.",
    impacto: "La gente confía en lo que ve. Fotos reales venden más que cualquier banco de imágenes.",
    precio: null,
  },
  {
    id: "video",
    nombre: "Video",
    icono: "video",
    resumen: "Un video que cuenta tu negocio en segundos.",
    que: "Video para el inicio de tu página, tus redes y tus anuncios.",
    para: "Para negocios que quieren destacar en redes y en su página.",
    impacto: "El video retiene más tiempo y explica en segundos lo que un texto tarda minutos.",
    precio: null,
  },
  {
    id: "marca",
    nombre: "Logo e identidad",
    icono: "marca",
    resumen: "Si aún no tienes marca, la creamos contigo.",
    que: "Logotipo, paleta de color, tipografía y un manual para usarlos bien.",
    para: "Para negocios nuevos o marcas que ya no los representan.",
    impacto: "Una marca clara se recuerda, se reconoce y se recomienda.",
    precio: null,
  },
  {
    id: "lanzamiento",
    nombre: "Campaña de lanzamiento",
    icono: "cohete",
    resumen: "Anuncios para que tu página arranque con clientes.",
    que: "Campaña en Meta y Google configurada, con anuncios diseñados y medición desde el día uno.",
    para: "Para quien quiere resultados desde la primera semana.",
    impacto: "Tu página no espera a que la encuentren: sale a buscar clientes.",
    precio: null,
  },
  {
    id: "cuidado",
    nombre: "Plan de cuidado mensual",
    icono: "cuidado",
    resumen: "Cambios, contenido y mejoras cada mes.",
    que: "Ajustes ilimitados de contenido, nuevas promociones y optimización según el reporte mensual.",
    para: "Para quien no quiere preocuparse por su página nunca más.",
    impacto: "Tu página mejora cada mes en vez de envejecer.",
    precio: null,
  },
];

/** Formas de pago. TODO: conectar el cobro con tarjeta (Stripe) y la nota de IVA. */
export const pagos = {
  notaPrecio: "MXN", // p. ej. "MXN más IVA"
  meses: [3, 6, 9, 12],
  vigenciaDias: 7,
};

export const legal = [
  {
    titulo: "Aviso de privacidad real",
    texto:
      "Si tu página pide datos, lleva un aviso de privacidad hecho para tu negocio conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.",
  },
  { titulo: "Consentimiento de cookies", texto: "Los pixeles y la analítica se activan con el permiso de tu visitante." },
  { titulo: "Términos y políticas", texto: "Políticas de compra, envío, cancelación o reembolso, según lo que vendas." },
  { titulo: "Información verdadera", texto: "Precios, horarios y servicios reales. Lo que dice tu página es lo que pasa." },
];

/** Ejemplo ilustrativo del reporte mensual (no son datos de un cliente). */
export const reporte = [
  { dato: "Visitas", valor: "1,240" },
  { dato: "Clics a WhatsApp", valor: "86" },
  { dato: "Formularios", valor: "31" },
  { dato: "Citas agendadas", valor: "23" },
];

export const preguntas = [
  {
    p: "¿Por qué un solo precio?",
    r: "Porque todo negocio necesita lo mismo para vender en línea: estar bien conectado, medido, indexado y en regla. Eso no debería ser un paquete premium.",
  },
  {
    p: "¿En cuánto tiempo está lista?",
    r: "En 10 días hábiles desde que tenemos tu material completo: logo, servicios con precio, preguntas frecuentes, fotos y datos de contacto.",
  },
  {
    p: "¿Puedo agregar módulos después?",
    r: "Sí. Cada módulo tiene un precio fijo y se suma a tu proyecto cuando lo necesites: tienda, punto de venta, citas, reservaciones y más.",
  },
  {
    p: "¿Qué pasa si no tengo fotos ni logo?",
    r: "Los hacemos. Phot8can es una agencia creativa: la sesión de fotos, el video y la identidad se suman como módulos.",
  },
  {
    p: "¿Quién paga el dominio y el hospedaje?",
    r: "Tú, directo en nuestro portal, para que siempre sean tuyos.",
  },
];

/**
 * Reels de campaña. Cierran con el precio de Buen Fin y "Comenta PÁGINA",
 * así que solo se muestran hasta `reelsHasta`. Con reels sin precio, cambia esa fecha.
 */
export const reelsHasta = "2026-11-17T23:59:59-06:00";

export const reels = [
  {
    id: "dolor-nocturno",
    dolor: "Son las 11 de la noche. Te escriben y nadie contesta.",
    resuelve: "Tu página contesta por ti.",
    audio: false,
  },
  {
    id: "cinco-dias",
    dolor: "14 mensajes sin contestar. Ese paciente agendó en otro lado.",
    resuelve: "Tu página agenda mientras duermes.",
    audio: true,
  },
  {
    id: "como-funciona",
    dolor: "¿Y qué tiene por dentro?",
    resuelve: "Herramienta de tu giro, agente 24/7, CRM y reporte mensual.",
    audio: false,
  },
];

/**
 * Portafolio de páginas. Mientras esté vacío se muestran tarjetas de relleno.
 * `captura`: imagen en /public/portafolio/ (vista de escritorio, 16:10 aprox.).
 */
export const portafolio: { cliente: string; giro: string; url: string; captura?: string }[] = [
  { cliente: "Avalluo", giro: "Avalúos industriales", url: "https://avalluo.com", captura: "/portafolio/avalluo.webp" },
  { cliente: "Flow Hub CRM", giro: "Software con IA para ventas", url: "https://landing.flowhubcrm.app", captura: "/portafolio/flowhub.webp" },
  { cliente: "Tino Lozano", giro: "Consultoría empresarial", url: "https://agustinlozano.com", captura: "/portafolio/tino-lozano.webp" },
];

/** Seguridad y normas. Redacción "alineado a", no "certificado": ajustar si hay certificaciones formales. */
export const seguridad = [
  {
    titulo: "Cifrado de punta a punta",
    texto: "Todo tu sitio viaja por HTTPS con certificado incluido. Nadie puede leer lo que tu cliente escribe.",
  },
  {
    titulo: "Prácticas ISO/IEC 27001",
    texto: "Trabajamos con controles alineados a la norma de seguridad de la información: accesos, respaldos e incidentes.",
  },
  {
    titulo: "Desarrollo seguro OWASP",
    texto: "Construimos con base en el OWASP Top 10, la guía contra los ataques más comunes en la web.",
  },
  {
    titulo: "Pagos con estándar PCI DSS",
    texto: "Los cobros los procesa una pasarela certificada. Tu página nunca guarda datos de tarjeta.",
  },
  {
    titulo: "Datos personales en regla",
    texto: "Aviso de privacidad y manejo de datos conforme a la Ley Federal de Protección de Datos Personales.",
  },
  {
    titulo: "Nube de clase mundial",
    texto: "Infraestructura en la nube con red global, respaldos automáticos y disponibilidad las 24 horas.",
  },
];

// Los logotipos de infraestructura y tecnología están en lib/logos.ts.
