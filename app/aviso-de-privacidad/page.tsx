import type { Metadata } from "next";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";

export const metadata: Metadata = {
  title: "Aviso de privacidad · Phot8can",
  description: "Cómo Phot8can recaba, usa y protege tus datos personales.",
};

// TODO: completar los datos marcados con [ ] con la información legal de Phot8can
// y validar el texto con un abogado antes de darlo por final.
const RESPONSABLE = {
  nombre: "[Razón social o nombre del responsable]",
  domicilio: "[Domicilio completo]",
  correo: "[correo de privacidad]",
  actualizado: "13 de noviembre de 2026",
};

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-black/10 py-8">
      <h2 className="text-[clamp(20px,1.8vw,26px)] font-bold">{titulo}</h2>
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-black/75 [&_li]:ml-5 [&_li]:list-disc">{children}</div>
    </section>
  );
}

export default function AvisoPrivacidad() {
  return (
    <>
      <Encabezado />
      <main className="relative z-10 rounded-b-[28px] bg-white md:mb-[var(--alto-pie,0px)]">
        <div className="bg-black pt-36 pb-16 text-white">
          <div className="contenedor">
            <p className="etiqueta text-amarillo">Legal</p>
            <h1 className="titulo mt-4 text-[clamp(40px,5vw,80px)] leading-none">Aviso de privacidad</h1>
            <p className="mt-6 text-[14px] text-white/60">Última actualización: {RESPONSABLE.actualizado}</p>
          </div>
        </div>
        <div className="contenedor max-w-[860px] py-12">
          <p className="text-[16px] leading-relaxed">
            {RESPONSABLE.nombre}, conocido comercialmente como Phot8can, con domicilio en {RESPONSABLE.domicilio}, es
            responsable del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos
            Personales en Posesión de los Particulares.
          </p>

          <Seccion titulo="Datos que recabamos">
            <p>Cuando nos dejas tus datos en este sitio, en WhatsApp o por correo, podemos recabar:</p>
            <ul>
              <li>Nombre.</li>
              <li>Número de teléfono o WhatsApp.</li>
              <li>Correo electrónico.</li>
              <li>Giro o nombre de tu negocio.</li>
              <li>La página desde la que nos contactaste y la campaña que te trajo, si la hay.</li>
            </ul>
            <p>No recabamos datos personales sensibles.</p>
          </Seccion>

          <Seccion titulo="Para qué usamos tus datos">
            <p>Finalidades necesarias para atenderte:</p>
            <ul>
              <li>Contactarte para dar seguimiento a tu solicitud.</li>
              <li>Preparar y enviarte cotizaciones.</li>
              <li>Prestar y dar soporte a los servicios que contrates.</li>
              <li>Facturar y gestionar pagos.</li>
            </ul>
            <p>Finalidades adicionales, que puedes rechazar:</p>
            <ul>
              <li>Enviarte promociones, novedades y contenido de Phot8can.</li>
              <li>Medir y mejorar nuestras campañas y este sitio.</li>
            </ul>
            <p>
              Si no quieres que usemos tus datos para las finalidades adicionales, escríbenos a {RESPONSABLE.correo}. Esto no
              afecta los servicios que contrates.
            </p>
          </Seccion>

          <Seccion titulo="Con quién compartimos tus datos">
            <p>
              No vendemos tus datos. Solo los compartimos con proveedores que nos ayudan a operar, como el servicio de
              hospedaje del sitio, nuestro sistema de gestión de clientes (CRM) y la plataforma de pagos, que los tratan por
              nuestra cuenta y con medidas de seguridad. También podemos compartirlos cuando una autoridad competente lo
              requiera conforme a la ley.
            </p>
          </Seccion>

          <Seccion titulo="Cookies y tecnologías de medición">
            <p>
              Este sitio puede usar cookies y herramientas de medición, como Google Analytics o el pixel de Meta, para
              saber cómo se usa y medir nuestras campañas. Puedes desactivarlas desde la configuración de tu navegador.
            </p>
          </Seccion>

          <Seccion titulo="Tus derechos ARCO">
            <p>
              Tienes derecho a acceder a tus datos, rectificarlos, cancelarlos u oponerte a su uso (derechos ARCO), así como a
              revocar tu consentimiento. Para hacerlo, envía tu solicitud a {RESPONSABLE.correo} con tu nombre, un medio para
              responderte, una identificación y la descripción de lo que solicitas. Te responderemos en un plazo máximo de 20
              días hábiles.
            </p>
          </Seccion>

          <Seccion titulo="Cambios a este aviso">
            <p>
              Si actualizamos este aviso, publicaremos la nueva versión en esta misma página con su fecha de actualización.
            </p>
          </Seccion>
        </div>
      </main>
      <Pie />
    </>
  );
}
