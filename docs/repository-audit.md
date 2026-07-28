# Auditoría del repositorio

Fecha: 2026-07-15. Rama auditada: `feature/barbershop-management-demo`, commit base `a17cad3`.

## 1. Estado encontrado

El proyecto era una demostración de una sola barbería. El cliente usaba React 19, Vite, TypeScript, Tailwind y React Router. La API usaba Express 5, Prisma y SQLite. Existían catálogo, disponibilidad, reserva anónima y varias pantallas administrativas; sólo agenda, servicios y barberos leían datos reales. Finanzas, inventario, documentos y parte de métricas provenían de arreglos de demostración.

La compilación y lint iniciales pasaban. No había pruebas automatizadas, migraciones versionadas, autenticación, autorización, CI, observabilidad ni estrategia de despliegue.

## 2. Riesgos críticos encontrados

1. Todos los endpoints de citas eran públicos, incluidos listado, edición y cancelación.
2. No existía `tenantId`; una futura segunda barbería habría compartido todos los datos.
3. SQLite y un archivo `dev.db` estaban versionados.
4. La detección de traslapes ocurría en memoria, fuera de una transacción; dos solicitudes concurrentes podían reservar la misma silla.
5. Especialidades y horarios se almacenaban como JSON serializado en texto.
6. Los estados eran cadenas libres y no existía historial.
7. El monto se obtenía indirectamente de un servicio, sin modelo de pago, intentos, reembolsos o webhooks.
8. CORS estaba fijado a localhost, no había encabezados de seguridad, rate limiting, sesiones ni auditoría.
9. Los errores no tenían códigos estables o identificador de correlación.
10. La imagen principal pesaba 1.70 MB y el bundle JavaScript era 497 kB sin división por ruta.

## 3. Deuda técnica

- `BookAppointment.tsx` tenía 622 líneas y seis pasos; mezclaba calendario, validación, red, estado y presentación.
- `AdminAppointments.tsx` conserva todavía una vista grande que debe separarse en tabla, línea de tiempo y editor durante una fase posterior.
- Varias pantallas internas conservan datos de demostración. Se preservaron para no eliminar funciones útiles, pero no deben interpretarse como contabilidad real.
- No había almacenamiento de objetos, cola, proveedor de notificaciones ni proveedor de pagos real.
- README original tenía doce bytes y no documentaba operación.

## 4. Duplicación

Los servicios aparecían en la semilla, en el backend y de nuevo como datos estáticos del landing. Horarios se parseaban tanto en servidor como cliente. La refactorización convirtió PostgreSQL en fuente de verdad para catálogo, barberos, agenda y branding. Los datos administrativos de inventario/documentos siguen aislados en `client/src/data/adminDemo.ts` hasta implementar sus módulos persistentes.

## 5. Problemas de arquitectura

Los controladores llamaban servicios globales acoplados directamente a Prisma; no había dominio de estados, políticas de suscripción o adaptadores externos. La nueva estructura separa `domain`, `modules`, `middleware`, `shared`, `config` e infraestructura de archivos/pagos. Se eligió monolito modular para mantener transacciones y despliegue simples.

## 6. Problemas de seguridad corregidos

- Sesión interna con JWT firmado en cookie HttpOnly, SameSite Strict y Secure en producción.
- CSRF ligado a la sesión, bloqueo progresivo de inicio de sesión y rate limits.
- Permisos concretos y tenant obtenido de sesión o resolución de dominio/slug.
- Consultas administrativas filtradas por tenant; triggers de consistencia cruzada en PostgreSQL.
- Suscripción aplicada en middleware backend.
- Firma e idempotencia de webhooks.
- Carga de imágenes con límite, detección por firma, decodificación, eliminación de metadatos y almacenamiento privado.
- Helmet, CORS restrictivo, límites de payload, errores sanitizados, logs estructurados y correlación.

## 7. Problemas UX/UI corregidos

La reserva pasó de seis a cuatro pasos, agrega “cualquier barbero”, correo opcional, pago, consentimiento, referencia visual y resumen persistente. Se aumentaron objetivos táctiles, foco, etiquetas, contraste y mensajes junto al campo. El sitio adoptó una identidad editorial cálida configurable por tenant y rutas lazy.

## 8. Problemas de base de datos corregidos

Se sustituyó SQLite por PostgreSQL y se creó una migración inicial versionada. Relaciones principales están normalizadas. Precios usan centavos enteros. Una exclusión GiST impide traslapes activos por barbero. FKs, únicos, checks, índices compuestos y triggers protegen integridad.

## 9. Plan de migración por fases

1. **Completada — estabilización:** línea base, errores, configuración, pruebas y CI.
2. **Completada — núcleo SaaS:** tenants, usuarios, permisos, suscripciones y auditoría.
3. **Completada — datos:** PostgreSQL, esquema 3FN, migración y semilla idempotente.
4. **Completada — reservas:** disponibilidad multi-servicio, asignación automática, token privado y bloqueo concurrente.
5. **Completada — pagos/archivos:** adaptadores Mock/Stripe, webhook idempotente, local/S3 y validación de imágenes.
6. **Completada — UX principal:** sitio público, reserva móvil, administración de cita, autenticación y facturación.
7. **Pendiente comercial:** credenciales de Stripe, S3, correo/SMS y dominio.
8. **Pendiente de producto:** persistir inventario, gastos, documentos, feedback y reportes que siguen como demo.

## 10. Funciones preservadas

Catálogo, fichas de barberos, reserva anónima, disponibilidad, contacto, panel, agenda, clientes derivados, finanzas, inventario, documentos y configuración siguen accesibles. Las operaciones reales de agenda ahora exigen permiso. No se incluyó una migración de datos SQLite porque el archivo versionado contenía datos de demostración; el procedimiento para migrar datos reales se describe en `database-design.md`.
