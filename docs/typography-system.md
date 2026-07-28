# Sistema tipográfico implementado

## Arquitectura

- `client/src/styles/fonts.css`: declaraciones WOFF2, subconjuntos y fallbacks medidos.
- `client/src/index.css`: familias, escala fluida, pesos, alturas de línea y roles semánticos.
- `client/tailwind.config.js`: las utilidades existentes consumen los mismos tokens; `text-sm`, `font-semibold` y `tracking-wide` ya no introducen valores paralelos.
- `client/src/config/typography.ts`: catálogo cerrado de paquetes multi-tenant y normalización de valores heredados.
- `client/src/components/admin/TypographyPackagePicker.tsx`: selector administrativo accesible.
- `client/src/context/TenantContext.tsx`: aplica un identificador validado mediante `data-font-package`; nunca inserta un nombre de fuente proporcionado por el usuario.
- `server/prisma/migrations/20260718000100_typography_packages`: migra valores antiguos y cambia el predeterminado.
- `/design-system/typography`: comparador disponible únicamente en desarrollo y separado del bundle productivo.

## Roles

| Rol | Familia | Uso |
| --- | --- | --- |
| `type-display` | Display | Portada y campañas breves |
| `type-heading-1` a `type-heading-3` | Display | Títulos de página, sección y tarjetas destacadas |
| `type-heading-4` | Interfaz | Encabezados densos y administrativos |
| `type-body-large`, `type-body`, `type-body-small` | Interfaz | Descripciones y contenido |
| `type-label`, `type-button`, `type-caption` | Interfaz | Campos, acciones, ayudas y metadatos |
| `type-price`, `type-metric` | Interfaz / display puntual | Importes y cifras destacadas con números tabulares |
| `type-calendar-day`, `type-time-slot` | Interfaz | Calendario y horarios con números tabulares |
| `type-booking-code` | Monoespaciada del sistema | Códigos breves, nunca párrafos |

La escala usa `clamp()` desde `--text-xs` hasta `--text-display`. El cuerpo y los controles públicos parten de 16 px en móvil; los campos administrativos también suben a 16 px bajo 640 px para evitar el zoom automático de iOS. El peso normal es 400, los controles usan 500–600 y 700 queda para énfasis breve. `font-black` heredado se resuelve a 700, por lo que no provoca síntesis de 900.

## Carga y estabilidad

El paquete predeterminado descarga 71,436 bytes en dos WOFF2. Instrument Sans Latin se precarga porque pinta navegación, campos y cuerpo; Bricolage se solicita sólo cuando aparece el primer encabezado. No hay `@import`, TTF, cursivas ni Latin Extended. Las familias opcionales están declaradas en el CSS pero el navegador no solicita sus binarios mientras no estén activas.

Los fallbacks se midieron en Chromium sobre Windows a 100 px. Frente a Segoe UI se aplicó `size-adjust` de 103.5 % para Instrument, 104.9 % para Bricolage, 126 % para Martian y 97.3 % para Barlow. No se copiaron `ascent-override`, `descent-override` o `line-gap-override`: la interfaz usa alturas de línea explícitas y las pruebas de carga no mostraron una mejora que justificara alterar las métricas verticales.

## Paquetes aprobados

| ID persistido | Display | Interfaz | Carga al activarse |
| --- | --- | --- | --- |
| `contemporary` | Bricolage Grotesque | Instrument Sans | 71,436 bytes / 2 solicitudes |
| `technical` | Martian Grotesk 112 % | Martian Grotesk 96 % | 148,308 bytes / 1 solicitud |
| `signage` | Barlow 600/700 | Instrument Sans | 75,652 bytes / 3 solicitudes |

## Agregar un paquete

1. Comprobar el repositorio oficial, licencia comercial/web/SaaS, archivo OFL, cobertura española y WOFF2.
2. Medir variable contra los pesos estáticos realmente usados; no añadir todos los estilos.
3. Agregar las declaraciones a `fonts.css` con nombre interno único, `font-display`, rango de peso y `unicode-range` cuando aplique.
4. Medir el fallback en el navegador objetivo antes de definir `size-adjust`.
5. Registrar el ID, nombre, descripción y pilas en `typography.ts`.
6. Añadir el mismo ID a los dos esquemas Zod del servidor y una migración si cambia el predeterminado. No reutilizar el campo para nombres libres.
7. Incorporar licencia y procedencia en `docs/font-licenses.md` y `licenses/fonts/`.
8. Comparar con contenido real en la ruta de laboratorio; ejecutar build para comprobar que no se incluyan candidatos de desarrollo.
9. Probar 320–430 px, 200 % de zoom, espaciado aumentado, teclado, contraste forzado, caché vacía y red limitada.

## Resultado de validación

- Build productivo sin las fuentes de los candidatos D/E ni la ruta del laboratorio.
- Carga inicial móvil, con caché vacía y red 4G limitada: Instrument Sans 30,092 bytes y Bricolage Grotesque 41,344 bytes; dos solicitudes, sin duplicados.
- CLS medido durante el intercambio de fuentes: `0.000746`.
- Matriz de 30 vistas públicas en 320, 360, 375, 390, 412 y 430 px: sin desbordamiento horizontal, texto cortado ni acciones inaccesibles.
- Flujo real de reserva recorrido hasta la confirmación —servicio, barbero, calendario, horario, datos y pago— sin crear una cita.
- Vistas administrativas comprobadas a 320, 390 y 430 px; controles de formulario de al menos 16 px en móvil.
- Reflow equivalente a zoom del 200 %, orientación horizontal, espaciado de texto aumentado, movimiento reducido y colores forzados: sin bloqueos funcionales. Los únicos elementos de 1 px detectados son etiquetas `sr-only` intencionales para lectores de pantalla.
- Typecheck, lint, pruebas de cliente y servidor, validación Prisma, builds y presupuesto de rendimiento completados correctamente.

## Comandos de comprobación

```powershell
cd client
npm run typecheck
npm run lint
npm test
npm run build

cd ..\server
npm run typecheck
npm test
npm run build
```
