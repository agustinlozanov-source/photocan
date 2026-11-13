"use client";

import { useState } from "react";
import { whatsapp } from "@/lib/content";

type Estado = "listo" | "enviando" | "enviado" | "error";

/** Campos de UTM que se guardan como origen del contacto. */
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/**
 * Formulario de contacto. Se envía a Netlify Forms (form "contacto", ver public/__forms.html)
 * y la función netlify/functions/submission-created.mjs lo reenvía al CRM.
 */
export function FormularioContacto({ origen, oscuro = false }: { origen: string; oscuro?: boolean }) {
  const [estado, setEstado] = useState<Estado>("listo");
  const [nombre, setNombre] = useState("");

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const datos = new FormData(form);
    const url = new URL(window.location.href);
    datos.set("form-name", "contacto");
    datos.set("origen", origen);
    datos.set("pagina", url.origin + url.pathname);
    datos.set("referencia", document.referrer);
    for (const k of UTM) datos.set(k, url.searchParams.get(k) ?? "");
    setNombre(String(datos.get("nombre") ?? "").split(" ")[0]);
    setEstado("enviando");
    try {
      const r = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(datos as unknown as Record<string, string>).toString(),
      });
      if (!r.ok) throw new Error(String(r.status));
      setEstado("enviado");
      form.reset();
    } catch {
      setEstado("error");
    }
  }

  const campo = `w-full rounded-xl border px-4 py-3.5 text-[15px] outline-none transition-colors ${
    oscuro
      ? "border-white/20 bg-white/[0.06] text-white placeholder:text-white/45 focus:border-amarillo"
      : "border-black/15 bg-white placeholder:text-black/40 focus:border-black"
  }`;
  const etiqueta = `mb-1.5 block text-[12px] font-semibold ${oscuro ? "text-white/70" : "text-black/60"}`;

  if (estado === "enviado") {
    return (
      <div className={`rounded-[24px] p-8 ${oscuro ? "bg-white text-black" : "bg-black text-white"}`} role="status">
        <span className="grid size-12 place-items-center rounded-full bg-amarillo text-[22px] text-black">✓</span>
        <h3 className="titulo mt-6 text-[clamp(26px,2.6vw,38px)] leading-tight">
          ¡Listo{nombre ? `, ${nombre}` : ""}! Ya estás con nosotros.
        </h3>
        <p className={`mt-3 text-[15px] leading-relaxed ${oscuro ? "text-black/70" : "text-white/70"}`}>
          Recibimos tus datos y en unos minutos te escribimos por WhatsApp. Si no quieres esperar, mándanos un mensaje
          ahora mismo.
        </p>
        <a
          href={whatsapp("Hola Phot8can, acabo de dejar mis datos en su página.")}
          target="_blank"
          rel="noopener"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-amarillo px-6 py-3.5 text-[14px] font-bold text-black hover:bg-white"
        >
          Escribir por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form name="contacto" onSubmit={enviar} className="space-y-4">
      {/* Trampa para bots: las personas no la ven. */}
      <p className="hidden" aria-hidden>
        <label>
          No llenes esto: <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <div>
        <label htmlFor="c-nombre" className={etiqueta}>
          Nombre
        </label>
        <input id="c-nombre" name="nombre" required autoComplete="name" placeholder="¿Cómo te llamas?" className={campo} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-whatsapp" className={etiqueta}>
            WhatsApp
          </label>
          <input
            id="c-whatsapp"
            name="whatsapp"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            pattern="[0-9+()\s-]{10,}"
            title="Escribe tu número a 10 dígitos"
            placeholder="868 000 0000"
            className={campo}
          />
        </div>
        <div>
          <label htmlFor="c-correo" className={etiqueta}>
            Correo
          </label>
          <input id="c-correo" name="correo" type="email" required autoComplete="email" placeholder="tu@correo.com" className={campo} />
        </div>
      </div>
      <div>
        <label htmlFor="c-negocio" className={etiqueta}>
          ¿Qué vende tu negocio? <span className="font-normal opacity-70">(opcional)</span>
        </label>
        <input id="c-negocio" name="negocio" placeholder="Ej. clínica dental, restaurante, despacho…" className={campo} />
      </div>
      <label className={`flex items-start gap-3 text-[13px] leading-snug ${oscuro ? "text-white/70" : "text-black/60"}`}>
        <input type="checkbox" name="acepta_privacidad" value="si" required className="mt-0.5 size-4 shrink-0 accent-[#f3af0e]" />
        <span>
          Acepto el{" "}
          <a href="/aviso-de-privacidad/" target="_blank" className="font-semibold underline underline-offset-2">
            aviso de privacidad
          </a>{" "}
          y que me contacten por WhatsApp y correo.
        </span>
      </label>
      <button
        type="submit"
        disabled={estado === "enviando"}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-amarillo px-6 py-4 text-[16px] font-bold text-black transition-colors hover:bg-white disabled:opacity-60"
      >
        {estado === "enviando" ? "Enviando…" : "Quiero que me contacten"}
        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </button>
      {estado === "error" && (
        <p className="text-[13px] font-semibold text-[#ff6b5b]" role="alert">
          No pudimos enviar tus datos.{" "}
          <a href={whatsapp("Hola Phot8can, quiero información de Página Viva.")} target="_blank" rel="noopener" className="underline">
            Escríbenos por WhatsApp
          </a>{" "}
          y te atendemos al momento.
        </p>
      )}
    </form>
  );
}
