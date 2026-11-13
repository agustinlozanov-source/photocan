import type { IconoNombre } from "@/lib/pagina-viva";

/** Iconografía de línea para Página Viva (24×24, trazo de 1.6). */
const RUTAS: Record<IconoNombre, React.ReactNode> = {
  estrategia: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  diseno: (
    <>
      <path d="M4 20l4-1 11-11-3-3L5 16l-1 4Z" />
      <path d="M14 7l3 3" />
    </>
  ),
  paginas: (
    <>
      <rect x="7" y="3" width="13" height="16" rx="2" />
      <path d="M4 7v12a2 2 0 0 0 2 2h10" />
      <path d="M10 8h7M10 12h7M10 16h4" />
    </>
  ),
  medicion: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  google: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v11H9l-5 4V5Z" />
      <path d="M8 10h8M8 13h5" />
    </>
  ),
  legal: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  viva: (
    <>
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    </>
  ),
  tienda: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  pos: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8v4H8zM8 15h2M12 15h2M8 18h2M12 18h2M16 15v3" />
    </>
  ),
  admin: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </>
  ),
  citas: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4M8 14h3v3H8z" />
    </>
  ),
  reservas: (
    <>
      <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7Z" />
      <path d="M14 5v14" strokeDasharray="2 2" />
    </>
  ),
  idioma: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z" />
    </>
  ),
  mas: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  camara: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v11H4V8Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10 5-3v10l-5-3" />
    </>
  ),
  marca: (
    <>
      <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3Z" />
    </>
  ),
  cohete: (
    <>
      <path d="M12 15c5-3 7-7 7-12-5 0-9 2-12 7l5 5Z" />
      <path d="M9 13l-3 1-2 4 4-2 1-3M11 15l-1 3 4-2 1-3" />
      <circle cx="14.5" cy="8.5" r="1.5" />
    </>
  ),
  cuidado: (
    <>
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
    </>
  ),
};

export function Icono({ nombre, className = "size-5" }: { nombre: IconoNombre; className?: string }) {
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
