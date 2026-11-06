import { faq } from "@/lib/content";
import { SectionLabel } from "./ui";

export function Faq() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1600px] px-4 pb-24 md:px-8 md:pb-32">
        <SectionLabel label={faq.label} aside={faq.aside} />
        <div className="mt-12 md:ml-[33.333%]">
          {faq.items.map((item) => (
            <details key={item.q} className="group border-b border-black/10">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium tracking-tight md:text-2xl [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="text-2xl font-light transition-transform duration-300 group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-6 text-sm leading-relaxed text-black/60">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
