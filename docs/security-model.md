# Modelo de seguridad

## Activos y límites de confianza

Activos principales: datos personales, agenda, configuración, pagos, estado de suscripción, permisos, archivos y auditoría. Los límites son navegador público, navegador interno, API, PostgreSQL, almacenamiento de objetos y proveedores externos.

## Amenazas principales y controles

| Amenaza | Control implementado |
|---|---|
| BOLA/IDOR entre barberías | Tenant derivado de sesión; filtros explícitos; triggers cruzados; IDs UUID |
| Reserva doble | Transacción serializable + exclusión GiST por barbero y rango |
| Manipulación de precio | Servicios y total se consultan/calculan en backend; snapshots históricos |
| Falsificación de pago | Estado actualizado por webhook firmado e idempotente |
| Reenvío de webhook | `ExternalEvent(provider,eventId)` único + hash del payload |
| Robo de sesión | Cookie HttpOnly/Secure/SameSite, expiración, invalidación al cambiar contraseña |
| CSRF | Token aleatorio dentro del JWT y encabezado requerido para mutaciones por cookie |
| Fuerza bruta | Rate limit por IP y bloqueo progresivo de cuenta |
| XSS | React escapa texto, CSP/Helmet, no se renderiza HTML de tenants |
| SQL injection | Prisma parametriza; no hay SQL dinámico con entrada del usuario |
| Archivo malicioso | 5 MB, formatos permitidos, detección por bytes, Sharp decodifica/re-encodea y quita metadata |
| Enumeración de citas | Token aleatorio de 256 bits almacenado como SHA-256 y con caducidad |
| Exposición de errores | Mensajes sanitizados, códigos estables, correlación; detalles sólo en logs |
| Abuso | Rate limits globales y específicos de login/reserva; límites JSON/multipart |
| SSRF | La API no descarga URLs configuradas; S3/Stripe salen sólo a destinos configurados |

## Autorización

Permisos semilla: `appointments:read/write`, `customers:read/write`, `barbers:read/write`, `billing:read/write`, `settings:read/write`, `reports:read`. Los roles sólo agrupan permisos. El administrador global usa una cuenta separada y rutas `/api/platform` auditadas. Suspender un tenant no modifica su suscripción ni elimina datos.

## Suscripciones

`TRIAL`, `ACTIVE` y `GRACE` vigente permiten operación. Los demás estados devuelven `SUBSCRIPTION_REQUIRED` en disponibilidad, nuevas reservas y rutas administrativas normales. Login, `auth/me` y facturación siguen disponibles para reactivar.

## Archivos

Producción exige almacenamiento S3-compatible con cifrado de servidor. Los objetos no son públicos; la lectura pasa por autorización. Nombres de objeto son UUID, no el nombre enviado. La aplicación conserva sólo nombre original sanitizado para presentación.

## Registro y privacidad

Auditoría guarda actor, tenant, acción, recurso, resultado, IP y correlación. No se registran contraseñas, JWT, tokens de gestión, secretos de webhook, contenido de tarjeta ni payload completo. Stripe tokeniza tarjetas; la aplicación nunca las almacena.

## Riesgos residuales

- Falta integrar un proveedor de detección antivirus para archivos de alto riesgo; el re-encodeo reduce pero no elimina todo riesgo.
- MFA y recuperación de contraseña requieren proveedor de identidad/correo y decisión de producto.
- Rate limiting es en memoria; despliegues con varias réplicas deben usar Redis o gateway compartido.
- RLS no está habilitado porque Prisma necesita una estrategia segura de `SET LOCAL`; los controles de aplicación y triggers cubren las rutas actuales.
- Revisión legal y prueba de penetración independiente siguen siendo necesarias antes de producción.
