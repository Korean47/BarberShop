# Auditoría del sistema tipográfico anterior

Fecha: 17 de julio de 2026
Alcance: cliente público, reservación, consulta y gestión de citas, pagos, autenticación y panel administrativo.

## Resumen ejecutivo

La aplicación no estaba renderizando la familia que declaraba como identidad. El paquete `@fontsource-variable/dm-sans` estaba instalado e importado, pero Fontsource registra la familia como `DM Sans Variable` y el producto solicitaba `DM Sans`. En una sesión limpia el navegador no hizo ninguna solicitud WOFF2: el cuerpo cayó en la pila del sistema y los títulos usaron directamente Segoe UI por la configuración de Tailwind.

El resultado era estable y razonablemente legible, pero sin una identidad tipográfica real. También existían dos listas administrativas de familias incompatibles, ninguna estrategia de paquetes aprobados y una escala basada mayormente en utilidades puntuales.

## Inventario de fuentes

| Elemento | Estado anterior |
|---|---|
| Dependencia | `@fontsource-variable/dm-sans@5.2.8` |
| Importación | `@fontsource-variable/dm-sans/index.css` en `main.tsx` |
| Familia registrada | `DM Sans Variable` |
| Familia solicitada | `DM Sans` |
| Archivos generados | `dm-sans-latin-wght-normal.woff2` y `dm-sans-latin-ext-wght-normal.woff2` |
| Tamaño combinado | 55,160 bytes sin comprimir en disco |
| Rango declarado | peso variable 100–1000, estilo normal |
| Solicitudes observadas | 0 en una carga limpia, porque ninguna regla coincidía con la familia registrada |
| Fuentes externas | ninguna; no había `@import` ni solicitudes a Google Fonts |
| Archivos tipográficos versionados | ninguno fuera de dependencias/build |

La pila del cuerpo era `DM Sans, Inter, Segoe UI, Arial, system-ui, sans-serif`. La clase `font-display` y las claves `display/body` de Tailwind apuntaban a Segoe UI. Por tanto, sitio público y panel compartían el fallback de Windows sólo de forma accidental; en Android, iOS y macOS la apariencia podía variar de forma importante.

## Configuración multi-tenant encontrada

- `TenantBranding.fontFamily` guardaba un nombre libre dentro de listas cerradas pero inconsistentes.
- Configuración general permitía `Inter`, `DM Sans`, `Source Sans 3` y `system-ui`.
- El endpoint heredado de branding permitía `Inter`, `DM Sans`, `Playfair Display` y `Cormorant Garamond`.
- Sólo DM Sans estaba instalada y, por el nombre incorrecto, tampoco se aplicaba.
- El administrador podía seleccionar una familia no disponible y provocar un fallback distinto según el dispositivo.
- No existían paquetes que controlaran display, interfaz, pesos, escala y fallback como una unidad.

Esto incumplía la necesidad SaaS de resultados previsibles y permitía combinaciones no verificadas.

## Pesos realmente declarados

Además del peso regular implícito 400, el código TSX contenía:

| Utilidad | Apariciones | Uso predominante |
|---|---:|---|
| `font-medium` | 31 | datos operativos y tablas |
| `font-semibold` | 119 | botones, etiquetas, títulos menores y valores |
| `font-bold` | 38 | navegación y tarjetas administrativas |
| `font-black` | 32 | métricas, navegación y encabezados heredados |

No se usaba peso 300. El peso 900 aparecía con demasiada frecuencia en el panel y reducía la jerarquía: encabezado, navegación, métricas y varios valores competían por la misma intensidad. Aunque el archivo variable declaraba todos los pesos de 100 a 1000, la interfaz sólo necesitaba 400, 500, 600 y un 700 muy puntual.

## Tamaños, interlínea y espaciado

- `text-sm` aparecía 162 veces y `text-xs` 96 veces.
- Había 8 usos de 10 px y 4 de 11 px, principalmente en administración y calendario.
- La portada usaba un `clamp()` aislado de 2.7 a 5.8 rem y `line-height: .96`.
- Había 18 usos de tracking ancho y 10 de tracking estrecho, además de valores manuales entre `0.14em` y `0.2em`.
- Las alturas de línea se repartían entre 1.25 rem, 1.5 rem, 1.75 rem, `tight`, `.96` y `1.02`, sin tokens semánticos.
- Formularios públicos ya usaban 16 px; los administrativos usaban 14 px.

La aplicación tenía algunas clases semánticas (`booking-title`, `booking-description`, `summary-label`, `summary-value`, `eyebrow`), pero la mayor parte de títulos, métricas, precios, etiquetas y texto auxiliar se definía directamente en cada TSX.

## Hallazgos por contexto

### Portada y navegación

- El overlay del video, el ancho máximo y el texto balanceado ofrecían una base correcta de contraste.
- El título tenía una escala fluida, pero la familia display no era distintiva y el tracking `-.045em` dependía de métricas de Segoe UI.
- Un nombre de barbería largo podía competir con navegación y CTA porque no había un rol específico para marca.
- El pie y la navegación se mantenían legibles, con controles de al menos 44–48 px.

### Servicios, barberos y precios

- Nombre y precio compartían un peso 600; no existía un rol numérico consistente.
- Los importes no activaban números tabulares.
- Las tarjetas tenían mínimos de altura razonables, pero el ancho combinado nombre/precio podía producir saltos distintos entre plataformas.
- Los nombres de barberos sí usaban `font-display`, aunque en realidad se resolvían con Segoe UI.

### Reservación, calendario y horarios

- Entradas públicas respetaban 16 px en móvil y evitaban zoom automático en iOS.
- Los nombres de semana y varias etiquetas usaban 11 px en mayúsculas; son legibles con contraste normal, pero demasiado pequeños para convertirse en patrón general.
- Días, horas, totales y códigos no tenían un rol numérico compartido ni `font-variant-numeric: tabular-nums`.
- El calendario era operable por teclado y las acciones estaban fuera del área de scroll, pero la escala tipográfica dependía de utilidades puntuales.

### Panel administrativo

- El panel utilizaba principalmente 12–14 px, con ocho textos de 10 px.
- El uso de peso 700/900 era excesivo en navegación, métricas y encabezados.
- Tablas y formularios no necesitan una familia display; la base debía seguir siendo una sans de interfaz.
- Encabezados de página, nombre de la barbería y alguna métrica podían compartir identidad con el sitio público sin convertir el panel en una pieza editorial.

### Estados, errores y modales

- Los mensajes conservaban alturas flexibles y no se encontraron recortes en las rutas `/`, `/book`, `/appointment` y `/admin/login` a 390×844.
- Algunos componentes heredados usan `truncate` o `line-clamp`; son adecuados para nombres repetidos dentro de tarjetas, pero deben conservar título/contexto accesible cuando oculten contenido.
- No se encontraron bloques largos justificados, cursivas pequeñas ni peso 300.

## Rendimiento y estabilidad visual de referencia

La compilación anterior generaba 55.16 kB de WOFF2, pero una carga limpia mostró cero recursos tipográficos solicitados. Esto evitaba un cambio de fuente visible por accidente, no por una estrategia correcta. La métrica de presupuesto previa era 96 kB gzip inicial y 107 kB para la ruta de portada; el script no suma archivos de fuente al JavaScript inicial.

La solución nueva debe comparar bytes transferidos, solicitudes reales, `font-display`, precarga y cambios de geometría. No se usarán overrides métricos sin mediciones reproducibles.

## Accesibilidad y riesgos de la línea base

- Correcto: formularios públicos de 16 px, controles táctiles, foco visible, contraste y contenedores generalmente flexibles.
- Riesgo: etiquetas de 10–11 px y mayúsculas con tracking amplio.
- Riesgo: títulos display con interlínea menor a 1 podían perder claridad con nombres largos o espaciado personalizado.
- Riesgo: diferencias importantes entre Segoe UI, San Francisco y Roboto por depender del sistema operativo.
- Riesgo: la selección administrativa podía provocar fallbacks imprevisibles.
- Pendiente de la fase comparativa: zoom 200 %, espaciado WCAG, nombres largos, texto español completo, portada sobre video, calendario y panel denso.

## Conclusión de auditoría

No conviene conservar DM Sans como decisión automática. La implementación no la estaba usando realmente, la familia estaba entre las soluciones expresamente desaconsejadas para este encargo y el sistema carecía de roles, escala y paquetes multi-tenant. La fase siguiente debe comparar sistemas completos con el mismo contenido, medir sus archivos y licencias, y seleccionar uno antes de cambiar la aplicación.
