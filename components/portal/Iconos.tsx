/** Iconos de línea del portal (24×24, trazo 1.6), con el mismo trazo que Página Viva. */
const RUTAS = {
  inicio: <path d="M4 11 12 4l8 7v9h-5v-6H9v6H4v-9Z" />,
  briefing: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 3v2h6V3M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v11H9l-5 4V5Z" />
      <path d="M8 10h8M8 13h5" />
    </>
  ),
  tienda: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  expediente: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  dominio: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
    </>
  ),
  pagos: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </>
  ),
  salir: <path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  clip: <path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7" />,
  enviar: <path d="M4 12 20 4l-6 16-3-7-7-1Z" />,
  check: <path d="m5 12 5 5 9-10" />,
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  candado: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  descarga: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  subir: <path d="M12 20V9M7 14l5-5 5 5M5 4h14" />,
  usuario: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  base: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>
  ),
  rayo: <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />,
  ojo: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  regresar: <path d="M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3" />,
  telefono: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  equipo: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6" />
    </>
  ),
  chispa: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
  mas: <path d="M12 5v14M5 12h14" />,
  cerrar: <path d="M6 6l12 12M18 6 6 18" />,
  flecha: <path d="M5 12h14M13 6l6 6-6 6" />,
  archivo: (
    <>
      <path d="M14 3H6v18h12V7l-4-4Z" />
      <path d="M14 3v4h4" />
    </>
  ),
  imagen: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 16-5-5-9 9" />
    </>
  ),
  campana: <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2ZM10 21h4" />,
  grafica: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
} as const;

export type IconoPortalNombre = keyof typeof RUTAS;

export function IconoPortal({ nombre, className = "size-5" }: { nombre: IconoPortalNombre; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {RUTAS[nombre]}
    </svg>
  );
}
