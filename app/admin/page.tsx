"use client";

import { MarcoAdmin } from "@/components/admin/MarcoAdmin";

const SECCIONES = [
  { href: "/admin/equipo/", titulo: "Equipo", texto: "Quién entra al superadministrador, su puesto, su rol y quién firma.", listo: true },
  { href: "", titulo: "Clientes", texto: "Cada cliente, su página, su plan, sus pagos y sus funciones.", listo: false },
  { href: "", titulo: "Crear páginas", texto: "El mismo motor del portal, operado por el equipo: de una muestra a la página completa.", listo: false },
  { href: "", titulo: "Números del negocio", texto: "Ventas, planes activos, costos de fabricación y margen.", listo: false },
];

export default function InicioAdmin() {
  return (
    <MarcoAdmin>
      {() => (
        <div className="mx-auto max-w-[1100px] px-[max(16px,3vw)] py-10">
          <p className="etiqueta text-[11px] text-black/45">Superadministrador</p>
          <h1 className="titulo mt-2 text-[clamp(30px,3.6vw,46px)] leading-[1.02]">
            La máquina de Phot8can. <span className="text-black/35">En un solo lugar.</span>
          </h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SECCIONES.map((s) =>
              s.listo ? (
                <a key={s.titulo} href={s.href} className="group rounded-[22px] bg-black p-6 text-white transition-transform hover:-translate-y-0.5">
                  <p className="text-[20px] font-bold">{s.titulo}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/60">{s.texto}</p>
                  <p className="mt-6 text-[13px] font-bold text-amarillo">Abrir →</p>
                </a>
              ) : (
                <div key={s.titulo} className="rounded-[22px] border border-dashed border-black/15 bg-white p-6">
                  <p className="text-[20px] font-bold text-black/70">{s.titulo}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-black/50">{s.texto}</p>
                  <p className="mt-6 text-[12px] font-bold text-black/35">Próximamente</p>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </MarcoAdmin>
  );
}
