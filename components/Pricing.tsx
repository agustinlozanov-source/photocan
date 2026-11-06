import { pricing } from "@/lib/content";
import { Reveal } from "./Reveal";
import { ArrowLink, SectionLabel } from "./ui";

export function Pricing() {
  return (
    <section id="precios" className="bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-24 md:px-8 md:py-32">
        <SectionLabel label={pricing.label} aside={pricing.aside} />

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {pricing.plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 100}>
              <div
                className={`flex h-full flex-col rounded-md p-6 md:p-8 ${
                  plan.featured ? "bg-neutral-900 text-white" : "bg-neutral-50 text-black"
                }`}
              >
                <p className="text-sm font-medium">{plan.name}</p>
                <p className={`mt-2 max-w-[220px] text-sm ${plan.featured ? "text-white/50" : "text-black/50"}`}>
                  {plan.description}
                </p>

                <p className="mt-10 flex items-start">
                  <span className="mt-1 text-sm">{pricing.currency}</span>
                  <span className="text-5xl font-medium tracking-[-0.05em]">{plan.price}</span>
                  <span className={`mt-auto ml-2 mb-1 text-sm ${plan.featured ? "text-white/60" : "text-black/60"}`}>
                    {plan.unit}
                  </span>
                </p>

                <ArrowLink href="#contacto" tone={plan.featured ? "light" : "dark"} className="mt-8">
                  Reservar
                </ArrowLink>

                <p className="mt-10 text-sm font-medium">Incluye</p>
                <ul className={`mt-4 space-y-3 text-sm ${plan.featured ? "text-white/60" : "text-black/60"}`}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span aria-hidden>+</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
