// Textos e imágenes de la página principal. Edita aquí sin tocar los componentes.

const TELEFONO = "528681079743";

export const whatsapp = (texto = "Hola Phot8can, quiero platicar sobre un proyecto.") =>
  `https://wa.me/${TELEFONO}?text=${encodeURIComponent(texto)}`;

export const nav = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Proyectos", href: "/#proyectos" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Página Viva", href: "/pagina-viva/" },
  { label: "Bodas", href: "/bodas/" },
  { label: "Contacto", href: "/#contacto" },
];

export const disciplinas = [
  "Fotografía",
  "Video",
  "Branding",
  "Redes sociales",
  "Bodas",
  "Contenido",
  "Identidad visual",
  "Campañas",
];

// TODO: confirmar las cifras reales con Phot8can antes de publicar.
export const cifras = [
  { valor: 150, sufijo: "+", texto: "Proyectos entregados,\ncada uno hecho a mano" },
  { valor: 95, sufijo: "%", texto: "Clientes que regresan\npara el siguiente" },
  { valor: 8, sufijo: "", texto: "Años creando,\ncapturando y conectando" },
];

export const proyectos = [
  {
    titulo: "Photocan Bodas",
    texto: "Bodas contadas con intención, de principio a fin.",
    meta: "Fotografía y video, 2026",
    img: "/img/boda-retrato.webp",
    href: "/bodas/",
  },
  {
    titulo: "Identidad Phot8can",
    texto: "Una marca hecha a mano, del trazo a la tarjeta.",
    meta: "Identidad visual, papelería, 2026",
    img: "/img/tarjetas.webp",
  },
  {
    titulo: "La ceremonia",
    texto: "La luz de ese momento, tal como se sintió.",
    meta: "Fotografía de bodas, 2026",
    img: "/img/boda-ceremonia.webp",
  },
  {
    titulo: "Prendas Phot8can",
    texto: "Merch que se usa con gusto, no por compromiso.",
    meta: "Aplicaciones de marca, 2026",
    img: "/img/sudadera.webp",
  },
  {
    titulo: "Getting ready",
    texto: "Los minutos antes también son la boda.",
    meta: "Fotografía de bodas, 2026",
    img: "/img/boda-arreglo.webp",
  },
  {
    titulo: "Señalética",
    texto: "El logotipo en vinil, a la vista de la calle.",
    meta: "Espacios y objetos, 2026",
    img: "/img/puerta.webp",
  },
];

export const pasos = [
  {
    titulo: "Escuchamos",
    texto: "Conocemos tu marca, a tu gente y a tus clientes. Entre todo lo que se dice está la idea que nadie ha contado.",
    tiempo: "Semana 1",
  },
  {
    titulo: "Creamos",
    texto: "Convertimos esa idea en un concepto visual: estilo, tono, guion y plan de producción, hechos a la medida.",
    tiempo: "Semanas 2 a 3",
  },
  {
    titulo: "Capturamos",
    texto: "Fotografía, video y diseño con un mismo equipo. Lo que se planeó se produce sin perder nada en el camino.",
    tiempo: "Semanas 3 a 5",
  },
  {
    titulo: "Conectamos",
    texto: "Entregamos, publicamos y medimos. Tu marca llega a quien tiene que llegar, y seguimos cerca después.",
    tiempo: "Semana 6 en adelante",
  },
];

// TODO: confirmar la lista de servicios con Phot8can.
export const servicios = [
  { titulo: "Página Viva", texto: "Páginas web que atienden 24/7", img: "/img/puerta.webp", href: "/pagina-viva/" },
  { titulo: "Fotografía", texto: "Retrato, producto y eventos", img: "/img/boda-ramo.webp" },
  { titulo: "Video", texto: "Reels, spots y cine de bodas", img: "/img/boda-ceremonia.webp" },
  { titulo: "Branding e identidad", texto: "Logotipos, manuales y sistemas visuales", img: "/img/tarjetas.webp" },
  { titulo: "Redes sociales", texto: "Estrategia, contenido y gestión", img: "/img/taza.webp" },
  { titulo: "Bodas", texto: "Fotografía y video del gran día", img: "/img/boda-retrato.webp", href: "/bodas/" },
];

// Página Viva: borrador del 12 nov 2026, pendiente de validar. Ajusta aquí los textos.
export const paginaViva = {
  dolor: "Tu cliente escribe en la noche y nadie le contesta.",
  promesas: [
    { titulo: "Hecha a tu medida", texto: "Tu identidad, tus fotos, tu forma de vender." },
    { titulo: "Te atiende 24/7", texto: "Contesta, cotiza y agenda aunque estés dormido." },
    { titulo: "Siempre viva", texto: "Se actualiza por temporada y cada mes te dice cuántos clientes trajo." },
  ],
  hoy: ["“No sé cuánto cuesta.”", "“Escribí y nadie me contestó.”", "“No sé si esto es para mí.”"],
  pasos: [
    { titulo: "Nos platicas tu negocio", texto: "Una junta de arranque: tus servicios, tus precios, tus clientes y lo que más te preguntan." },
    { titulo: "Creamos y producimos", texto: "Identidad, textos, fotos y video reales de tu negocio. Nada de bancos de imágenes." },
    { titulo: "Tu página empieza a atender", texto: "Contesta, cotiza y agenda las 24 horas, y cada mes te dice cuántos clientes trajo." },
  ],
  secciones: [
    "Barra con WhatsApp siempre visible",
    "Inicio: el dolor de tu cliente y tu promesa",
    "Lo que le pasa hoy a tu cliente",
    "Herramienta interactiva de tu giro",
    "Servicios, con precio o rango",
    "Cómo funciona, en 3 pasos",
    "Prueba: testimonios, fotos y números",
    "Quiénes somos",
    "Preguntas frecuentes",
    "Ubicación y horarios",
    "Cierre con tu botón principal",
  ],
  porDentro: [
    { titulo: "Contacto", texto: "Formulario que guarda cada contacto en el CRM, aviso de privacidad y WhatsApp en cada página." },
    { titulo: "Google", texto: "Lista para Google y Maps, una página por servicio y traductor automático al inglés." },
    { titulo: "Medición", texto: "Cada botón se mide: visitas, clics a WhatsApp, formularios, citas y de dónde llegó cada cliente." },
    { titulo: "Siempre viva", texto: "Panel para editar precios, horarios y fotos desde el celular, reporte mensual y 3 actualizaciones al año." },
  ],
  giros: [
    { giro: "Comida", herramienta: "Arma tu pedido", boton: "Pedir por WhatsApp" },
    { giro: "Salud", herramienta: "¿Soy candidato?", boton: "Agendar valoración" },
    { giro: "Bienestar", herramienta: "Tu plan ideal", boton: "Reservar mi lugar" },
    { giro: "Servicios profesionales", herramienta: "¿Cuánto cuesta tu caso?", boton: "Pedir primera consulta" },
    { giro: "Técnicos y de campo", herramienta: "Cotiza tu servicio", boton: "Solicitar cotización" },
    { giro: "Tiendas", herramienta: "Buscador del catálogo", boton: "Apartar por WhatsApp" },
    { giro: "Eventos y espacios", herramienta: "Cotiza tu evento", boton: "Apartar mi fecha" },
    { giro: "Educación y cursos", herramienta: "¿Qué curso es para ti?", boton: "Inscribirme" },
  ],
  incluye:
    "Las once secciones, la herramienta interactiva de tu giro, el agente 24/7 y todo lo de “por dentro”. Hasta 10 páginas, entregadas en 10 días hábiles desde que tenemos tu material completo.",
  modulos: [
    "Sesión de fotos",
    "Video",
    "Logo",
    "Identidad",
    "Versión en inglés",
    "Más páginas",
    "Citas en línea",
    "Reservaciones con pago",
    "Tienda en línea",
    "Punto de venta",
    "Campaña de lanzamiento",
    "Plan de cuidado mensual",
  ],
  necesitamos: [
    "Logo y colores",
    "Servicios con precios o rangos",
    "Las 10 preguntas que más te hacen",
    "Tu historia, en corto",
    "Testimonios o permiso para grabarlos",
    "Tu número de WhatsApp",
    "Horarios y ubicación",
    "Fotos y video (o el módulo de fotos)",
  ],
};
