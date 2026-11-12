import { BodasBloque } from "@/components/BodasBloque";
import { Cargador } from "@/components/Cargador";
import { Carrusel } from "@/components/Carrusel";
import { Contacto } from "@/components/Contacto";
import { Encabezado } from "@/components/Encabezado";
import { Hero } from "@/components/Hero";
import { ImagenExpande } from "@/components/ImagenExpande";
import { Nosotros } from "@/components/Nosotros";
import { PaginaVivaBloque } from "@/components/PaginaVivaBloque";
import { Pie } from "@/components/Pie";
import { Proceso } from "@/components/Proceso";
import { Proyectos } from "@/components/Proyectos";
import { Servicios } from "@/components/Servicios";

export default function Inicio() {
  return (
    <>
      <Cargador />
      <Encabezado />
      <main className="relative z-10 overflow-clip rounded-b-[28px] bg-humo md:mb-[var(--alto-pie,0px)]">
        <Hero />
        <Carrusel />
        <ImagenExpande />
        <Nosotros />
        <Proyectos />
        <PaginaVivaBloque />
        <Proceso />
        <Servicios />
        <BodasBloque />
        <Contacto />
      </main>
      <Pie />
    </>
  );
}
