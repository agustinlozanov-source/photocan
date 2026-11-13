"use client";

import Link from "next/link";
import { useState } from "react";
import { IconoPortal } from "@/components/portal/Iconos";
import { whatsapp } from "@/lib/content";
import { cliente } from "@/lib/portal";

export default function Entrar() {
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);

  return (
    <div className="grid min-h-dvh bg-black text-white lg:grid-cols-[1.1fr_1fr]">
      <div className="hero-brillo relative hidden overflow-hidden p-12 lg:flex lg:flex-col">
        <img src="/marca/logo_color_fondo-oscuro.png" alt="Phot8can" className="h-9 w-auto self-start" />
        <div className="mt-auto max-w-[520px]">
          <p className="subtitulo text-[12px] text-white/80">Portal de cliente</p>
          <h1 className="titulo mt-4 text-[clamp(40px,4.4vw,72px)] leading-[0.98]">
            Tu página, siempre <span className="text-black">a la mano.</span>
          </h1>
          <ul className="mt-8 space-y-3 text-[15px] text-white/85">
            {[
              "Pide cambios escribiendo, hablando o con una foto.",
              "Tu dominio, tu hospedaje y tus accesos, a tu nombre.",
              "Pagos, facturas y complementos en un solo lugar.",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-black text-amarillo">
                  <IconoPortal nombre="check" className="size-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col px-6 py-10 sm:px-12">
        <img src="/marca/logo_color_fondo-oscuro.png" alt="Phot8can" className="h-8 w-auto self-start lg:hidden" />
        <div className="my-auto w-full max-w-[420px] self-center py-12">
          {!enviado ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEnviado(true);
              }}
            >
              <p className="etiqueta text-[11px] text-amarillo">Entrar</p>
              <h2 className="titulo mt-3 text-[clamp(30px,3vw,42px)] leading-[1.05]">Sin contraseñas.</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/65">
                Escribe tu correo y te mandamos un enlace para entrar. Funciona igual si es la primera vez o si olvidaste cómo
                entrar.
              </p>
              <label htmlFor="correo" className="mt-8 block text-[13px] font-semibold text-white/80">
                Tu correo
              </label>
              <input
                id="correo"
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder={cliente.correo}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-[15px] outline-none placeholder:text-white/30 focus:border-amarillo"
              />
              <button
                type="submit"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-amarillo px-6 py-4 text-[14px] font-bold text-black transition-colors hover:bg-white"
              >
                Mándame el enlace
                <IconoPortal nombre="flecha" className="size-4" />
              </button>
              <p className="mt-6 flex items-center gap-2 text-[12px] text-white/45">
                <IconoPortal nombre="candado" className="size-4" />
                El enlace vale 15 minutos y solo funciona una vez.
              </p>
            </form>
          ) : (
            <div>
              <span className="grid size-14 place-items-center rounded-full bg-amarillo text-black">
                <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
              <h2 className="titulo mt-6 text-[clamp(28px,3vw,40px)] leading-[1.05]">Revisa tu correo.</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/65">
                Te mandamos un enlace a <b className="text-white">{correo || cliente.correo}</b>. Ábrelo desde este mismo
                dispositivo para entrar.
              </p>
              <Link
                href="/portal/"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-amarillo px-6 py-4 text-[14px] font-bold text-black transition-colors hover:bg-white"
              >
                Abrir el enlace (demostración)
                <IconoPortal nombre="flecha" className="size-4" />
              </Link>
              <button onClick={() => setEnviado(false)} className="mt-4 w-full text-[13px] text-white/55 hover:text-white">
                Usar otro correo
              </button>
            </div>
          )}
        </div>
        <p className="text-center text-[12px] text-white/45">
          ¿Ya no tienes acceso a ese correo?{" "}
          <a href={whatsapp("Hola, ya no tengo acceso al correo de mi portal.")} target="_blank" rel="noopener" className="text-amarillo hover:underline">
            Escríbenos por WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
