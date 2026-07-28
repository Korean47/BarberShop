# Auditoría de experiencia del cliente

Fecha: 17 de julio de 2026
Alcance: sitio público, reservación, consulta de citas, pagos, panel administrativo, API y persistencia.

## Estructura revisada

- Sitio público: inicio (`/`), reserva (`/book`), administración por enlace (`/manage/:token`), detalle de barbero y contacto.
- Administración: acceso protegido, resumen, citas, clientes, barberos, finanzas, inventario, documentos, configuración y suscripción.
- Componentes compartidos: layout público y administrativo, botones, campos, tarjetas, modal, estados vacíos y cuatro pasos de reservación.
- Backend: API Express multi-tenant, PostgreSQL con Prisma, catálogo, disponibilidad, citas, autenticación administrativa, pagos, webhooks y almacenamiento de referencias.

## Problemas encontrados

### Identidad, contenido y navegación

- La paleta anterior mezclaba azul petróleo, naranja saturado y amarillo brillante. El amarillo se usaba como acento principal y producía una impresión informal.
- Se encontraron textos expresamente descartados por el producto: “Barbería local en Hermosillo”, “La banda”, “¿Qué corte quieres?” y otras frases coloquiales.
- El llamado “Agendar cita” aparecía en el encabezado, la portada, la imagen principal, las tarjetas de barberos, una sección intermedia y la página de contacto.
- La portada era una composición de plantilla con tarjeta superpuesta; no existía video, secuencia administrable ni alternativa asociada a movimiento reducido.
- Horarios y textos del pie estaban escritos directamente en el frontend aunque la base de datos ya contiene horarios y ubicaciones.
- La dirección se construía en varios componentes y faltaba una URL de Maps administrable.
- El encabezado móvil priorizaba “Agendar” sobre “Mi cita”, aunque la especificación pide acceso permanente a la consulta.

### Servicios y barberos

- Los servicios públicos sí provenían del backend, pero el panel no permitía administrarlos.
- La respuesta pública no incluía una regla de precio para el corte personalizado ni un orden explícito consumible por el cliente.
- La sección de barberos mostraba todas las tarjetas a la vez; no tenía una presentación cambiante, gesto de deslizamiento ni controles dedicados.
- El panel de barberos mezclaba información real con métricas demostrativas.

### Reservación

- Existían cuatro pasos, no seis: servicio, barbero, fecha/hora y datos con pago integrado.
- El flujo era una página normal. En móvil, las acciones quedaban después del contenido y podían requerir desplazamiento.
- La fecha se limitaba a siete botones horizontales. No había calendario mensual ni navegación entre meses.
- No se aplicaban la anticipación mínima ni la ventana máxima guardadas en configuración.
- No había días excepcionales de apertura/cierre por fecha.
- La doble reservación se revalidaba, pero el error de serialización no se convertía siempre en un mensaje de horario ocupado.
- Las citas pendientes de pago bloqueaban indefinidamente la disponibilidad porque no existía expiración de retención.

### Consulta, cambios y cancelación

- La administración por token opaco era segura, pero no existía la acción “Consultar mi cita” ni búsqueda por código + teléfono.
- El código mostrado era una porción del UUID y no un identificador público específico.
- El margen de cancelación estaba guardado en `TenantSetting`, pero el backend no lo validaba.
- Reprogramar no generaba historial de estado ni una nueva notificación.
- Cancelar no registraba una notificación nueva ni exponía claramente la política aplicable.

### Pagos

- El entorno local declaraba el proveedor `mock` sin credenciales reales, pero el pago en línea se mostraba a todos los clientes.
- El backend creaba una intención antes de confirmar atómicamente la retención del horario.
- La interfaz recibía un `clientSecret` pero nunca cargaba componentes seguros ni confirmaba el pago; el botón era incompleto.
- No existía una URL de checkout alojado ni pantalla sandbox operable.
- El webhook de Stripe leía `x-webhook-signature`, aunque Stripe envía `stripe-signature`.
- Había verificación de firma e idempotencia de eventos, pero faltaban expiración de checkout, liberación de horario abandonado y estado de pago visible en la reserva.

### Panel administrativo y fuentes de datos

- Citas y agenda sí estaban conectadas con el backend.
- Configuración usaba `defaultValue` y mostraba una notificación de éxito sin guardar cambios.
- Finanzas, inventario, documentos, parte de clientes y métricas de barberos provenían de `adminDemo.ts`.
- No había gestión real de landing, servicios, ubicación, reglas de agenda o métodos de pago.
- Branding tenía API, pero la página de configuración no la consumía.

### Accesibilidad y experiencia móvil

- Había foco global visible y controles en general grandes, pero algunos iconos táctiles medían 36–40 px.
- Las fotos de selección usaban texto alternativo vacío aunque comunicaban identidad.
- El selector de fecha no era un calendario ni ofrecía navegación de teclado por cuadrícula.
- La reserva no usaba `100dvh`, áreas seguras ni un pie persistente.
- El modal compartido podía crear desplazamiento interno, pero el flujo de reserva no lo aprovechaba.
- La combinación de encabezado fijo, contenido largo y resumen lateral aumentaba la longitud en escritorio.

### Rendimiento

- Las páginas estaban divididas por ruta y las imágenes usaban WebP, dimensiones y carga diferida en contenido secundario.
- La imagen principal era prioritaria, pero no existía estrategia de video, poster administrable ni pausa por visibilidad.
- Framer Motion se cargaba dentro de la ruta de reserva para una transición sencilla.
- El mapa no se incrustaba, lo que evitaba peso, pero tampoco ofrecía una vista previa diferida.

## Decisiones de implementación

- Sustituir la identidad por tokens marfil, carbón, azul petróleo, terracota, piedra, superficie, error y éxito.
- Convertir el inicio en una landing de una sola página: portada visual, servicios, barberos cambiantes y ubicación.
- Mantener un único llamado principal de reserva en la portada y priorizar “Mi cita” en navegación.
- Mover contenido de portada, ubicación, reglas de agenda y disponibilidad de pago a la API pública y al panel.
- Convertir la reserva en un asistente de seis pasos con encabezado y acciones persistentes, contenido con desplazamiento interno y calendario mensual.
- Permitir consulta por teléfono + fecha de la cita para emitir un nuevo token opaco, protegido con límites de intentos y respuestas no enumerables; si existen varias citas ese día, presentar una selección de horarios.
- Aplicar en servidor la anticipación, ventana máxima y margen de cambio/cancelación.
- Ocultar pago en línea cuando no haya proveedor explícitamente disponible; cuando exista, usar checkout alojado o sandbox, importe calculado en servidor, webhook firmado, idempotencia y retención con expiración.
- Añadir endpoints administrativos reales para contenido, negocio, reglas, categorías, catálogo, disponibilidad del equipo y pagos; marcar claramente inventario y documentos como módulos demostrativos fuera del núcleo transaccional.

## Pantallas modificadas

- Inicio y navegación pública.
- Reserva completa y confirmación.
- Consulta, detalle, reprogramación y cancelación de cita.
- Configuración administrativa.
- Nueva gestión administrativa de categorías, servicios y su visibilidad pública.
- Gestión de barberos, servicios asignados, jornadas, descansos y ausencias.
- Horarios semanales de la sucursal y excepciones de apertura/cierre por fecha.
- Caja administrativa conectada a pagos reales, con filtros, exportación CSV y registro auditado de cobro en efectivo.
- Agenda y resumen administrativo sincronizados con pagos, cambios y cancelaciones.

## Riesgos de partida

- No hay credenciales de Stripe ni un canal SMS/WhatsApp configurado; por seguridad, esas capacidades deben permanecer ocultas hasta completar la configuración.
- Los videos de portada necesitan archivos optimizados y derechos de uso; la aplicación debe funcionar con imágenes administrables mientras no existan.
- Inventario y documentos son módulos demostrativos separados del núcleo de reservación. La caja de pagos sí utiliza datos transaccionales reales; una integración contable/fiscal completa permanece fuera del alcance.
