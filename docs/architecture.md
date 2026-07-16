# Arquitectura

## Decisión principal

Se usa un monolito modular. Las reservas, pagos, suscripciones y auditoría necesitan consistencia transaccional; separarlas en microservicios aumentaría fallos distribuidos sin una necesidad demostrada. Los límites actuales permiten extraer un módulo detrás de su interfaz cuando volumen o aislamiento operativo lo justifiquen.

```text
React/Vite
  ├─ sitio público y tema del tenant
  ├─ reserva anónima / administración por token
  └─ panel interno / sesión HttpOnly
          │ HTTPS + JSON/multipart
Express API
  ├─ middleware: correlación, tenant, auth, permisos, suscripción, CSRF
  ├─ catalog / availability / appointments
  ├─ auth / admin / billing / platform
  ├─ payments / files / webhooks / audit
  └─ domain: estados, horarios, contraste, políticas
          │ Prisma + transacciones serializables
PostgreSQL ── S3-compatible storage ── Stripe
```

## Capas

- `server/src/domain`: reglas puras sin Express ni Prisma.
- `server/src/modules`: casos de uso y presentación HTTP agrupados por dominio.
- `server/src/middleware`: políticas transversales.
- `server/src/shared`: errores, criptografía y logging.
- `server/src/config`: validación de ambiente al iniciar.
- `server/prisma`: modelo, migraciones y semilla.
- `client/src/components`: piezas visuales reutilizables; `booking` separa cada paso.
- `client/src/context` y `hooks`: sesión y configuración del tenant.
- `client/src/services`: único cliente HTTP tipado.

## Resolución de tenant

Para público, el hostname verificado es la señal preferida; en desarrollo se permite `X-Tenant-Slug`. El valor sólo selecciona una vitrina pública. Operaciones internas ignoran IDs del navegador y derivan `tenantId` de la sesión. Cada consulta de datos privados incluye `tenantId` y los triggers impiden conectar citas, servicios o pagos de tenants diferentes.

## Contratos externos

`PaymentProvider` abstrae intención de pago y verificación de webhook. Hay adaptadores Mock (sólo desarrollo) y Stripe. `FileStorage` abstrae put/get/remove con adaptadores local y S3. Los proveedores de correo, SMS y trabajos asíncronos son el siguiente punto de extensión; la tabla `Notification` ya define idempotencia, reintentos y estado.

## Decisiones de UI

La configuración publicada de `TenantBranding` se convierte en variables CSS. El servidor rechaza paletas con contraste insuficiente. Las rutas se cargan de forma diferida; la vista inicial no incorpora el panel o la reserva hasta necesitarlos. Animaciones respetan `prefers-reduced-motion`.

## ADR

- [ADR-0001: monolito modular](adr/0001-modular-monolith.md)
- [ADR-0002: PostgreSQL y aislamiento compartido](adr/0002-postgresql-shared-schema-tenancy.md)
