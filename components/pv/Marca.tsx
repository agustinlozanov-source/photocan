"use client";

import { mxn } from "@/lib/pagina-viva";
import { usePrecio } from "@/lib/precio";

/** La píldora amarilla de la campaña: "BUEN FIN · $11,900". Si no hay campaña, muestra `respaldo`. */
export function PildoraPromo({ respaldo, oscura = false }: { respaldo?: React.ReactNode; oscura?: boolean }) {
  const { etapa } = usePrecio();
  if (!etapa) return respaldo ? <>{respaldo}</> : null;
  return (
    <span
      className={`etiqueta inline-flex rounded-full px-5 py-2.5 text-[13px] ${oscura ? "bg-black text-amarillo" : "bg-amarillo text-black"}`}
    >
      {etapa.nombre} · {mxn(etapa.precio)}
    </span>
  );
}

/** Ventana de navegador como en la campaña: dos puntos de contorno y uno amarillo. */
export function Navegador({
  url,
  oscuro = false,
  className = "",
  children,
}: {
  url?: string;
  oscuro?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const borde = oscuro ? "border-white" : "border-black";
  return (
    <div className={`overflow-hidden rounded-[18px] border-2 ${borde} ${oscuro ? "bg-[#1c1c1c] text-white" : "bg-white text-black"} ${className}`}>
      <div className={`flex items-center gap-2 border-b-2 ${borde} px-4 py-2.5`}>
        <span className={`size-3 rounded-full border-[1.5px] ${borde}`} />
        <span className={`size-3 rounded-full border-[1.5px] ${borde}`} />
        <span className="size-3 rounded-full bg-amarillo" />
        {url && <span className={`ml-3 rounded-full border-[1.5px] ${borde} px-3 py-0.5 text-[12px]`}>{url}</span>}
      </div>
      {children}
    </div>
  );
}

export function BarraAmarilla({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block h-2.5 w-[clamp(120px,14vw,200px)] bg-amarillo ${className}`} />;
}
