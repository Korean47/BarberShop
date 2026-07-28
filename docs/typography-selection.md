# Selección del sistema tipográfico

Fecha de evaluación: 17 de julio de 2026. Auditoría previa: [typography-audit.md](./typography-audit.md). Comparador: `/design-system/typography` en modo desarrollo.

## Contexto visual evaluado

La identidad existente combina azul petróleo, terracota y fondos cálidos con fotografía documental del servicio, video de trabajo real, formas redondeadas y mensajes directos. La fuente debía añadir carácter sin llevar la marca a lujo editorial, estética urbana estereotipada o producto tecnológico. El flujo de reservación y el panel exigían una segunda prioridad igualmente fuerte: lectura rápida en móvil.

Cada sistema se renderizó con el mismo contenido, video, fotografías, colores, anchos, botones, formulario, calendario, confirmación, tabla administrativa, nombres largos y repertorio español. Las cinco capturas móviles completas de exploración se generaron antes de seleccionar finalistas; las capturas A/E conservadas en `docs/typography-screenshots/` usan dimensiones y fotograma idénticos.

## Sistemas y carga medida

| ID | Sistema | Configuración probada | Solicitudes WOFF2 | Bytes Latin | Observación |
| --- | --- | --- | ---: | ---: | --- |
| A | Bricolage Grotesque + Instrument Sans | Bricolage 600–700 para identidad; Instrument 400–700 para producto | 2 | 71,436 | Variable `wght`; equilibrio más fuerte entre carácter y claridad |
| B | Martian Grotesk | Una familia; ancho 112 en display y 96 en interfaz; pesos 400–700 | 1 | 148,308 | Excelente ingeniería de UI, pero pesada y visualmente industrial para esta marca |
| C | Barlow + Instrument Sans | Barlow estática 600/700; Instrument variable 400–700 | 3 | 75,652 | Clara y directa; la dirección de señalética domina demasiado la fotografía |
| D | Geologica + Atkinson Hyperlegible Next | Geologica 600–700; Atkinson 400–700 | 2 | 58,940 | Máxima legibilidad; el conjunto se acerca más a producto técnico que a servicio cercano |
| E | Funnel Display + Funnel Sans | Ambas variables `wght`; pesos 400–700 | 2 | 35,180 | Finalista por rendimiento y naturalidad; identidad menos memorable que A |

También se midió la alternativa estática del sistema A: Bricolage 600/700 suma 44,840 bytes e Instrument 400/500/600/700 suma 68,512 bytes, para 113,352 bytes y seis solicitudes. Los dos archivos variables reducen 41,916 bytes y cuatro solicitudes, por lo que son la estrategia comprobada, no una elección por conveniencia.

## Matriz ponderada

Escala de 1 a 10. El total es la suma de cada puntuación multiplicada por el peso solicitado.

| Criterio | Peso | A | B | C | D | E |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Identidad y diferenciación | 20 % | 9.5 | 8.6 | 7.7 | 8.2 | 8.3 |
| Legibilidad móvil | 20 % | 9.2 | 7.5 | 8.7 | 9.6 | 9.1 |
| Interfaz y reservación | 15 % | 9.3 | 7.3 | 9.1 | 9.5 | 9.2 |
| Coherencia con fotografía y video | 10 % | 9.5 | 7.8 | 8.4 | 7.7 | 8.6 |
| Naturalidad de marca | 10 % | 9.4 | 7.0 | 7.8 | 8.0 | 8.7 |
| Accesibilidad | 10 % | 9.1 | 7.6 | 8.8 | 9.8 | 9.0 |
| Rendimiento | 10 % | 8.5 | 5.5 | 8.2 | 8.8 | 9.8 |
| Flexibilidad futura | 5 % | 9.3 | 8.3 | 8.7 | 8.8 | 9.0 |
| **Total ponderado** | **100 %** | **9.25** | **7.52** | **8.40** | **8.86** | **8.92** |

## Elección

Gana el sistema A: Bricolage Grotesque + Instrument Sans.

Bricolage aporta una silueta reconocible en portada y encabezados sin recurrir a códigos temáticos de barbería. Sus detalles se relacionan bien con el encuadre cercano, las herramientas y el ritmo de las fotografías. Instrument conserva aperturas, cifras y signos claros en campos, horarios, precios y administración. La combinación se mantiene natural: la identidad está concentrada en textos breves y la interfaz no intenta llamar la atención.

No se activan ejes arbitrarios. El archivo de Bricolage se carga únicamente con el eje `wght`; se usa al ancho normal y pesos 600–700. Instrument se carga únicamente con `wght`, ancho normal, pesos 400, 500, 600 y 700, sin alternativas estilísticas. Los números tabulares se limitan a roles donde mejoran alineación.

## Motivos de descarte

- **B · Martian Grotesk:** su anchura y ganchos de inspiración monoespaciada producen una voz brutalista/tecnológica, sobre todo en formularios y textos de varias líneas. El único WOFF2 pesa 148.3 KB. Se conserva como paquete opcional controlado, no como valor predeterminado.
- **C · Barlow + Instrument:** funciona y es accesible, pero su relación explícita con señalética vial vuelve la composición demasiado directa. Tres archivos no mejoran rendimiento frente a A. Se conserva como paquete opcional para tenants cuya fotografía y logotipo sí justifiquen esa dirección.
- **D · Geologica + Atkinson Hyperlegible Next:** obtiene la mejor accesibilidad y una carga razonable, pero Geologica transmite precisión geométrica/técnica y Atkinson hace el producto más utilitario que distintivo. Es una buena referencia de accesibilidad, no la identidad adecuada.
- **E · Funnel Display + Funnel Sans:** es el finalista más ligero y se comporta muy bien. Sus desplazamientos de tallos aportan un matiz amable, aunque en portada la marca resulta menos recordable y más cercana a un producto digital contemporáneo. La ventaja de 36.3 KB no compensó la diferencia de identidad en este caso.

## Evidencia A/E

- Portada móvil sobre video: [A](./typography-screenshots/candidate-a-mobile-hero-video.png) · [E](./typography-screenshots/candidate-e-mobile-hero-video.png)
- Portada escritorio: [A](./typography-screenshots/candidate-a-desktop-hero-video.png) · [E](./typography-screenshots/candidate-e-desktop-hero-video.png)
- Servicios móvil: [A](./typography-screenshots/candidate-a-mobile-services.png) · [E](./typography-screenshots/candidate-e-mobile-services.png)
- Calendario móvil: [A](./typography-screenshots/candidate-a-mobile-calendar.png) · [E](./typography-screenshots/candidate-e-mobile-calendar.png)
- Confirmación sobre fondo oscuro: [A](./typography-screenshots/candidate-a-mobile-confirmation-dark.png) · [E](./typography-screenshots/candidate-e-mobile-confirmation-dark.png)
- Administración sobre fondo claro: [A](./typography-screenshots/candidate-a-mobile-admin-light.png) · [E](./typography-screenshots/candidate-e-mobile-admin-light.png)
- Página completa móvil: [A](./typography-screenshots/candidate-a-mobile-full.png) · [E](./typography-screenshots/candidate-e-mobile-full.png)
- Página completa escritorio: [A](./typography-screenshots/candidate-a-desktop-full.png) · [E](./typography-screenshots/candidate-e-desktop-full.png)
