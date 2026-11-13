"use client";

import { useSyncExternalStore } from "react";
import { etapas, indiceEtapa, PRECIO_BASE, textoVigencia, type Etapa } from "./pagina-viva";

// Revisa cada minuto por si cambia la etapa con la página abierta.
function suscribir(cb: () => void) {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
}

const HORA_BUILD = Date.now();

/**
 * Precio vigente según la fecha del visitante. En el HTML estático sale el precio del día
 * en que se compiló, y al cargar se corrige con la fecha real.
 */
export function usePrecio(): { precio: number; regular: number; etapa: Etapa | null; vigencia: string } {
  const i = useSyncExternalStore(
    suscribir,
    () => indiceEtapa(Date.now()),
    () => indiceEtapa(HORA_BUILD),
  );
  const etapa = i >= 0 ? etapas[i] : null;
  return { precio: etapa?.precio ?? PRECIO_BASE, regular: PRECIO_BASE, etapa, vigencia: textoVigencia(i) };
}
