import { disciplinas } from "@/lib/content";

/** Franja que corre sola con las disciplinas, separadas por el isotipo. */
export function Carrusel() {
  const lista = [...disciplinas, ...disciplinas];
  return (
    <section
      aria-label="Lo que hacemos"
      className="overflow-hidden bg-humo py-[6%] [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] max-md:py-14"
    >
      <ul className="carrusel flex w-max items-center">
        {lista.map((d, i) => (
          <li key={i} className="flex items-center" aria-hidden={i >= disciplinas.length}>
            <span className="titulo px-8 text-[clamp(22px,2.4vw,36px)] whitespace-nowrap text-black/80">{d}</span>
            <img src="/marca/isotipo_color.png" alt="" className="h-4 w-auto md:h-5" />
          </li>
        ))}
      </ul>
    </section>
  );
}
