export function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden className={`size-3 ${className}`}>
      <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Enlace subrayado con flecha, como los CTA del template. */
export function ArrowLink({
  href,
  children,
  tone = "dark",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  const color = tone === "light" ? "text-white border-white/50 hover:border-white" : "text-black border-black/30 hover:border-black";
  return (
    <a
      href={href}
      className={`group flex w-full max-w-[260px] items-center justify-between border-b pb-3 text-sm transition-colors ${color} ${className}`}
    >
      <span>{children}</span>
      <ArrowIcon className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

/** Fila con etiqueta de sección a la izquierda y dato a la derecha, con línea superior. */
export function SectionLabel({
  label,
  aside,
  tone = "dark",
}: {
  label: string;
  aside?: string;
  tone?: "dark" | "light";
}) {
  const border = tone === "light" ? "border-white/16 text-white" : "border-black/10 text-black";
  const muted = tone === "light" ? "text-white/50" : "text-black/60";
  return (
    <div className={`flex items-center justify-between border-t pt-5 text-sm font-medium ${border}`}>
      <span>{label}</span>
      {aside && <span className={muted}>{aside}</span>}
    </div>
  );
}
