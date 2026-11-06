"use client";

import { useEffect, useState } from "react";
import { nav, site } from "@/lib/content";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-1.5 text-[15px] font-bold tracking-tight ${className}`}>
      {/* Ícono provisional: cámara simplificada */}
      <svg viewBox="0 0 16 12" className="h-3 w-4" aria-hidden>
        <path d="M5 0h6l1.2 2H16v10H0V2h3.8L5 0Z" fill="currentColor" />
        <circle cx="8" cy="7" r="2.6" fill="var(--logo-hole, #000)" />
      </svg>
      {site.wordmark}
    </span>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const light = !scrolled || open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled && !open ? "bg-white/85 text-black backdrop-blur-md" : "text-white"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-8">
          <a href="#inicio" aria-label={site.name} style={{ ["--logo-hole" as string]: light ? "#c2410c" : "#fff" }}>
            <Logo />
          </a>
          <nav className="hidden items-center gap-8 text-sm lg:flex">
            {nav.slice(1).map((item) => (
              <a key={item.href} href={item.href} className="opacity-80 transition-opacity hover:opacity-100">
                {item.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="relative flex size-8 flex-col items-center justify-center gap-1.5 lg:hidden"
          >
            <span className={`block h-px w-5 bg-current transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
            <span className={`block h-px w-5 bg-current transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </header>

      {/* Menú a pantalla completa (móvil) */}
      <div
        className={`fixed inset-0 z-40 flex flex-col justify-end bg-neutral-900 px-4 pb-10 text-white transition-opacity duration-500 md:px-8 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="space-y-1">
          {nav.map((item, i) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between border-b border-white/10 py-3 text-4xl font-medium tracking-[-0.04em]"
              >
                {item.label}
                <span className="text-sm font-normal text-white/50">{String(i + 1).padStart(2, "0")}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-xs text-sm text-white/50">{site.email}</p>
      </div>
    </>
  );
}
