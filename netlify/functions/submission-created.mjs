// Netlify ejecuta esta función con cada envío verificado de un formulario del sitio.
// Reenvía los contactos del formulario "contacto" al CRM.
//
// Configuración (Netlify → Site configuration → Environment variables):
//   CRM_WEBHOOK_URL     URL del webhook del CRM (obligatoria para reenviar).
//   CRM_WEBHOOK_SECRET  opcional; se manda en el header "X-Webhook-Secret".
//
// Sin CRM_WEBHOOK_URL el contacto igual queda guardado en Netlify (Forms).

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body || "{}");
  if (!payload || payload.form_name !== "contacto") return { statusCode: 200, body: "ignorado" };

  const d = payload.data || {};
  const contacto = {
    nombre: d.nombre || "",
    correo: d.correo || "",
    whatsapp: d.whatsapp || "",
    negocio: d.negocio || "",
    acepta_privacidad: d.acepta_privacidad === "si",
    origen: d.origen || "Sitio web",
    pagina: d.pagina || "",
    referencia: d.referencia || "",
    utm: {
      source: d.utm_source || "",
      medium: d.utm_medium || "",
      campaign: d.utm_campaign || "",
      content: d.utm_content || "",
      term: d.utm_term || "",
    },
    fecha: payload.created_at || new Date().toISOString(),
    id_envio: payload.id || "",
  };

  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) {
    console.log("CRM_WEBHOOK_URL sin configurar; contacto guardado solo en Netlify Forms:", contacto.correo);
    return { statusCode: 200, body: "sin webhook" };
  }

  const headers = { "Content-Type": "application/json" };
  if (process.env.CRM_WEBHOOK_SECRET) headers["X-Webhook-Secret"] = process.env.CRM_WEBHOOK_SECRET;

  try {
    const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(contacto) });
    if (!r.ok) console.error("El CRM respondió", r.status, await r.text().catch(() => ""));
  } catch (e) {
    console.error("No se pudo enviar al CRM:", e);
  }
  // Siempre 200: el envío ya quedó guardado en Netlify aunque el CRM falle.
  return { statusCode: 200, body: "ok" };
};
