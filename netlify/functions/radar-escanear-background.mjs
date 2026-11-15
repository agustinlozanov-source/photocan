// Escaneo del Radar en segundo plano: Google Maps → revisor de cada página → PageSpeed → índice.
import { admin } from "../lib/sitios.mjs";
import { buscarNegocios, calificar, revisarPagina, velocidad } from "../lib/radar.mjs";
import { esStaff } from "./radar.mjs";

/** Corre fn sobre la lista con a lo más `n` a la vez. */
async function enParalelo(lista, n, fn) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, lista.length) }, async () => {
      while (i < lista.length) await fn(lista[i++]);
    }),
  );
}

export default async (req) => {
  const u = await esStaff(req);
  if (!u) return new Response("No autorizado", { status: 403 });
  const { escaneo_id } = await req.json();
  const db = admin();
  const { data: esc } = await db.from("radar_escaneos").select("*").eq("id", escaneo_id).single();
  if (!esc) return new Response("Sin escaneo", { status: 404 });
  const avanzar = (cambios) => db.from("radar_escaneos").update(cambios).eq("id", escaneo_id);

  try {
    await avanzar({ estado: "escaneando", detalle: "Buscando negocios en Google Maps…" });
    const negocios = await buscarNegocios(esc.rubro, esc.zona);
    const ahora = new Date().toISOString();
    await db.from("radar_negocios").insert(negocios.map((n) => ({ ...n, escaneo_id, google_consultado: ahora })));
    await avanzar({ total: negocios.length, detalle: `Revisando ${negocios.length} páginas…` });

    let revisados = 0;
    await enParalelo(negocios, 5, async (n) => {
      const diagnostico = await revisarPagina(n.sitio);
      if (diagnostico.abre) diagnostico.velocidad = await velocidad(n.sitio);
      n.diagnostico = diagnostico;
      await db.from("radar_negocios").update({ diagnostico }).eq("escaneo_id", escaneo_id).eq("place_id", n.place_id);
      revisados += 1;
      if (revisados % 5 === 0) await avanzar({ revisados });
    });

    const notas = calificar(negocios, esc.rubro);
    await enParalelo(notas, 8, (x) =>
      db.from("radar_negocios").update({ factores: x.factores, indice: x.indice, razon: x.razon }).eq("escaneo_id", escaneo_id).eq("place_id", x.place_id),
    );
    await avanzar({ estado: "listo", revisados: negocios.length, detalle: null, terminado: new Date().toISOString() });
  } catch (e) {
    console.log(`ERROR radar ${escaneo_id}: ${e.message}`);
    await avanzar({ estado: "error", detalle: String(e.message).slice(0, 300) });
  }
  return new Response("ok");
};
