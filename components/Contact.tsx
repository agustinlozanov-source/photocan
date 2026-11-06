import Image from "next/image";
import { cta, nav, site } from "@/lib/content";
import { Logo } from "./Navbar";
import { ArrowLink } from "./ui";

export function Contact() {
  return (
    <>
      <section id="contacto" className="bg-white px-4 md:px-8">
        <div className="relative isolate mx-auto flex min-h-[90svh] max-w-[1600px] flex-col items-center justify-center overflow-hidden rounded-md px-4 py-24 text-white">
          <Image src={cta.background} alt="" fill sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-black/40" />

          <h2 className="text-center text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.95] font-medium tracking-[-0.05em]">
            {cta.title[0]}
            <br />
            {cta.title[1]}
          </h2>

          <div className="mt-12 w-full max-w-[260px]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-md shadow-2xl">
              <Image src={cta.card} alt="" fill sizes="260px" className="object-cover" />
            </div>
            <ArrowLink href={cta.button.href} tone="light" className="mt-5">
              {cta.button.label}
            </ArrowLink>
          </div>
        </div>
      </section>

      <footer className="bg-white">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-16 text-sm md:grid-cols-4 md:px-8">
          <div>
            <Logo className="text-black [--logo-hole:#fff]" />
            <p className="mt-4 max-w-[220px] text-black/50">Estudio de fotografía · {site.city}</p>
          </div>
          <div>
            <p className="font-medium">Contacto</p>
            <a href={`mailto:${site.email}`} className="mt-3 block text-black/60 hover:text-black">
              {site.email}
            </a>
            <p className="mt-1 text-black/60">{site.phone}</p>
          </div>
          <div>
            <p className="font-medium">Menú</p>
            <ul className="mt-3 space-y-1">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-black/60 hover:text-black">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium">Redes</p>
            <a href={site.instagram} target="_blank" rel="noreferrer" className="mt-3 block text-black/60 hover:text-black">
              Instagram
            </a>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1600px] justify-between border-t border-black/10 px-4 py-6 text-xs text-black/50 md:px-8">
          <span>
            © {site.year} {site.name}
          </span>
          <a href="#inicio" className="hover:text-black">
            Volver arriba ↑
          </a>
        </div>
      </footer>
    </>
  );
}
