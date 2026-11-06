import Image from "next/image";
import { about } from "@/lib/content";
import { Reveal } from "./Reveal";
import { ArrowLink, SectionLabel } from "./ui";

export function About() {
  return (
    <section id="nosotros" className="bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-24 md:px-8 md:py-32">
        <SectionLabel label={about.label} aside={about.aside} />

        <Reveal>
          <h2 className="mt-16 max-w-5xl text-[clamp(2rem,5vw,4.5rem)] leading-[1] font-medium tracking-[-0.045em] md:mt-24">
            {about.statement}
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <div className="relative aspect-[3/2] overflow-hidden rounded-md">
              <Image src={about.image} alt="" fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
            </div>
          </Reveal>

          <div className="flex flex-col gap-10 md:col-span-4 md:col-start-9">
            {about.steps.map((s, i) => (
              <Reveal key={s.tag} delay={i * 100}>
                <p className="text-sm font-medium">{s.tag}</p>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-black/50">{s.text}</p>
              </Reveal>
            ))}
            <ArrowLink href="#trabajos" className="mt-auto">
              Ver trabajos
            </ArrowLink>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-md bg-black/10 sm:grid-cols-3">
          {about.stats.map((s) => (
            <div key={s.label} className="bg-white pt-6 pr-6 pb-2 sm:p-6">
              <p className="text-[clamp(3rem,7vw,6rem)] leading-none font-medium tracking-[-0.06em]">{s.value}</p>
              <p className="mt-3 text-sm text-black/60">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
