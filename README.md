# Phot8can

Sitio de Phot8can, la agencia creativa. Next.js + Tailwind, exportado como sitio estático.

- `/`: la página principal (`app/page.tsx` y `components/`).
- `/pagina-viva/`: el servicio Página Viva (`app/pagina-viva/page.tsx`).
- `/bodas/`: la landing de bodas, un HTML estático en `public/bodas/index.html`.

## Editar textos

Casi todo el contenido vive en `lib/content.ts`: menú, servicios, proyectos, proceso, cifras y Página Viva.
Las cifras y la lista de servicios están marcadas con `TODO` para confirmarlas.

Colores y tipografía siguen el Manual de Identidad Visual: amarillo `#F3AF0E`, negro y blanco, con Montserrat.
Los logos están en `public/marca/` y las fotos en `public/img/`.

## Desarrollo

```bash
npm install
npm run dev
```

## Publicar

Netlify corre `npm run build` y publica la carpeta `out/` (ver `netlify.toml`).
`phot8can.studio` redirige a `phot8can.com/bodas/`.

## Cambiar el WhatsApp

- Página principal y Página Viva: la constante `TELEFONO` de `lib/content.ts`.
- Bodas: la constante `WHATSAPP` en el script `#app` de `public/bodas/index.html`.
