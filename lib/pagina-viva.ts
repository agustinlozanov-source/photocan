// Contenido de /pagina-viva. Todo lo que dice la página se edita aquí.
// Los precios en `null` se muestran como "Por definir" hasta que se capturen.

export const PRECIO_BASE = 7990;

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
    precio: 4990,
    hasta: "2026-11-17T23:59:59-06:00",
    vigencia: "Del 13 al 17 de noviembre.",
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

/** Texto completo de vigencia, p. ej. "Del 13 al 17 de noviembre." (con varias etapas, menciona la siguiente). */
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
      "Lista en una semana desde tu brief",
    ],
  },
];

export const totalIncluido = incluido.reduce((n, c) => n + c.items.length, 0);

/**
 * Complementos de Página Viva por nivel de complejidad (pago único). El precio de cada
 * nivel está en NIVELES; los del grupo "creativo" tienen precio propio por pieza.
 * Lo mensual (agentes, marketing, operación) está en `mensuales`.
 */
export const NIVELES = {
  "nivel-1": { nombre: "Simple", precio: 0, texto: "Se agrega en horas, sin costo." },
  "nivel-2": { nombre: "Funcional", precio: 1490, texto: "Algo que trabaja solo por ti." },
  "nivel-3": { nombre: "Pagos y comercio", precio: 3490, texto: "Cobra, vende y factura en línea." },
  "nivel-4": { nombre: "Sistema a medida", precio: 6990, texto: "Precio desde; se confirma según tu negocio." },
  creativo: { nombre: "Producción creativa", precio: null, texto: "Fotos, video, identidad y campañas, por pieza." },
} as const;

export type Grupo = keyof typeof NIVELES;

export const modulos: {
  id: string;
  nombre: string;
  icono: IconoNombre;
  resumen: string;
  que?: string;
  para?: string;
  impacto?: string;
  precio: number;
  grupo: Grupo;
  desde?: boolean;
}[] = [
  {
    id: "paginas",
    nombre: "Más páginas",
    icono: "mas",
    resumen: "Para quien vende más de 10 servicios.",
    que: "Páginas adicionales con el mismo cuidado: textos, fotos, medición e indexación.",
    para: "Para negocios con un catálogo amplio de servicios o sucursales.",
    impacto: "Más puertas de entrada en Google y campañas más precisas.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "popup",
    nombre: "Ventana de promoción",
    icono: "cohete",
    resumen: "Un aviso que aparece al entrar para lanzar tu oferta del momento.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "barra-aviso",
    nombre: "Barra de aviso",
    icono: "cohete",
    resumen: "Una franja arriba de tu página: “Envío gratis hoy”, “Abrimos el domingo”.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "cuenta-regresiva",
    nombre: "Cuenta regresiva",
    icono: "cohete",
    resumen: "Un reloj que cuenta los días para tu promoción o evento.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "galeria",
    nombre: "Galería adicional",
    icono: "camara",
    resumen: "Otra galería o portafolio para mostrar más de tu trabajo.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "video-insertado",
    nombre: "Video dentro de tu página",
    icono: "video",
    resumen: "Tus videos de YouTube, Instagram o TikTok, reproduciéndose en tu página.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "feed-instagram",
    nombre: "Tus publicaciones de Instagram",
    icono: "marca",
    resumen: "Tus últimas publicaciones de Instagram, siempre al día en tu página.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "resenas-google",
    nombre: "Tus reseñas de Google",
    icono: "google",
    resumen: "Las reseñas que te dejan en Google, mostradas en tu página.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "botones-llegar",
    nombre: "Botones de llamar y cómo llegar",
    icono: "citas",
    resumen: "Un toque para llamarte o abrir Waze y Google Maps.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "enlaces-bio",
    nombre: "Página de enlaces para tu bio",
    icono: "paginas",
    resumen: "Tu propio “link en bio” con tu marca, en lugar de Linktree.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "qr",
    nombre: "Código QR de tu negocio",
    icono: "marca",
    resumen: "Un QR para tu local, tus tarjetas o tu menú que lleva a tu página.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "formulario-extra",
    nombre: "Formulario adicional",
    icono: "chat",
    resumen: "Otro formulario: cotización, bolsa de trabajo o contacto por sucursal.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "pdf-precios",
    nombre: "Menú o lista de precios en PDF",
    icono: "paginas",
    resumen: "Tu menú o lista de precios lista para descargar.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "messenger",
    nombre: "Chat de Messenger",
    icono: "chat",
    resumen: "Que te escriban por Messenger sin salir de tu página.",
    precio: 0,
    grupo: "nivel-1",
  },
  {
    id: "citas",
    nombre: "Citas en línea",
    icono: "citas",
    resumen: "Tu cliente elige día y hora sin llamarte.",
    que: "Agenda conectada a tu calendario, con recordatorios por WhatsApp y correo.",
    para: "Para consultorios, estéticas, talleres y cualquier negocio que trabaja con citas.",
    impacto: "Menos llamadas, menos faltas y tu agenda llena aunque estés ocupado.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "ingles",
    nombre: "Versión en inglés",
    icono: "idioma",
    resumen: "Tu página y tu agente, también en inglés.",
    que: "Textos traducidos y revisados por una persona, y el agente 24/7 respondiendo en inglés.",
    para: "Para negocios con clientes extranjeros o en zonas turísticas y fronterizas.",
    impacto: "Le vendes a un mercado que tu competencia ni ve.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "cotizador",
    nombre: "Cotizador o calculadora",
    icono: "estrategia",
    resumen: "Tu cliente calcula su precio o su caso y te llega listo para cerrar.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "catalogo",
    nombre: "Catálogo digital",
    icono: "tienda",
    resumen: "Tus productos con foto y precio, y un botón para pedir por WhatsApp.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "pedidos-whatsapp",
    nombre: "Pedidos por WhatsApp",
    icono: "chat",
    resumen: "Arman su pedido en tu página y te llega completo a tu WhatsApp.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "menu-qr",
    nombre: "Menú digital con QR",
    icono: "paginas",
    resumen: "Tu menú por categorías, siempre actualizado, desde un QR en la mesa.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "blog",
    nombre: "Blog",
    icono: "diseno",
    resumen: "Publica artículos y novedades para aparecer más en Google.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "bolsa-trabajo",
    nombre: "Bolsa de trabajo",
    icono: "admin",
    resumen: "Publica vacantes y recibe solicitudes con CV.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "cupones",
    nombre: "Cupones de descuento",
    icono: "cohete",
    resumen: "Códigos de descuento para tus promociones y campañas.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "encuesta",
    nombre: "Encuesta de satisfacción",
    icono: "medicion",
    resumen: "Pregunta a tus clientes cómo les fue y mide su satisfacción.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "newsletter",
    nombre: "Lista de correo",
    icono: "chat",
    resumen: "Junta correos de interesados para mandarles tus novedades.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "testimonios",
    nombre: "Reseñas de tus clientes",
    icono: "estrategia",
    resumen: "Un formulario para que tus clientes dejen su testimonio en tu página.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "sucursales",
    nombre: "Mapa de sucursales",
    icono: "google",
    resumen: "Todas tus sucursales en un mapa, con horarios y contacto de cada una.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "referidos",
    nombre: "Programa de referidos",
    icono: "cohete",
    resumen: "Tus clientes recomiendan y tú sabes quién te trajo a quién.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "landing-campana",
    nombre: "Página de campaña",
    icono: "medicion",
    resumen: "Una página enfocada en un solo anuncio para que convierta más.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "comparador",
    nombre: "Comparador de planes",
    icono: "estrategia",
    resumen: "Tus planes o paquetes lado a lado para que elijan fácil.",
    precio: 1490,
    grupo: "nivel-2",
  },
  {
    id: "tienda",
    nombre: "Tienda en línea con cobro y facturación",
    icono: "tienda",
    resumen: "Vende en línea y factura sin hacer nada a mano.",
    que: "Catálogo, carrito y cobro con tarjeta, transferencia o meses sin intereses, con factura automática.",
    para: "Para negocios que quieren vender productos o servicios las 24 horas, sin depender de un vendedor.",
    impacto: "Tu página deja de solo informar y empieza a cobrar. Cada venta llega pagada y facturada.",
    precio: 3490,
    grupo: "nivel-3",
  },
  {
    id: "reservas",
    nombre: "Reservaciones con pago",
    icono: "reservas",
    resumen: "Aparta con anticipo y deja de perder fechas.",
    que: "Reservaciones con cobro de anticipo en línea y confirmación automática.",
    para: "Para eventos, salones, hospedaje, tours y restaurantes.",
    impacto: "Quien aparta, paga. Se acaban las reservas fantasma.",
    precio: 3490,
    grupo: "nivel-3",
  },
  {
    id: "boletos",
    nombre: "Venta de boletos",
    icono: "reservas",
    resumen: "Vende entradas a tus eventos con cobro en línea.",
    precio: 3490,
    grupo: "nivel-3",
  },
  {
    id: "membresias",
    nombre: "Suscripciones y membresías",
    icono: "cuidado",
    resumen: "Cobro automático cada mes a tus miembros o suscriptores.",
    precio: 3490,
    grupo: "nivel-3",
  },
  {
    id: "cursos",
    nombre: "Cursos en línea",
    icono: "diseno",
    resumen: "Vende cursos con contenido protegido para quien pagó.",
    precio: 3490,
    grupo: "nivel-3",
  },
  {
    id: "facturacion",
    nombre: "Facturación automática",
    icono: "legal",
    resumen: "Cada venta genera su factura (CFDI) sin hacerla a mano.",
    precio: 3490,
    grupo: "nivel-3",
  },
  {
    id: "envios",
    nombre: "Envíos",
    icono: "tienda",
    resumen: "Calcula el costo de envío y genera la guía de paquetería.",
    precio: 3490,
    grupo: "nivel-3",
  },
  {
    id: "oxxo-spei",
    nombre: "Pagos en OXXO y transferencia",
    icono: "pos",
    resumen: "Que te paguen en efectivo en OXXO o por SPEI.",
    precio: 3490,
    grupo: "nivel-3",
  },
  {
    id: "tarjetas-regalo",
    nombre: "Tarjetas de regalo",
    icono: "cohete",
    resumen: "Vende tarjetas de regalo que se canjean en tu negocio.",
    precio: 3490,
    grupo: "nivel-3",
  },
  {
    id: "donaciones",
    nombre: "Donaciones",
    icono: "cuidado",
    resumen: "Recibe donativos en línea de forma segura.",
    precio: 3490,
    grupo: "nivel-3",
  },
  {
    id: "pos",
    nombre: "Punto de venta",
    icono: "pos",
    resumen: "Tu mostrador y tu tienda en línea, con un solo inventario.",
    que: "Sistema para cobrar en tu local conectado al mismo inventario y a las mismas ventas de tu tienda en línea.",
    para: "Para negocios con local físico que también venden en línea.",
    impacto: "Se acaban los inventarios descuadrados y las ventas que no sabes de dónde salieron.",
    precio: 6990,
    grupo: "nivel-4",
    desde: true,
  },
  {
    id: "admin",
    nombre: "Súper administrador",
    icono: "admin",
    resumen: "Todo tu negocio en un solo tablero.",
    que: "Panel con ventas, inventario, usuarios, permisos y reportes de tu tienda y tu punto de venta.",
    para: "Para dueños que quieren controlar su operación desde el celular, estén donde estén.",
    impacto: "Decides con números reales, no con corazonadas.",
    precio: 6990,
    grupo: "nivel-4",
    desde: true,
  },
  {
    id: "inventario",
    nombre: "Inventario",
    icono: "admin",
    resumen: "Controla tu inventario, también por sucursal.",
    precio: 6990,
    grupo: "nivel-4",
    desde: true,
  },
  {
    id: "area-clientes",
    nombre: "Área privada para tus clientes",
    icono: "legal",
    resumen: "Tus clientes entran con su cuenta a ver sus pedidos, citas o documentos.",
    precio: 6990,
    grupo: "nivel-4",
    desde: true,
  },
  {
    id: "marketplace",
    nombre: "Directorio o marketplace",
    icono: "tienda",
    resumen: "Una plataforma con varios vendedores o negocios.",
    precio: 6990,
    grupo: "nivel-4",
    desde: true,
  },
  {
    id: "cotizaciones-flujo",
    nombre: "Cotizaciones con aprobación",
    icono: "estrategia",
    resumen: "Cotizaciones que pasan por revisión y aprobación antes de enviarse.",
    precio: 6990,
    grupo: "nivel-4",
    desde: true,
  },
  {
    id: "integracion",
    nombre: "Conexión con tu sistema",
    icono: "admin",
    resumen: "Conectamos tu página con el CRM, ERP o sistema que ya usas.",
    precio: 6990,
    grupo: "nivel-4",
    desde: true,
  },
  {
    id: "app",
    nombre: "App instalable en el celular",
    icono: "viva",
    resumen: "Tu página se instala como app en el celular de tus clientes.",
    precio: 6990,
    grupo: "nivel-4",
    desde: true,
  },
  {
    id: "reportes",
    nombre: "Reportes a tu medida",
    icono: "medicion",
    resumen: "Tableros con los números que a ti te importan.",
    precio: 6990,
    grupo: "nivel-4",
    desde: true,
  },
  {
    id: "marca",
    nombre: "Logo e identidad básica",
    icono: "marca",
    resumen: "Si aún no tienes marca, la creamos contigo.",
    que: "Tu logotipo, tu paleta de color y tus tipografías, listos para usarse en tu página y tus redes.",
    para: "Para negocios nuevos o marcas que ya no los representan.",
    impacto: "Una marca clara se recuerda, se reconoce y se recomienda.",
    precio: 0,
    grupo: "creativo",
  },
  {
    id: "fotos",
    nombre: "Sesión de fotos",
    icono: "camara",
    resumen: "Fotos reales de tu negocio, hechas por Phot8can.",
    que: "Sesión profesional de tu lugar, tu equipo, tus productos y tu servicio en acción.",
    para: "Para quien no tiene fotos o tiene fotos que no le hacen justicia.",
    impacto: "La gente confía en lo que ve. Fotos reales venden más que cualquier banco de imágenes.",
    precio: 1990,
    grupo: "creativo",
  },
  {
    id: "video",
    nombre: "Video",
    icono: "video",
    resumen: "Un video que cuenta tu negocio en segundos.",
    que: "Video para el inicio de tu página, tus redes y tus anuncios.",
    para: "Para negocios que quieren destacar en redes y en su página.",
    impacto: "El video retiene más tiempo y explica en segundos lo que un texto tarda minutos.",
    precio: 2490,
    grupo: "creativo",
  },
  {
    id: "lanzamiento",
    nombre: "Campaña de lanzamiento",
    icono: "cohete",
    resumen: "Anuncios para que tu página arranque con clientes.",
    que: "Campaña en Meta y Google configurada, con anuncios diseñados y medición desde el día uno.",
    para: "Para quien quiere resultados desde la primera semana.",
    impacto: "Tu página no espera a que la encuentren: sale a buscar clientes.",
    precio: 1990,
    grupo: "creativo",
  },
  {
    id: "manual-identidad",
    nombre: "Manual de identidad completo",
    icono: "marca",
    resumen: "Las reglas de tu marca: usos del logo, colores, letras y aplicaciones.",
    precio: 2490,
    grupo: "creativo",
  },
  {
    id: "video-portada",
    nombre: "Video o animación de portada",
    icono: "video",
    resumen: "Un video o animación para el inicio de tu página.",
    precio: 1490,
    grupo: "creativo",
  },
  {
    id: "textos",
    nombre: "Textos adicionales",
    icono: "diseno",
    resumen: "Redacción profesional de una página adicional.",
    precio: 290,
    grupo: "creativo",
  },
  {
    id: "ilustraciones",
    nombre: "Ilustraciones o íconos a medida",
    icono: "diseno",
    resumen: "Ilustraciones o íconos hechos para tu marca, por pieza.",
    precio: 490,
    grupo: "creativo",
  },
  {
    id: "recorrido-360",
    nombre: "Recorrido virtual 360°",
    icono: "camara",
    resumen: "Que tus clientes recorran tu lugar desde su celular.",
    precio: 2990,
    grupo: "creativo",
  },
];

/** Servicios mensuales: agentes con IA, marketing y operación. Precios en pesos al mes. */
export const mensuales: {
  id: string;
  nombre: string;
  familia: "agentes" | "marketing" | "operacion";
  precio: number | null;
  nota: string;
}[] = [
  { id: "agente-web", nombre: "Agente 24/7 en tu página", familia: "agentes", precio: 590, nota: "Incluye 500 conversaciones; la extra cuesta $1." },
  { id: "agente-redes", nombre: "Agente en WhatsApp, Messenger o Instagram", familia: "agentes", precio: 790, nota: "Por canal. Incluye 500 conversaciones; la extra cuesta $1." },
  { id: "agente-agenda", nombre: "Agente que agenda en tu calendario", familia: "agentes", precio: 290, nota: "Se suma a cualquier agente." },
  { id: "seguimiento", nombre: "Seguimiento automático a prospectos", familia: "agentes", precio: 390, nota: "Vuelve a escribir a quien dejó de contestar." },
  { id: "agente-voz", nombre: "Agente de voz por teléfono", familia: "agentes", precio: null, nota: "Se cotiza: se cobra por minuto." },
  { id: "anuncios", nombre: "Manejo mensual de anuncios", familia: "marketing", precio: 1990, nota: "Más la inversión en anuncios, que pones tú." },
  { id: "seo", nombre: "Posicionamiento en Google", familia: "marketing", precio: 1490, nota: "2 artículos al mes y ajustes." },
  { id: "perfil-google", nombre: "Perfil de Google optimizado", familia: "marketing", precio: 490, nota: "Fotos, publicaciones y respuestas a reseñas." },
  { id: "correos", nombre: "Correos de marketing", familia: "marketing", precio: 990, nota: "2 envíos al mes." },
  { id: "redes", nombre: "Redes sociales", familia: "marketing", precio: 2990, nota: "12 publicaciones al mes." },
  { id: "hospedaje", nombre: "Hospedaje", familia: "operacion", precio: 149, nota: "O $1,490 al año (2 meses gratis)." },
  { id: "correo-dominio", nombre: "Correo con tu dominio", familia: "operacion", precio: null, nota: "Al costo del proveedor, más $290 de configuración." },
  { id: "respaldos", nombre: "Respaldos extendidos", familia: "operacion", precio: 99, nota: "Más historial y restauración prioritaria." },
];

/** Formas de pago. TODO: conectar el cobro con tarjeta (Stripe) y la nota de IVA. */
export const pagos = {
  notaPrecio: "MXN más IVA",
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
    r: "En máximo una semana desde que terminas tu brief, muchas veces antes. El brief se llena en unos 20 minutos desde tu portal: escribiendo, hablando o subiendo tu logo y tus fotos.",
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
export const reelsHasta = "2026-11-13T00:00:00-06:00"; // ocultos: cierran con el precio anterior

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
