"use client";

import { useEffect, useState } from "react";
import { testimonials } from "@/lib/content";
import { SectionLabel } from "./ui";

export function Testimonials() {
  const items = testimonials.items;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % items.length), 6000);
    return () => clearInterval(id);
  }, [paused, items.length]);

  const t = items[active];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="bg-white" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mx-auto max-w-[1600px] px-4 py-24 md:px-8 md:py-32">
        <SectionLabel label={testimonials.label} aside={testimonials.aside} />

        <div className="mt-16 grid gap-10 md:grid-cols-12">
          <ul className="space-y-3 md:col-span-4">
            {items.map((item, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className={`text-left transition-opacity ${i === active ? "opacity-100" : "opacity-30 hover:opacity-60"}`}
                >
                  <span className="block text-sm font-medium">{item.name}</span>
                  <span className="block text-sm text-black/60">{item.role}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="md:col-span-8">
            <blockquote
              key={active}
              className="rise text-[clamp(1.5rem,3vw,2.75rem)] leading-[1.1] font-medium tracking-[-0.035em]"
              style={{ animationDuration: "0.8s" }}
            >
              “{t.quote}”
            </blockquote>
            <div className="mt-10 flex items-center justify-between text-sm">
              <p>
                <span className="font-medium">{t.name}</span>
                <span className="text-black/50">, {t.role}</span>
              </p>
              <p className="tabular-nums text-black/50">
                {pad(active + 1)} / {pad(items.length)}
              </p>
            </div>
            <div className="mt-4 flex gap-1">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Testimonio ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-0.5 flex-1 transition-colors ${i === active ? "bg-black" : "bg-black/10"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
