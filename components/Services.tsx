import Image from "next/image";
import { services } from "@/lib/content";
import { Reveal } from "./Reveal";
import { ArrowLink, SectionLabel } from "./ui";

export function Services() {
  return (
    <section id="servicios" className="bg-neutral-900 text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-24 md:px-8 md:py-32">
        <SectionLabel label={services.label} aside={services.aside} tone="light" />

        <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.05] font-medium tracking-[-0.04em]">
            {services.intro}
          </p>
          <ArrowLink href="#precios" tone="light">
            Ver precios
          </ArrowLink>
        </div>

        <div className="mt-20 space-y-20 md:space-y-28">
          {services.items.map((s, i) => (
            <Reveal key={s.title}>
              <article className="grid gap-6 border-t border-white/10 pt-6 md:grid-cols-12">
                <p className="text-4xl font-medium tracking-[-0.04em] text-white/40 md:col-span-2">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div className="relative aspect-[16/10] overflow-hidden rounded-md md:col-span-6">
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover opacity-80"
                  />
                </div>
                <div className="flex flex-col md:col-span-3 md:col-start-10">
                  <h3 className="text-[clamp(2rem,3.5vw,3rem)] leading-none font-medium tracking-[-0.04em]">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm text-white/50">{s.subtitle}</p>
                  <p className="mt-6 text-sm leading-relaxed text-white/70">{s.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
