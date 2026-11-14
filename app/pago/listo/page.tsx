"use client";

import { useEffect, useState } from "react";
import { useParametro } from "@/lib/portal-estado";

type Estado = { estado: "pendiente" | "esperando_transferencia" | "pagado" | "fallido" | "expirado"; correo: string; modo: string };

/** A donde regresa Stripe después de pagar. Espera el aviso de pago y le dice al cliente qué sigue. */
export default function PagoListo() {
  const sesion = useParametro("sesion");
  const [d, setD] = useState<Estado | null>(null);

  useEffect(() => {
    if (!sesion) return;
    let vivo = true;
    let intentos = 0;
    const consultar = async () => {
      const r = await fetch(`/api/pago/estado?sesion=${encodeURIComponent(sesion)}`).catch(() => null);
      const datos = r?.ok ? ((await r.json()) as Estado) : null;
      if (!vivo) return;
      if (datos) setD(datos);
      intentos += 1;
      // El aviso de Stripe tarda unos segundos; seguimos preguntando un rato.
      if ((!datos || datos.estado === "pendiente") && intentos < 20) setTimeout(consultar, 3000);
    };
    consultar();
    return () => {
      vivo = false;
    };
  }, [sesion]);

  const pagado = d?.estado === "pagado";
  const transferencia = d?.estado === "esperando_transferencia";

  return (
    <main className="grid min-h-dvh place-items-center bg-black px-6 py-16 text-white">
      <div className="hero-brillo pointer-events-none fixed inset-0 opacity-30" />
      <div className="relative w-full max-w-[560px] text-center">
        <img src="/marca/logo_color_fondo-oscuro.png" alt="Phot8can" className="mx-auto h-9 w-auto" />
        <span className={`mx-auto mt-10 grid size-20 place-items-center rounded-full ${pagado || transferencia ? "bg-amarillo text-black" : "bg-white/10"}`}>
          {pagado ? (
            <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="m5 12 5 5 9-10" />
            </svg>
          ) : (
            <span className="size-3 animate-ping rounded-full bg-amarillo" />
          )}
        </span>
        <h1 className="titulo mt-8 text-[clamp(32px,5vw,52px)] leading-[1.02]">
          {pagado ? "¡Pago recibido!" : transferencia ? "Ya casi." : d?.estado === "fallido" ? "El pago no se completó." : "Confirmando tu pago…"}
        </h1>
        <p className="mx-auto mt-4 max-w-[44ch] text-[16px] leading-relaxed text-white/70">
          {pagado
            ? `Te mandamos un correo a ${d?.correo} con tu acceso al portal. Ahí empiezas tu brief: en unos 20 minutos nos cuentas todo de tu negocio.`
            : transferencia
              ? `Cuando llegue tu transferencia te mandamos a ${d?.correo} el acceso a tu portal. Stripe también te mandó los datos para transferir.`
              : d?.estado === "fallido"
                ? "No te cobramos nada. Puedes intentarlo de nuevo o escribirnos por WhatsApp y lo resolvemos contigo."
                : "Esto toma unos segundos. No cierres esta página."}
        </p>
        {pagado && (
          <a href="/portal/entrar/" className="mt-8 inline-flex rounded-full bg-amarillo px-7 py-4 text-[15px] font-bold text-black hover:bg-white">
            Ir a mi portal
          </a>
        )}
        <p className="mt-10 text-[13px] text-white/45">
          ¿Dudas? Escríbenos por WhatsApp al{" "}
          <a href="https://wa.me/528681079743" target="_blank" rel="noopener" className="text-amarillo underline-offset-2 hover:underline">
            868 107 9743
          </a>
        </p>
      </div>
    </main>
  );
}
