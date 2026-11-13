import type { EstadoContrato } from "@/lib/portal-estado";
import { IconoPortal, type IconoPortalNombre } from "./Iconos";

export function Tarjeta({
  children,
  className = "",
  oscura = false,
}: {
  children: React.ReactNode;
  className?: string;
  oscura?: boolean;
}) {
  return (
    <section
      className={`min-w-0 rounded-[22px] p-[clamp(18px,2vw,26px)] ${
        oscura ? "bg-black text-white" : "border border-black/[0.07] bg-white"
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function TituloTarjeta({
  icono,
  children,
  accion,
  oscura = false,
}: {
  icono?: IconoPortalNombre;
  children: React.ReactNode;
  accion?: React.ReactNode;
  oscura?: boolean;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 text-[15px] font-bold">
        {icono && (
          <span className={`grid size-8 place-items-center rounded-full ${oscura ? "bg-white/10 text-amarillo" : "bg-humo"}`}>
            <IconoPortal nombre={icono} className="size-4" />
          </span>
        )}
        {children}
      </h2>
      {accion}
    </div>
  );
}

export function Encabezado({ etiqueta, titulo, children }: { etiqueta: string; titulo: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="etiqueta text-[11px] text-black/45">{etiqueta}</p>
        <h1 className="titulo mt-2 text-[clamp(28px,3.2vw,44px)] leading-[1.02]">{titulo}</h1>
      </div>
      {children}
    </header>
  );
}

/** Barra de uso, por ejemplo "3 de 10 cambios simples". */
export function Medidor({
  usado,
  total,
  etiqueta,
  oscuro = false,
  porcentaje = false,
}: {
  usado: number;
  total: number;
  etiqueta: string;
  oscuro?: boolean;
  porcentaje?: boolean;
}) {
  const pct = total === 0 ? 0 : Math.min(100, (usado / total) * 100);
  const lleno = !porcentaje && total > 0 && usado >= total;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className={oscuro ? "text-white/70" : "text-black/60"}>{etiqueta}</span>
        <span className="font-bold tabular-nums">
          {porcentaje ? `${Math.round(pct)}%` : total === 0 ? "No incluido" : `${usado} de ${total}`}
        </span>
      </div>
      <div className={`mt-2 h-2 overflow-hidden rounded-full ${oscuro ? "bg-white/10" : "bg-black/[0.06]"}`}>
        <div
          className={`h-full rounded-full transition-[width] duration-700 ${lleno ? "bg-red-500" : "bg-amarillo"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Estado({ estado }: { estado: EstadoContrato | "pendiente" | "revision" }) {
  const t = {
    activo: { texto: "Activo", clase: "bg-black text-white", punto: "bg-amarillo" },
    preparacion: { texto: "En preparación", clase: "border-[1.5px] border-black text-black", punto: "bg-amarillo animate-pulse" },
    pendiente: { texto: "Pendiente", clase: "border-[1.5px] border-dashed border-black/40 text-black/60", punto: "bg-black/30" },
    revision: { texto: "En revisión", clase: "bg-amarillo text-black", punto: "bg-black" },
  }[estado];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${t.clase}`}>
      <span className={`size-1.5 rounded-full ${t.punto}`} />
      {t.texto}
    </span>
  );
}

export function BotonPortal({
  children,
  onClick,
  href,
  tono = "negro",
  className = "",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  tono?: "negro" | "amarillo" | "contorno" | "claro";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const tonos = {
    negro: "bg-black text-white hover:bg-amarillo hover:text-black",
    amarillo: "bg-amarillo text-black hover:bg-black hover:text-white",
    contorno: "border-[1.5px] border-black/15 text-black hover:border-black",
    claro: "bg-white text-black hover:bg-amarillo",
  };
  const clase = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[13px] font-bold transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${tonos[tono]} ${className}`;
  if (href)
    return (
      <a href={href} className={clase}>
        {children}
      </a>
    );
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={clase}>
      {children}
    </button>
  );
}

export const precio = (n: number | null, sufijo = "") =>
  n === null
    ? "Por definir"
    : n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }) + sufijo;
