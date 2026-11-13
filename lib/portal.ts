// Datos del portal de cliente. Hoy es una DEMOSTRACIÓN: el cliente, los cobros y los
// precios de dominios son de ejemplo. Cuando exista el backend (Supabase + Stripe),
// esto se reemplaza por lo que venga de la base de datos.

export const cliente = {
  nombre: "Ana",
  nombreCompleto: "Ana Torres",
  negocio: "Clínica Dental Sonrisa",
  correo: "ana@clinicasonrisa.mx",
  dominio: "clinicasonrisa.mx",
  tarjeta: { marca: "Visa", ultimos: "4242", vence: "08/29" },
};

export type Complejidad = "simple" | "mediano" | "complejo" | "equipo";

/** Planes de cambios con IA. Propuesta: por cantidad al mes, sin créditos. */
export const planesCambios = [
  {
    id: "basico",
    nombre: "Básico",
    precio: 390,
    incluye: { simple: 10, mediano: 0, complejo: 0 },
    para: "Para mantener al día fotos e información.",
  },
  {
    id: "plus",
    nombre: "Plus",
    precio: 790,
    incluye: { simple: 15, mediano: 2, complejo: 0 },
    para: "Para lanzar promociones y servicios nuevos.",
    destacado: true,
  },
  {
    id: "pro",
    nombre: "Pro",
    precio: 1990,
    incluye: { simple: 30, mediano: 6, complejo: 1 },
    para: "Para hacer crecer tu página cada mes.",
  },
] as const;

export type PlanId = (typeof planesCambios)[number]["id"];

export const tiposCambio: Record<Complejidad, { nombre: string; ejemplos: string; suelto: number | null }> = {
  simple: { nombre: "Simple", ejemplos: "Fotos, textos, precios, horarios, teléfonos, campos del formulario.", suelto: 79 },
  mediano: { nombre: "Mediano", ejemplos: "Una sección nueva, una página de servicio, una promoción.", suelto: 390 },
  complejo: { nombre: "Complejo", ejemplos: "Una función nueva, una integración, rediseñar una página.", suelto: 1500 },
  equipo: { nombre: "Lo hace el equipo", ejemplos: "Dominio, pagos, avisos legales o lo que la IA no resuelve.", suelto: null },
};

/** Rondas de ajustes incluidas en cada cambio. */
export const RONDAS = 3;

/** Base de datos por tamaño (propuesta). */
export const basesDatos = [
  { id: "inicial", nombre: "Inicial", precio: 290, registros: "10,000 registros", archivos: "1 GB de archivos", para: "Prospectos, formularios y citas." },
  { id: "negocio", nombre: "Negocio", precio: 690, registros: "100,000 registros", archivos: "10 GB de archivos", para: "Tienda, inventario y pedidos." },
  { id: "dedicada", nombre: "Dedicada", precio: 1990, desde: true, registros: "Sin límite práctico", archivos: "Respaldos aparte", para: "Base propia para alto volumen." },
] as const;

export type BaseId = (typeof basesDatos)[number]["id"];

/** Dominios: precios de EJEMPLO. En producción se consultan en vivo y se venden al costo. */
export const extensiones = [
  { ext: ".mx", precio: 780 },
  { ext: ".com.mx", precio: 560 },
  { ext: ".com", precio: 360 },
  { ext: ".net", precio: 420 },
  { ext: ".shop", precio: 140 },
  { ext: ".clinic", precio: 1680 },
];

/** Etapas del proyecto de una Página Viva. */
export const etapasProyecto = [
  { nombre: "Briefing", detalle: "Nos cuentas todo de tu negocio." },
  { nombre: "Diseño", detalle: "Armamos tu página y tus textos." },
  { nombre: "Revisión", detalle: "La revisas y pides ajustes." },
  { nombre: "En línea", detalle: "Publicada, medida y trabajando." },
];

/** Cobros de ejemplo. */
export const historialCobros = [
  { fecha: "01 nov 2026", concepto: "Plan de cambios Básico", monto: 390, estado: "Pagado" },
  { fecha: "01 nov 2026", concepto: "Base de datos Inicial", monto: 290, estado: "Pagado" },
  { fecha: "28 oct 2026", concepto: "Agente 24/7 · uso de octubre", monto: 118, estado: "Pagado" },
  { fecha: "01 oct 2026", concepto: "Plan de cambios Básico", monto: 390, estado: "Pagado" },
  { fecha: "15 sep 2026", concepto: "Página Viva · 12 MSI (mensualidad 1 de 12)", monto: 1417, estado: "Pagado" },
];

/** Respaldos de ejemplo. */
export const respaldos = [
  { fecha: "Hoy, 3:00 a. m.", tipo: "Automático", detalle: "Página completa y base de datos" },
  { fecha: "Ayer, 3:00 a. m.", tipo: "Automático", detalle: "Página completa y base de datos" },
  { fecha: "10 nov, 6:42 p. m.", tipo: "Antes de un cambio", detalle: "Nuevas fotos del consultorio" },
  { fecha: "09 nov, 3:00 a. m.", tipo: "Automático", detalle: "Página completa y base de datos" },
];

export const accesos = [
  { nombre: "Ana Torres", correo: "ana@clinicasonrisa.mx", rol: "Dueña" },
  { nombre: "Luis Méndez", correo: "recepcion@clinicasonrisa.mx", rol: "Puede pedir cambios" },
  { nombre: "Equipo Phot8can", correo: "soporte@phot8can.com", rol: "Soporte" },
];

/** Reporte de ejemplo de la página en línea. */
export const reporteMes = [
  { dato: "Visitas", valor: "1,240", cambio: "+18%" },
  { dato: "Clics a WhatsApp", valor: "86", cambio: "+9%" },
  { dato: "Formularios", valor: "31", cambio: "+22%" },
  { dato: "Citas agendadas", valor: "23", cambio: "+4" },
];

/**
 * Clasificador de ejemplo para la demo del chat. En producción lo hace un modelo
 * de IA antes de ejecutar; aquí solo busca palabras clave.
 */
export function clasificar(texto: string): Complejidad {
  const t = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (/(dominio|dns|factura|cobro|pago|legal|aviso de privacidad|contrato|correo corporativo)/.test(t)) return "equipo";
  if (/(tienda|integra|redisen|funcion|sistema|conecta|carrito|inventario|login)/.test(t)) return "complejo";
  if (/(seccion|pagina nueva|nueva pagina|promocion|landing|servicio nuevo|nuevo servicio|blog)/.test(t)) return "mediano";
  return "simple";
}
