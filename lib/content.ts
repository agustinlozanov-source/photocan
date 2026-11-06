// Todo el contenido de la landing vive aquí.
// Cambia textos, precios e imágenes en este archivo sin tocar los componentes.
// Las imágenes son placeholders de picsum.photos: reemplázalas por tus fotos en /public.

const img = (seed: string, w = 1600, h = 1000) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const site = {
  name: "PhotoCan",
  wordmark: "PHOTOCAN",
  year: "2026",
  email: "hola@photocan.com",
  phone: "+52 000 000 0000",
  city: "Ciudad, País",
  instagram: "https://instagram.com/",
};

export const nav = [
  { label: "Inicio", href: "#inicio" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Trabajos", href: "#trabajos" },
  { label: "Servicios", href: "#servicios" },
  { label: "Precios", href: "#precios" },
  { label: "Contacto", href: "#contacto" },
];

export const hero = {
  image: img("photocan-hero", 2000, 1400),
  tagline: ["Elige un paquete, cuéntanos tu idea", "y tus fotos toman forma", "en una sola sesión."],
  cta: { label: "Ver trabajos", href: "#trabajos" },
  tags: ["Retrato", "Producto", "Eventos"],
};

export const about = {
  label: "Nosotros",
  aside: "Fotografía desde 2016",
  statement:
    "Somos un estudio de fotografía independiente que convierte ideas en imágenes con intención, luz y carácter.",
  image: img("photocan-about", 1600, 1100),
  steps: [
    {
      tag: "(Antes)",
      text: "Cada sesión empieza escuchando. Entendemos qué quieres contar, para quién y dónde se va a ver, antes de encender una sola luz.",
    },
    {
      tag: "(+Durante)",
      text: "Dirigimos la sesión de principio a fin: locación, estilo, luz y poses, para que te relajes y la cámara haga su trabajo.",
    },
    {
      tag: "(=Resultado)",
      text: "Entregamos fotos editadas, listas para redes, web e impresión, con un estilo coherente que se reconoce a primera vista.",
    },
  ],
  stats: [
    { value: "500+", label: "Sesiones realizadas" },
    { value: "9", label: "Años de experiencia" },
    { value: "48h", label: "Primeras fotos" },
  ],
};

export const work = {
  label: "Trabajos seleccionados",
  aside: "2023 — 2026",
  title: ["Trabajos", "seleccionados"],
  cta: { label: "Agenda tu sesión", href: "#contacto" },
  projects: [
    { name: "Proyecto Uno", category: "Retrato editorial", image: img("photocan-w1", 1200, 1500) },
    { name: "Proyecto Dos", category: "Producto & e-commerce", image: img("photocan-w2", 1200, 1500) },
    { name: "Proyecto Tres", category: "Campaña de marca", image: img("photocan-w3", 1200, 1500) },
    { name: "Proyecto Cuatro", category: "Evento", image: img("photocan-w4", 1200, 1500) },
  ],
};

export const services = {
  label: "Servicios",
  aside: "Retrato · Producto · Eventos",
  intro: "Un estudio pequeño, con un solo punto de vista, para cada tipo de sesión.",
  items: [
    {
      title: "Retrato",
      subtitle: "Personal y profesional",
      text: "Fotos para tu marca personal, LinkedIn, portafolio o simplemente para ti. Te guiamos en todo para que salgas natural.",
      image: img("photocan-s1", 1600, 1000),
    },
    {
      title: "Producto",
      subtitle: "E-commerce y catálogo",
      text: "Fondo limpio o escenas con estilo. Imágenes consistentes que venden en tu tienda, marketplace y redes.",
      image: img("photocan-s2", 1600, 1000),
    },
    {
      title: "Eventos",
      subtitle: "Sociales y corporativos",
      text: "Cubrimos el evento completo sin interrumpir, y entregamos una galería lista para compartir en pocos días.",
      image: img("photocan-s3", 1600, 1000),
    },
  ],
};

export const pricing = {
  label: "Precios",
  aside: "Tres paquetes",
  currency: "$",
  plans: [
    {
      name: "Básico",
      description: "Para quien necesita fotos buenas, rápido.",
      price: "1,500",
      unit: "/ Sesión",
      features: ["1 hora de sesión", "1 locación", "15 fotos editadas"],
    },
    {
      name: "Estudio",
      description: "Para marcas y profesionales que quieren variedad.",
      price: "3,500",
      unit: "/ Sesión",
      featured: true,
      features: [
        "1 hora de sesión",
        "1 locación",
        "15 fotos editadas",
        "2 cambios de vestuario o escena",
        "40 fotos editadas en total",
        "Dirección de estilo",
      ],
    },
    {
      name: "Completo",
      description: "Producción completa para campañas y lanzamientos.",
      price: "7,000",
      unit: "/ Sesión",
      features: [
        "1 hora de sesión",
        "1 locación",
        "15 fotos editadas",
        "2 cambios de vestuario o escena",
        "40 fotos editadas en total",
        "Dirección de estilo",
        "Medio día de producción",
        "Fotos ilimitadas editadas",
      ],
    },
  ],
};

export const testimonials = {
  label: "Testimonios",
  aside: "Lo que dicen nuestros clientes",
  items: [
    {
      name: "Nombre Cliente",
      role: "Fundadora, Marca Uno",
      quote:
        "Nos guiaron en toda la sesión y las fotos quedaron exactamente como imaginábamos la marca. Las usamos en todo.",
    },
    {
      name: "Nombre Cliente",
      role: "Director, Marca Dos",
      quote:
        "Las fotos de producto duplicaron la calidad de nuestra tienda. Rápidos, ordenados y con muy buen ojo.",
    },
    {
      name: "Nombre Cliente",
      role: "Cliente particular",
      quote:
        "Nunca me había sentido cómodo frente a una cámara. Esta vez sí, y se nota en cada foto.",
    },
    {
      name: "Nombre Cliente",
      role: "Organizadora de eventos",
      quote:
        "Cubrieron todo el evento sin que nadie lo notara y la galería llegó en dos días. Ya los volvimos a contratar.",
    },
  ],
};

export const faq = {
  label: "Preguntas frecuentes",
  aside: "Lo esencial antes de agendar",
  items: [
    {
      q: "¿Cómo agendo una sesión?",
      a: "Escríbenos por correo o WhatsApp con la fecha que te interesa y el tipo de sesión. Te confirmamos disponibilidad el mismo día.",
    },
    {
      q: "¿Cuánto tardan en entregar las fotos?",
      a: "Las primeras fotos llegan en 48 horas y la galería completa en un máximo de 7 días.",
    },
    {
      q: "¿Puedo elegir la locación?",
      a: "Sí. Podemos trabajar en estudio, en exteriores o en tu negocio. Te ayudamos a elegir la mejor opción.",
    },
    {
      q: "¿Qué pasa si llueve?",
      a: "Reprogramamos sin costo o movemos la sesión a estudio, lo que prefieras.",
    },
  ],
};

export const cta = {
  title: ["Fotos para hoy,", "hechas por PhotoCan"],
  background: img("photocan-cta-bg", 2000, 1300),
  card: img("photocan-cta-card", 700, 900),
  button: { label: "Contactar", href: "mailto:hola@photocan.com" },
};
