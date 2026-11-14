// POST /api/stripe/webhook — avisos de Stripe. Registrar en Stripe → Developers → Webhooks
// con los eventos: checkout.session.completed, checkout.session.async_payment_succeeded,
// checkout.session.async_payment_failed y checkout.session.expired.
import { admin } from "../lib/sitios.mjs";
import { cumplirPago, stripe } from "../lib/pagos.mjs";

export const config = { path: "/api/stripe/webhook" };

const manejar = async (req) => {
  const secreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secreto) return new Response("Falta STRIPE_WEBHOOK_SECRET", { status: 500 });

  const cuerpo = await req.text(); // crudo: la firma se calcula sobre los bytes exactos
  let evento;
  try {
    evento = await stripe().webhooks.constructEventAsync(cuerpo, req.headers.get("stripe-signature"), secreto);
  } catch (e) {
    console.error("Firma de Stripe inválida:", e.message);
    return new Response("Firma inválida", { status: 400 });
  }

  const sesion = evento.data.object;
  try {
    switch (evento.type) {
      case "checkout.session.completed":
        if (sesion.payment_status === "paid" || sesion.payment_status === "no_payment_required") {
          await cumplirPago(sesion.id, { suscripcionId: typeof sesion.subscription === "string" ? sesion.subscription : null });
        } else {
          // SPEI: ya tiene las instrucciones, falta que llegue la transferencia.
          await admin().from("pagos").update({ estado: "esperando_transferencia" }).eq("stripe_sesion_id", sesion.id);
        }
        break;
      case "checkout.session.async_payment_succeeded":
        await cumplirPago(sesion.id);
        break;
      case "checkout.session.async_payment_failed":
        await admin().from("pagos").update({ estado: "fallido" }).eq("stripe_sesion_id", sesion.id);
        break;
      case "checkout.session.expired":
        await admin().from("pagos").update({ estado: "expirado" }).eq("stripe_sesion_id", sesion.id).eq("estado", "pendiente");
        break;
    }
  } catch (e) {
    console.error(`Error al procesar ${evento.type}:`, e);
    return new Response("Error al procesar", { status: 500 }); // Stripe reintenta
  }
  return new Response("ok", { status: 200 });
};

export default manejar;
