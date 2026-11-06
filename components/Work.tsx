import Image from "next/image";
import { work } from "@/lib/content";
import { Reveal } from "./Reveal";
import { ArrowIcon, ArrowLink, SectionLabel } from "./ui";

export function Work() {
  return (
    <section id="trabajos" className="bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-24 md:px-8 md:py-32">
        <SectionLabel label={work.label} aside={work.aside} />

        <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.05em] text-black/50">
            {work.title[0]}
            <br />
            {work.title[1]}
          </h2>
          <ArrowLink href={work.cta.href}>{work.cta.label}</ArrowLink>
        </div>

        <div className="mt-16 grid gap-x-6 gap-y-14 md:grid-cols-2">
          {work.projects.map((p, i) => (
            <Reveal key={p.name} delay={(i % 2) * 120} className={i % 2 === 1 ? "md:mt-32" : ""}>
              <a href="#contacto" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-neutral-50">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <p className="text-lg font-medium tracking-tight">{p.name}</p>
                    <p className="text-sm text-black/50">{p.category}</p>
                  </div>
                  <span className="text-sm text-black/40">{String(i + 1).padStart(2, "0")}</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <a href="#contacto" className="mt-16 inline-flex items-center gap-2 text-sm font-medium">
          Ver todos ({String(work.projects.length).padStart(2, "0")}) <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
