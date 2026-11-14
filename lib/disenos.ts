// Catálogo de diseños de Página Viva. Cada uno es una plantilla del repo phot8can-sitios
// (plantillas/<id>/) y tiene un demo compilado en public/plantillas/<id>/ (node scripts/demos.mjs).

export type IdDiseno = "serena" | "sazon" | "criterio";
export type Giro = "salud" | "comida" | "servicios";

export type Diseno = {
  id: IdDiseno;
  nombre: string;
  lema: string;
  descripcion: string;
  giros: Giro[];
  ideal: string[];
  estilo: string;
  efectos: string[];
  colores: string[];
  fuentes: string;
  oscuro?: boolean;
};

export const GIROS: { id: Giro | "todos"; texto: string }[] = [
  { id: "todos", texto: "Todos" },
  { id: "salud", texto: "Salud y bienestar" },
  { id: "comida", texto: "Comida y bebida" },
  { id: "servicios", texto: "Servicios profesionales" },
];

export const DISENOS: Diseno[] = [
  {
    id: "serena",
    nombre: "Serena",
    lema: "Calma que da confianza",
    descripcion: "Luz suave, tipografía con cursivas y formas redondeadas. Para que tu cliente llegue tranquilo antes de la primera cita.",
    giros: ["salud"],
    ideal: ["Dentistas", "Clínicas", "Spas", "Nutrición", "Psicología", "Estética"],
    estilo: "Claro y suave",
    efectos: ["Títulos que aparecen palabra por palabra", "Manchas de color que flotan", "Tarjetas que se apilan", "Números que cuentan"],
    colores: ["#24524E", "#E8A97E", "#F6F2EC"],
    fuentes: "Fraunces + Manrope",
  },
  {
    id: "sazon",
    nombre: "Sazón",
    lema: "Que se te antoje desde la pantalla",
    descripcion: "Oscuro y cálido, letras enormes y fotos a sangre. Hecho para que el cliente pida antes de terminar de bajar.",
    giros: ["comida"],
    ideal: ["Restaurantes", "Taquerías", "Cafeterías", "Food trucks", "Panaderías", "Bares"],
    estilo: "Oscuro e intenso",
    efectos: ["Bandas que se mueven", "Sellos que giran", "Fotos con profundidad", "Grano de película"],
    colores: ["#E2512B", "#F4C04E", "#15100C"],
    fuentes: "Bricolage Grotesque + DM Sans",
    oscuro: true,
  },
  {
    id: "criterio",
    nombre: "Criterio",
    lema: "Seriedad que se nota",
    descripcion: "Editorial y sobrio: serif grande, retícula visible y listas que se llenan al pasar el mouse. Transmite experiencia sin ser frío.",
    giros: ["servicios"],
    ideal: ["Contadores", "Abogados", "Consultorías", "Inmobiliarias", "Arquitectos", "Notarías"],
    estilo: "Editorial y sobrio",
    efectos: ["Barra de lectura", "Fotos que pasan a color", "Bordes con haz de luz", "Retícula de revista"],
    colores: ["#13223A", "#B98A3E", "#F3F1EC"],
    fuentes: "Newsreader + Geist",
  },
];

export const demoDe = (id: IdDiseno) => `/plantillas/${id}/`;
export const capturaDe = (id: IdDiseno) => `/plantillas/capturas/${id}.webp`;
export const disenoPorId = (id: unknown) => DISENOS.find((d) => d.id === id);

/** Valores especiales de respuestas.plantilla cuando no elige uno del catálogo. */
export const POR_REFERENCIA = "referencia";
export const PROPUESTA = "propuesta";
