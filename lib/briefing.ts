// Brief de Página Viva (versión del PDF "Brief para crear tu página web").
//
// 1) Preguntas de CLIC: dan el contexto del negocio en un par de minutos. Algunas
//    solo aparecen según lo que se eligió antes (rutas de identidad visual).
// 2) CHAT: todo lo que es texto libre se platica con el asistente (escribiendo,
//    dictando o en modo voz). El asistente va llenando los "campos de chat".
//
// Todo se guarda en briefings.respuestas (jsonb) con estas mismas claves.

export type Respuestas = Record<string, string | string[]>;

export type PreguntaClic = {
  id: string;
  titulo: string;
  ayuda?: string;
  tipo: "una" | "varias" | "colores";
  opciones?: string[];
  maximo?: number;
  /** Opción que, si se elige, quita las demás (p. ej. "Todavía no tengo materiales"). */
  exclusiva?: string;
  visible?: (r: Respuestas) => boolean;
};

const tiene = (r: Respuestas, id: string, valor: string) => {
  const v = r[id];
  return Array.isArray(v) ? v.includes(valor) : v === valor;
};

export const LOGO = "Logotipo";
export const IDENTIDAD = "Identidad visual o manual de marca";
export const RULETA = "Elegir 2 o 3 colores con la ruleta";
export const PROPONE = "Prefiero que Phot8can proponga los colores";
export const REF_PARECIDA = "Sí, quiero que se parezca mucho";
export const REF_INSPIRACION = "Sí, solo como inspiración";
const conReferencia = (r: Respuestas) => r.referencia === REF_PARECIDA || r.referencia === REF_INSPIRACION;

export const preguntasClic: PreguntaClic[] = [
  {
    id: "rubro",
    titulo: "¿Cuál es el rubro de tu negocio?",
    tipo: "una",
    opciones: [
      "Restaurante o alimentos",
      "Tienda o venta de productos",
      "Salud o bienestar",
      "Belleza o cuidado personal",
      "Servicios profesionales",
      "Construcción o industria",
      "Educación",
      "Entretenimiento o eventos",
      "Otro",
    ],
  },
  {
    id: "objetivo",
    titulo: "¿Qué quieres que haga el visitante en tu página?",
    ayuda: "Elige el objetivo principal.",
    tipo: "una",
    opciones: [
      "Escribir por WhatsApp",
      "Hacer un pedido",
      "Comprar y pagar en línea",
      "Agendar una cita o reservación",
      "Solicitar una cotización",
      "Conocer nuestros servicios o trabajos",
    ],
  },
  {
    id: "informacion",
    titulo: "¿Qué información debe aparecer?",
    ayuda: "Elige hasta 4.",
    tipo: "varias",
    maximo: 4,
    opciones: [
      "Productos, catálogo o menú",
      "Servicios o paquetes",
      "Precios y promociones",
      "Galería de trabajos",
      "Historia y equipo",
      "Testimonios y reseñas",
      "Ubicación, horarios y contacto",
    ],
  },
  {
    id: "atencion",
    titulo: "¿Cómo atiende tu negocio?",
    ayuda: "Elige las que correspondan.",
    tipo: "varias",
    opciones: ["En línea", "En un local", "A domicilio o por zonas"],
  },
  {
    id: "materiales",
    titulo: "¿Qué materiales tienes?",
    ayuda: "Los archivos los mandas después en el chat, con el botón +.",
    tipo: "varias",
    exclusiva: "Todavía no tengo materiales",
    opciones: [LOGO, IDENTIDAD, "Fotografías y videos", "Menú, catálogo o lista de servicios", "Textos del negocio", "Todavía no tengo materiales"],
  },
  {
    id: "colores_ruta",
    titulo: "Tienes logo, pero no identidad visual. ¿Qué hacemos con los colores?",
    tipo: "una",
    opciones: ["Usar los colores de mi logotipo", RULETA, "Dejar que Phot8can proponga los colores"],
    visible: (r) => tiene(r, "materiales", LOGO) && !tiene(r, "materiales", IDENTIDAD),
  },
  {
    id: "logo_tipo",
    titulo: "No tienes logo: hagamos uno básico. ¿Qué tipo prefieres?",
    tipo: "una",
    opciones: ["Solo el nombre", "Nombre con un símbolo sencillo", "Iniciales del negocio", "Propuesta de Phot8can"],
    visible: (r) => !tiene(r, "materiales", LOGO),
  },
  {
    id: "logo_transmite",
    titulo: "¿Qué debe transmitir tu marca?",
    ayuda: "Elige hasta 2.",
    tipo: "varias",
    maximo: 2,
    opciones: ["Confianza", "Cercanía", "Elegancia", "Energía", "Creatividad", "Tranquilidad"],
    visible: (r) => !tiene(r, "materiales", LOGO),
  },
  {
    id: "colores",
    titulo: "Elige los colores de tu marca",
    ayuda: "Dos o tres colores. Toca cada círculo para cambiarlo.",
    tipo: "colores",
    visible: (r) => !tiene(r, "materiales", LOGO) || tiene(r, "colores_ruta", RULETA),
  },
  {
    id: "precios",
    titulo: "¿Cómo mostramos tus precios?",
    tipo: "una",
    opciones: ["Precios visibles", "Precios desde una cantidad inicial", "Solicitar cotización", "Consultar por WhatsApp"],
  },
  {
    id: "lista_productos",
    titulo: "Tu lista de productos o servicios…",
    ayuda: "Con nombres, descripciones y precios si se publican.",
    tipo: "una",
    opciones: ["La subo en el chat", "Comparto una carpeta", "Necesito ayuda para organizarla"],
  },
  {
    id: "funciones",
    titulo: "¿Qué funciones necesitas?",
    ayuda: "Elige hasta 3.",
    tipo: "varias",
    maximo: 3,
    opciones: [
      "Botón de WhatsApp",
      "Formulario de contacto o cotización",
      "Catálogo o menú digital",
      "Pedidos por WhatsApp",
      "Compra y pago en línea",
      "Citas o reservaciones",
      "Asistente automático",
      "Necesito orientación",
    ],
  },
  {
    id: "referencia",
    titulo: "¿Hay alguna página cuyo diseño te guste?",
    ayuda: "Nos ayuda a entender tu gusto. El enlace nos lo pasas en el chat.",
    tipo: "una",
    opciones: [REF_PARECIDA, REF_INSPIRACION, "No, que Phot8can proponga el diseño"],
  },
  {
    id: "dominio",
    titulo: "¿Ya tienes dominio?",
    ayuda: "El nombre de tu página, como tunegocio.com",
    tipo: "una",
    opciones: ["Sí", "No, necesito uno"],
  },
];

export const preguntasVisibles = (r: Respuestas) => preguntasClic.filter((p) => !p.visible || p.visible(r));

/** Campos que el asistente llena platicando. `cuando` decide si aplican. */
export type CampoChat = { id: string; etiqueta: string; pregunta: string; obligatorio?: boolean; cuando?: (r: Respuestas) => boolean };

export const camposChat: CampoChat[] = [
  { id: "nombre_comercial", etiqueta: "Nombre comercial", pregunta: "¿Cómo se llama tu negocio, tal cual quieres que aparezca?", obligatorio: true },
  { id: "que_vende", etiqueta: "Qué vende u ofrece", pregunta: "Cuéntame qué vendes o qué servicios ofreces.", obligatorio: true },
  { id: "otro_rubro", etiqueta: "Rubro", pregunta: "¿A qué rubro pertenece tu negocio?", obligatorio: true, cuando: (r) => r.rubro === "Otro" },
  { id: "responsable", etiqueta: "Responsable", pregunta: "¿Quién es la persona responsable del negocio?", obligatorio: true },
  { id: "whatsapp", etiqueta: "WhatsApp de contacto", pregunta: "¿A qué WhatsApp te contactamos para el proyecto?", obligatorio: true },
  { id: "correo", etiqueta: "Correo", pregunta: "¿Y tu correo electrónico?", obligatorio: true },
  { id: "whatsapp_negocio", etiqueta: "WhatsApp del negocio", pregunta: "¿Qué WhatsApp publicamos en la página? ¿Es el mismo?", obligatorio: true },
  { id: "correo_publico", etiqueta: "Correo público", pregunta: "¿Hay un correo que quieras mostrar en la página?" },
  {
    id: "direccion",
    etiqueta: "Dirección o Google Maps",
    pregunta: "¿Cuál es la dirección de tu local, o el enlace de Google Maps?",
    obligatorio: true,
    cuando: (r) => (Array.isArray(r.atencion) ? r.atencion.includes("En un local") : false),
  },
  {
    id: "zonas",
    etiqueta: "Zonas que atiende",
    pregunta: "¿Qué zonas o ciudades atiendes?",
    obligatorio: true,
    cuando: (r) => (Array.isArray(r.atencion) ? r.atencion.includes("A domicilio o por zonas") : false),
  },
  { id: "horarios", etiqueta: "Horarios", pregunta: "¿Cuáles son tus horarios de atención?", obligatorio: true },
  { id: "redes", etiqueta: "Redes sociales", pregunta: "¿Tienes Facebook, Instagram o TikTok? Pásame los nombres o enlaces." },
  { id: "logo_nombre", etiqueta: "Nombre exacto del logo", pregunta: "¿Qué nombre exacto debe llevar tu logo?", obligatorio: true, cuando: (r) => !(Array.isArray(r.materiales) && r.materiales.includes(LOGO)) },
  { id: "enlace_materiales", etiqueta: "Enlace a materiales", pregunta: "Si tienes tus archivos en una carpeta (Drive, Dropbox), pásame el enlace." },
  { id: "atiende_nombre", etiqueta: "Quién atiende las solicitudes", pregunta: "¿Quién va a recibir y atender las solicitudes que lleguen por la página?", obligatorio: true },
  { id: "atiende_contacto", etiqueta: "Contacto de quien atiende", pregunta: "¿A qué WhatsApp o correo le llegan?", obligatorio: true },
  {
    id: "referencia_url",
    etiqueta: "Página de referencia",
    pregunta: "Pásame el enlace de la página que te gusta (o de varias, si son más).",
    obligatorio: true,
    cuando: conReferencia,
  },
  {
    id: "referencia_gusta",
    etiqueta: "Qué le gusta de esa página",
    pregunta: "¿Qué es lo que más te gusta de esa página: los colores, cómo está acomodada, las fotos, las letras?",
    cuando: conReferencia,
  },
  { id: "dominio_url", etiqueta: "Dominio actual", pregunta: "¿Cuál es tu dominio?", obligatorio: true, cuando: (r) => r.dominio === "Sí" },
  { id: "fecha_publicacion", etiqueta: "Fecha deseada", pregunta: "¿Para cuándo te gustaría tener tu página publicada?" },
  { id: "aprobador", etiqueta: "Quién aprueba la página", pregunta: "¿Quién va a revisar y aprobar la página?", obligatorio: true },
  { id: "indispensable", etiqueta: "Algo indispensable", pregunta: "Para cerrar: ¿hay algo que sí o sí deba aparecer en tu página?" },
];

export const camposAplicables = (r: Respuestas) => camposChat.filter((c) => !c.cuando || c.cuando(r));

export function respondido(v: unknown) {
  if (Array.isArray(v)) return v.length > 0;
  return typeof v === "string" && v.trim().length > 0;
}

/** Avance del brief en porcentaje: clics visibles + campos de chat que aplican. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- se mantiene la firma (archivos) para quien la llama
export function avanceBriefing(r: Respuestas, _archivos?: Record<string, string[]>) {
  const clics = preguntasVisibles(r);
  const campos = camposAplicables(r);
  const total = clics.length + campos.length;
  const hechos = clics.filter((p) => respondido(r[p.id])).length + campos.filter((c) => respondido(r[c.id])).length;
  return total ? Math.round((hechos / total) * 100) : 0;
}

export const faltantes = (r: Respuestas) => camposAplicables(r).filter((c) => c.obligatorio && !respondido(r[c.id]));

/* ---------- Conversación (se guarda como lista de JSON en respuestas._chat) ---------- */

export type MensajeChat = { de: "cliente" | "asistente"; texto: string; adjuntos?: string[]; voz?: boolean };

export const leerChat = (r: Respuestas): MensajeChat[] =>
  (Array.isArray(r._chat) ? r._chat : []).flatMap((x) => {
    try {
      return [JSON.parse(x) as MensajeChat];
    } catch {
      return [];
    }
  });

export const escribirChat = (m: MensajeChat[]) => m.map((x) => JSON.stringify(x));

/** Resumen de los clics para dar contexto al asistente. */
export function contextoClics(r: Respuestas) {
  return preguntasVisibles(r)
    .filter((p) => respondido(r[p.id]))
    .map((p) => `- ${p.titulo} ${Array.isArray(r[p.id]) ? (r[p.id] as string[]).join(", ") : r[p.id]}`)
    .join("\n");
}

/** Primer mensaje del asistente al llegar al chat. */
export function saludo(r: Respuestas) {
  const nombre = typeof r.nombre_comercial === "string" && r.nombre_comercial ? ` de ${r.nombre_comercial}` : "";
  return `¡Listo! Ya tengo el panorama${nombre}. Ahora platiquemos: escríbeme, mándame una nota de voz o activa el modo voz, como te sea más fácil. Para empezar, ${(faltantes(r)[0]?.pregunta ?? "cuéntame lo que quieras de tu negocio.").replace(/^(¿?)(.)/, (_, signo: string, letra: string) => signo + letra.toLowerCase())}`;
}
