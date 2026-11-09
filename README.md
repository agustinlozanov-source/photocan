# Photocan Bodas

Sitio estático de bodas de Photocan: landing y página de oferta del día, en un solo `index.html`.

## Publicar

No requiere instalación ni compilación. Publica la raíz del repositorio en cualquier hosting estático.

## Cambiar la oferta del día

Edita el bloque `<script type="application/json" id="estado">` en `index.html`:

- `fechas`: ofertas para una fecha concreta, con formato `AAAA-MM-DD`.
- `rotacion`: oferta de respaldo por día de la semana, de `0` (domingo) a `6` (sábado).
- `whatsapp`: número de Photocan con lada.
- `linkPago`: link de pago general. Cada oferta también acepta su propio `link`.

El sitio cambia de oferta a medianoche, hora del centro de México.

Los códigos se validan en el navegador. Para que sean privados hay que validarlos en un servidor.
