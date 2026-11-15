// Radar de prospección: busca negocios en Google Maps, revisa su página y calcula el índice
// de oportunidad. Variable de entorno: GOOGLE_RADAR_API_KEY (Places API (New) + PageSpeed).

const LLAVE = () => {
  const k = process.env.GOOGLE_RADAR_API_KEY;
  if (!k) throw new Error("Falta GOOGLE_RADAR_API_KEY en las variables de entorno de Netlify.");
  return k;
};

/* ---------------------------------------------------------------- Google Maps */

const CAMPOS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.primaryTypeDisplayName",
  "places.googleMapsUri",
  "places.businessStatus",
  "nextPageToken",
].join(",");

/** Hasta 60 negocios (3 páginas de 20), en el orden en que Google los muestra. */
export async function buscarNegocios(rubro, zona, maxPaginas = 3) {
  const negocios = [];
  let pageToken;
  for (let p = 0; p < maxPaginas; p++) {
    const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": LLAVE(), "X-Goog-FieldMask": CAMPOS },
      body: JSON.stringify({ textQuery: `${rubro} en ${zona}`, languageCode: "es", regionCode: "MX", pageSize: 20, ...(pageToken ? { pageToken } : {}) }),
    });
    if (!r.ok) throw new Error(`Google Maps respondió ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const d = await r.json();
    for (const x of d.places ?? []) {
      if (x.businessStatus === "CLOSED_PERMANENTLY") continue;
      negocios.push({
        place_id: x.id,
        posicion: negocios.length + 1,
        nombre: x.displayName?.text ?? "",
        direccion: x.formattedAddress ?? "",
        telefono: x.nationalPhoneNumber ?? "",
        sitio: x.websiteUri ?? "",
        calificacion: x.rating ?? null,
        resenas: x.userRatingCount ?? 0,
        categoria: x.primaryTypeDisplayName?.text ?? "",
        maps_url: x.googleMapsUri ?? "",
      });
    }
    pageToken = d.nextPageToken;
    if (!pageToken) break;
    // Google pide una pausa corta antes de usar el token de la siguiente página.
    await new Promise((res) => setTimeout(res, 1500));
  }
  return negocios;
}

/* ---------------------------------------------------------------- Revisor de la página */

const SOLO_REDES = /(^|\.)(facebook|fb|instagram|linktr|wa|whatsapp|tiktok|twitter|x)\.(com|me|ee)$/i;
const GRATUITOS = /(wixsite\.com|blogspot\.|godaddysites\.com|sites\.google\.com|weebly\.com|jimdosite\.com|webnode\.)/i;

const conLimite = async (url, ms, opciones = {}) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    return await fetch(url, { ...opciones, signal: c.signal });
  } finally {
    clearTimeout(t);
  }
};

/** Abre la página del negocio y ve lo básico. Solo lee lo que el propio negocio publica. */
export async function revisarPagina(sitio) {
  if (!sitio) return { tiene: false };
  let host = "";
  try {
    host = new URL(sitio).hostname.replace(/^www\./, "");
  } catch {
    return { tiene: false };
  }
  if (SOLO_REDES.test(host)) return { tiene: false, soloRedes: true, red: host };

  try {
    const r = await conLimite(sitio, 12000, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (compatible; Phot8canRadar/1.0)" } });
    const final = r.url || sitio;
    if (!r.ok) return { tiene: true, abre: false, codigo: r.status };
    const html = (await r.text()).slice(0, 600_000);
    const bajo = html.toLowerCase();
    const anios = [...html.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(20\d{2})/gi)].map((m) => Number(m[1]));
    const correo = (html.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i) ?? [])[0] ?? null;
    return {
      tiene: true,
      abre: true,
      https: final.startsWith("https://"),
      gratuito: GRATUITOS.test(final),
      whatsapp: /wa\.me\/|api\.whatsapp\.com|whatsapp:\/\//.test(bajo),
      formulario: /<form[\s>]/.test(bajo),
      medicion: /fbq\(|googletagmanager\.com|gtag\(|google-analytics\.com|analytics\.tiktok/.test(bajo),
      anio: anios.length ? Math.max(...anios) : null,
      correo: correo && !/\.(png|jpe?g|gif|webp|svg)$/i.test(correo) && !/(sentry|example|wixpress|domain)\./i.test(correo) ? correo.toLowerCase() : null,
    };
  } catch (e) {
    return { tiene: true, abre: false, codigo: e.name === "AbortError" ? "tiempo" : "error" };
  }
}

/** Calificación de Google para celular (0-100) y cuánto tarda en verse el contenido principal. */
export async function velocidad(sitio) {
  try {
    const u = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    u.searchParams.set("url", sitio);
    u.searchParams.set("strategy", "mobile");
    u.searchParams.set("category", "performance");
    u.searchParams.set("key", LLAVE());
    const r = await conLimite(u, 70000);
    if (!r.ok) return null;
    const d = await r.json();
    const puntaje = d.lighthouseResult?.categories?.performance?.score;
    const lcp = d.lighthouseResult?.audits?.["largest-contentful-paint"]?.numericValue;
    return puntaje == null ? null : { puntaje: Math.round(puntaje * 100), segundos: lcp ? Math.round(lcp / 100) / 10 : null };
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------- Índice de oportunidad */

/** Cuánto busca la gente este giro "cerca de mí". Pesos iniciales; se afinan con datos reales. */
const DEMANDA = [
  [/restaurant|taquer|cafeter|comida|pizz|mariscos|panader|pasteler|bar\b|food/i, 95],
  [/dentist|dental|odont|cl[ií]nica|m[eé]dic|doctor|pediatr|ginec|dermat|oftalm|laborator|fisioter|psic[oó]l|nutri/i, 90],
  [/taller|mec[aá]nic|llanter|autopart|hojalater|carwash|lavado de autos/i, 85],
  [/est[eé]tica|sal[oó]n|spa|barber|u[nñ]as|maquill/i, 85],
  [/veterinar|mascota|grooming/i, 85],
  [/hotel|hostal|motel/i, 80],
  [/gimnas|gym|crossfit|yoga|pilates/i, 75],
  [/abogad|contador|contable|notar|despacho|fiscal/i, 70],
  [/inmobiliar|bienes ra[ií]ces/i, 70],
  [/escuela|colegio|guarder|kinder|academia/i, 70],
  [/florer|ferreter|farmac|[oó]ptica|mueble|papeler/i, 65],
  [/arquitect|dise[nñ]o de interiores/i, 55],
  [/ingenier|constructor|industrial/i, 50],
];
export const demandaDe = (rubro) => DEMANDA.find(([re]) => re.test(rubro))?.[1] ?? 60;

const tope = (n) => Math.max(0, Math.min(100, Math.round(n)));

function dolorDe(d, v) {
  if (!d.tiene) return d.soloRedes ? 90 : 100;
  if (!d.abre) return 95;
  let n = 0;
  if (!d.https) n += 25;
  if (v?.puntaje != null) n += v.puntaje < 50 ? 25 : v.puntaje < 90 ? 10 : 0;
  if (!d.whatsapp) n += 15;
  if (!d.formulario) n += 10;
  if (!d.medicion) n += 10;
  if (d.anio && d.anio <= new Date().getFullYear() - 3) n += 15;
  if (d.gratuito) n += 10;
  return tope(n);
}

function valorDe(resenas, calificacion) {
  const volumen = Math.min(1, Math.log10((resenas || 0) + 1) / Math.log10(500));
  const calidad = calificacion ? Math.max(0.4, Math.min(1, 0.6 + (0.4 * (calificacion - 3.5)) / 1.5)) : 0.5;
  return tope(volumen * calidad * 100);
}

function contactoDe(n, d) {
  return tope((n.telefono ? 45 : 0) + (d.correo ? 35 : 0) + (d.whatsapp ? 20 : 0));
}

/** Calcula factores, índice y la razón de cada negocio de un escaneo (necesita a todos para la presión). */
export function calificar(negocios, rubro) {
  const demanda = demandaDe(rubro);
  const base = negocios.map((n) => {
    const d = n.diagnostico ?? {};
    return { n, d, dolor: dolorDe(d, d.velocidad), valor: valorDe(n.resenas, n.calificacion), contacto: contactoDe(n, d) };
  });
  // Presión: cuántos de los 10 primeros de Google (sin contarlo a él) tienen buena página.
  const primeros = base.filter((b) => b.n.posicion <= 10);
  return base.map((b) => {
    const otros = primeros.filter((o) => o.n.place_id !== b.n.place_id);
    const buenos = otros.filter((o) => o.dolor < 40).length;
    const presion = b.dolor >= 50 && otros.length ? tope((buenos / otros.length) * 100) : 0;
    const factores = { dolor: b.dolor, valor: b.valor, demanda, presion, contacto: b.contacto };
    const indice = tope(0.3 * b.dolor + 0.25 * b.valor + 0.2 * demanda + 0.15 * presion + 0.1 * b.contacto);
    return { place_id: b.n.place_id, factores, indice, razon: razonDe(b.n, b.d, factores, buenos, otros.length) };
  });
}

function razonDe(n, d, f, buenos, total) {
  const partes = [];
  if (n.resenas) partes.push(`${n.calificacion ?? "—"}★ con ${n.resenas} reseñas`);
  if (!d.tiene) partes.push(d.soloRedes ? "solo tiene redes sociales" : "sin página web");
  else if (!d.abre) partes.push("su página no abre");
  else {
    const fallas = [];
    if (!d.https) fallas.push("sin candado de seguridad");
    if (d.velocidad?.puntaje != null && d.velocidad.puntaje < 50) fallas.push(`lenta en celular (${d.velocidad.puntaje}/100)`);
    if (!d.whatsapp) fallas.push("sin WhatsApp");
    if (!d.formulario) fallas.push("sin formulario");
    if (d.anio && d.anio <= new Date().getFullYear() - 3) fallas.push(`sin actualizar desde ${d.anio}`);
    partes.push(fallas.length ? fallas.slice(0, 3).join(", ") : "página en buen estado");
  }
  if (f.presion >= 50) partes.push(`${buenos} de sus ${total} competidores de arriba sí tienen buena página`);
  return partes.join(" · ");
}
