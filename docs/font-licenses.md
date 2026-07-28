# Licencias y procedencia tipográfica

Fecha de verificación: 17 de julio de 2026.

## Criterio legal

Todas las familias evaluadas usan SIL Open Font License 1.1 (OFL-1.1). La licencia permite uso comercial, autoalojamiento web, inclusión junto con una aplicación, redistribución y modificación, siempre que se conserve la licencia y el software tipográfico no se venda por sí solo. Los nombres reservados, cuando existan, deben respetarse al publicar derivados. La referencia normativa usada fue [Open Font License](https://openfontlicense.org/).

La aplicación no obtiene fuentes de sitios de descarga. Los binarios provienen de Fontsource —que conserva la atribución de los proyectos oficiales— o del repositorio oficial en el caso de Martian Grotesk. Las copias completas de las licencias están en `licenses/fonts/`.

## Familias que se distribuyen con la aplicación

| Familia | Autoría / proyecto | Fuente oficial | Proveedor del archivo | Archivo usado | Subconjunto y uso | Licencia conservada |
| --- | --- | --- | --- | --- | --- | --- |
| Bricolage Grotesque | Mathieu Triay / Bricolage Grotesque Project Authors | [ateliertriay/bricolage](https://github.com/ateliertriay/bricolage) | `@fontsource-variable/bricolage-grotesque@5.2.10` | `bricolage-grotesque-latin-wght-normal.woff2` | Latin, variable `wght` 200–800; títulos e identidad, con uso efectivo 600–700 | `licenses/fonts/OFL-Bricolage-Grotesque.txt` |
| Instrument Sans | Rodrigo Fuenzalida, dirección de Jordan Egstad / Instrument | [Instrument/instrument-sans](https://github.com/Instrument/instrument-sans) | `@fontsource-variable/instrument-sans@5.2.8` | `instrument-sans-latin-wght-normal-v5.2.8.woff2` | Latin, variable `wght` 400–700; interfaz, contenido y administración | `licenses/fonts/OFL-Instrument-Sans.txt` |
| Martian Grotesk | Martian Grotesk Project Authors / Evil Martians | [evilmartians/grotesk](https://github.com/evilmartians/grotesk) | Repositorio oficial, rama `main` | `MartianGrotesk[wdth,wght].woff2`, renombrado localmente | Archivo oficial completo; paquete opcional `technical`, `wght` 100–1000 y `wdth` 75–200, limitado por tokens a 96–112 | `licenses/fonts/OFL-Martian-Grotesk.txt` |
| Barlow | Jeremy Tribby / Barlow Project Authors | [jpt/barlow](https://github.com/jpt/barlow) | `@fontsource/barlow@5.2.8` | `barlow-latin-600-normal.woff2`, `barlow-latin-700-normal.woff2` | Latin estático; sólo títulos del paquete opcional `signage` | `licenses/fonts/OFL-Barlow.txt` |

## Familias usadas sólo en el laboratorio de desarrollo

Estas dependencias se encuentran en `devDependencies`, la ruta comparadora sólo existe con `import.meta.env.DEV` y el build productivo comprobado no genera sus archivos.

| Familia | Autoría / proyecto | Fuente oficial | Paquete | Archivo evaluado | Licencia conservada |
| --- | --- | --- | --- | --- | --- |
| Geologica | Geologica Project Authors | [googlefonts/geologica](https://github.com/googlefonts/geologica) | `@fontsource-variable/geologica@5.2.8` | Latin variable `wght`, 24,944 bytes | `licenses/fonts/OFL-Geologica.txt` |
| Atkinson Hyperlegible Next | Atkinson Hyperlegible Next Project Authors / Braille Institute | [googlefonts/atkinson-hyperlegible-next](https://github.com/googlefonts/atkinson-hyperlegible-next) | `@fontsource-variable/atkinson-hyperlegible-next@5.2.6` | Latin variable `wght`, 33,996 bytes | `licenses/fonts/OFL-Atkinson-Hyperlegible-Next.txt` |
| Funnel Display | NORD ID, Kristian Möller / Funnel Project Authors | [Dicotype/Funnel](https://github.com/Dicotype/Funnel) | `@fontsource-variable/funnel-display@5.2.8` | Latin variable `wght`, 17,740 bytes | `licenses/fonts/OFL-Funnel-Display.txt` |
| Funnel Sans | NORD ID, Kristian Möller / Funnel Project Authors | [Dicotype/Funnel](https://github.com/Dicotype/Funnel) | `@fontsource-variable/funnel-sans@5.2.8` | Latin variable `wght`, 17,440 bytes | `licenses/fonts/OFL-Funnel-Sans.txt` |

## Cobertura verificada

El subconjunto Latin empleado incluye el rango `U+0000-00FF` y cubre las cadenas españolas probadas: `áéíóú`, `ÁÉÍÓÚ`, `ñÑ`, `üÜ`, `¿?`, `¡!`, `$`, `%`, `/`, guiones y dígitos. Instrument Sans declara además cifras tabulares (`tnum`), que se activan sólo en horarios, calendario, precios, métricas, fechas y códigos.

No se habilitaron variantes cursivas, glifos estilísticos o ejes decorativos. Incorporar una nueva versión exige volver a comprobar licencia, atribución, cobertura, tamaño y capturas antes de actualizar el archivo versionado.
