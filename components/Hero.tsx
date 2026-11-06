import Image from "next/image";
import { hero, site } from "@/lib/content";
import { ArrowLink } from "./ui";

export function Hero() {
  return (
    <section id="inicio" className="relative isolate flex min-h-svh flex-col overflow-hidden bg-black text-white">
      <Image src={hero.image} alt="" fill preload sizes="100vw" className="-z-20 object-cover" />
      {/* Tinte cálido/frío como en el template */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-glow-orange via-glow-red to-glow-teal opacity-80 mix-blend-color" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-glow-orange/40 via-transparent to-glow-navy/60 mix-blend-multiply" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 pt-28 md:px-8 md:pt-36">
        <div className="rise grid gap-10 md:grid-cols-2">
          <div>
            <p className="max-w-sm text-lg leading-snug font-medium">
              {hero.tagline[0]}
              <br />
              {hero.tagline[1]} <span className="text-white/60">{hero.tagline[2]}</span>
            </p>
            <ArrowLink href={hero.cta.href} tone="light" className="mt-10">
              {hero.cta.label}
            </ArrowLink>
          </div>
        </div>

        <ul className="rise mt-auto pt-16 text-sm leading-relaxed" style={{ animationDelay: "150ms" }}>
          {hero.tags.map((t, i) => (
            <li key={t}>
              {i === 0 && <span className="text-white/60">01/ </span>}
              {t}
            </li>
          ))}
        </ul>

        <div className="rise pb-6 md:pb-8" style={{ animationDelay: "300ms" }}>
          <h1 className="mt-6 text-[17.5vw] leading-[0.8] font-bold tracking-[-0.06em] whitespace-nowrap select-none">
            {site.wordmark}
          </h1>
          <p className="mt-6 text-sm">{site.year}</p>
        </div>
      </div>
    </section>
  );
}
