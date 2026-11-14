// Cobro con Stripe Checkout: el total se arma al momento con los precios del catálogo
// de Supabase (nunca con lo que mande el navegador). No hace falta crear productos en Stripe.
//
// Variables de entorno en Netlify:
//   STRIPE_SECRET_KEY      sk_test_… para probar, sk_live_… para cobrar
//   STRIPE_WEBHOOK_SECRET  whsec_… del aviso de pagos (/api/stripe/webhook)

import Stripe from "stripe";
import campanas from "../../lib/campanas.json" with { type: "json" };
import { admin } from "./sitios.mjs";

let _stripe;
export function stripe() {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new Error("Falta STRIPE_SECRET_KEY en las variables de entorno de Netlify.");
  return (_stripe ??= new Stripe(k));
}

const centavos = (pesos) => Math.round(Number(pesos) * 100);

/** Campaña vigente cuyo código coincide (o null). */
export function campanaVigente(codigo, ahora = Date.now()) {
  const limpio = String(codigo ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();
  if (!limpio) return null;
  const e = campanas.etapas.find((x) => ahora <= Date.parse(x.hasta));
  return e && e.codigo === limpio ? e : null;
}

/** Tasa de IVA en Stripe: se crea una sola vez y se guarda en ajustes. */
async function tasaIva() {
  const clave = `stripe_iva_${Math.round(campanas.iva * 100)}_${(process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live") ? "live" : "test"}`;
  const { data } = await admin().from("ajustes").select("valor").eq("clave", clave).maybeSingle();
  if (data?.valor?.id) return data.valor.id;
  const t = await stripe().taxRates.create({
    display_name: "IVA",
    description: `IVA ${Math.round(campanas.iva * 100)}% (región fronteriza)`,
    percentage: campanas.iva * 100,
    inclusive: false,
    country: "MX",
  });
  await admin().from("ajustes").upsert({ clave, valor: { id: t.id } });
  return t.id;
}

/**
 * Arma el cobro.
 * modo "unico": Página Viva y complementos de pago único (con meses sin intereses o SPEI).
 * modo "mensual": suscripción con cargo automático (agentes, planes, base de datos, hospedaje).
 */
export async function crearCobro({ modo, ids, codigo, metodo, nombre, correo, negocio, organizacionId, origen }) {
  const { data: productos, error } = await admin().from("productos").select("*").in("id", ids).eq("activo", true);
  if (error) throw new Error("No pudimos leer el catálogo.");
  const encontrados = new Map(productos.map((p) => [p.id, p]));
  const faltan = ids.filter((id) => !encontrados.has(id));
  if (faltan.length) return { error: `Hay conceptos que ya no están disponibles: ${faltan.join(", ")}.` };

  const lista = ids.map((id) => encontrados.get(id));
  const cotizar = lista.filter((p) => p.precio_mxn === null || p.incluye?.desde);
  if (cotizar.length)
    return { error: `Estos conceptos se cotizan antes de pagar: ${cotizar.map((p) => p.nombre).join(", ")}. Agenda una videollamada y te los confirmamos.`, cotizar: true };

  const deModo = lista.filter((p) => (modo === "mensual" ? p.cobro === "mensual" : p.cobro !== "mensual"));
  if (deModo.length !== lista.length) return { error: "Lo mensual y lo de pago único se pagan por separado." };

  const campana = modo === "unico" ? campanaVigente(codigo) : null;
  const items = deModo.map((p) => {
    const precio = p.id === "pagina-viva" && campana ? campana.precio : Number(p.precio_mxn);
    return { producto_id: p.id, nombre: p.id === "pagina-viva" && campana ? `Página Viva · ${campana.nombre}` : p.nombre, precio_mxn: precio, cobro: p.cobro, automatico: p.automatico };
  });
  const sinCosto = items.filter((i) => i.precio_mxn === 0);
  const conCosto = items.filter((i) => i.precio_mxn > 0);
  if (!conCosto.length) return { error: "No hay nada que cobrar." };

  const subtotal = conCosto.reduce((s, i) => s + i.precio_mxn, 0);
  const iva = Math.round(subtotal * campanas.iva * 100) / 100;

  const { data: pago, error: e2 } = await admin()
    .from("pagos")
    .insert({
      organizacion_id: organizacionId ?? null,
      correo,
      nombre,
      negocio: negocio || null,
      modo,
      metodo: modo === "unico" ? metodo : "tarjeta",
      items: conCosto,
      sin_costo: sinCosto,
      codigo: campana?.codigo ?? null,
      subtotal_mxn: subtotal,
      iva_mxn: iva,
      total_mxn: subtotal + iva,
    })
    .select("id")
    .single();
  if (e2) throw new Error(`No se pudo registrar el pago: ${e2.message}`);

  const s = stripe();
  const cliente = await s.customers.create({ email: correo, name: nombre || undefined, metadata: { pago_id: pago.id, negocio: negocio || "" } });
  const iva_id = await tasaIva();
  const base = process.env.URL ?? "https://phot8can.studio";
  const regreso = origen === "portal" ? `${base}/portal/tienda/` : `${base}/pagina-viva/#arma-tu-proyecto`;

  const lineas = conCosto.map((i, n) => ({
    quantity: 1,
    tax_rates: [iva_id],
    price_data: {
      currency: "mxn",
      unit_amount: centavos(i.precio_mxn),
      product_data: {
        name: i.nombre,
        // Lo que va sin costo se menciona en el primer concepto para que quede en el recibo.
        ...(n === 0 && sinCosto.length ? { description: `Incluye sin costo: ${sinCosto.map((x) => x.nombre).join(", ")}.` } : {}),
      },
      ...(modo === "mensual" ? { recurring: { interval: "month" } } : {}),
    },
  }));

  const sesion = await s.checkout.sessions.create({
    mode: modo === "mensual" ? "subscription" : "payment",
    customer: cliente.id,
    line_items: lineas,
    locale: "es-419",
    success_url: `${base}/pago/listo/?sesion={CHECKOUT_SESSION_ID}`,
    cancel_url: regreso,
    metadata: { pago_id: pago.id, modo },
    ...(modo === "unico"
      ? metodo === "transferencia"
        ? {
            payment_method_types: ["customer_balance"],
            payment_method_options: { customer_balance: { funding_type: "bank_transfer", bank_transfer: { type: "mx_bank_transfer" } } },
          }
        : { payment_method_types: ["card"], payment_method_options: { card: { installments: { enabled: true } } } }
      : { payment_method_types: ["card"], subscription_data: { metadata: { pago_id: pago.id } } }),
  });

  await admin().from("pagos").update({ stripe_sesion_id: sesion.id, stripe_cliente_id: cliente.id }).eq("id", pago.id);
  return { url: sesion.url };
}

/** Pago confirmado: da de alta al cliente (si es nuevo), lo contratado y le manda su acceso. */
export async function cumplirPago(sesionId, { suscripcionId } = {}) {
  const db = admin();
  const { data: pago } = await db.from("pagos").select("*").eq("stripe_sesion_id", sesionId).maybeSingle();
  if (!pago) throw new Error(`No hay pago para la sesión ${sesionId}.`);
  if (pago.estado === "pagado") return pago; // el aviso puede llegar dos veces

  let orgId = pago.organizacion_id;
  let nuevo = false;
  if (!orgId) {
    let { data: usuarioId } = await db.rpc("usuario_por_correo", { correo: pago.correo });
    if (!usuarioId) {
      const { data: creado, error } = await db.auth.admin.createUser({ email: pago.correo, email_confirm: true, user_metadata: { nombre: pago.nombre } });
      if (error) throw new Error(`No se pudo crear el usuario: ${error.message}`);
      usuarioId = creado.user.id;
      nuevo = true;
    }
    const { data: miembro } = await db.from("miembros").select("organizacion_id").eq("usuario_id", usuarioId).limit(1).maybeSingle();
    orgId = miembro?.organizacion_id;
    if (!orgId) {
      const nombreNegocio = pago.negocio || pago.nombre || pago.correo.split("@")[0];
      const { data: org, error } = await db.from("organizaciones").insert({ nombre: nombreNegocio }).select("id").single();
      if (error) throw new Error(`No se pudo crear la organización: ${error.message}`);
      orgId = org.id;
      await db.from("miembros").insert({ organizacion_id: orgId, usuario_id: usuarioId, rol: "dueno" });
      await db.from("briefings").insert({ organizacion_id: orgId, respuestas: { nombre_comercial: nombreNegocio }, actualizado_por: usuarioId });
      nuevo = true;
    }
  }

  const filas = [...pago.items, ...(pago.sin_costo ?? [])].map((i) => ({
    organizacion_id: orgId,
    producto_id: i.producto_id,
    nombre: i.nombre,
    precio_mxn: i.precio_mxn,
    cobro: i.cobro,
    estado: i.automatico ? "activo" : "preparacion",
    stripe_suscripcion_id: suscripcionId ?? null,
  }));
  if (filas.length) {
    const { error } = await db.from("contratados").insert(filas);
    if (error) throw new Error(`No se guardó lo contratado: ${error.message}`);
  }
  await db.from("pagos").update({ estado: "pagado", organizacion_id: orgId, stripe_suscripcion_id: suscripcionId ?? null }).eq("id", pago.id);

  // Acceso al portal: el mismo enlace mágico de siempre, al correo con que pagó.
  if (nuevo || !pago.organizacion_id) {
    const base = process.env.URL ?? "https://phot8can.studio";
    await db.auth.signInWithOtp({ email: pago.correo, options: { emailRedirectTo: `${base}/portal/`, shouldCreateUser: false } }).catch(() => {});
  }
  return { ...pago, organizacion_id: orgId };
}
