# Modelo de suscripción

## Estados

| Estado | Operación | Facturación |
|---|---|---|
| `TRIAL` | Permitida | Permitida |
| `ACTIVE` | Permitida | Permitida |
| `PAST_DUE` | Bloqueada hasta política de gracia | Permitida |
| `GRACE` | Permitida hasta `graceEndsAt` | Permitida |
| `SUSPENDED` | Bloqueada | Permitida |
| `CANCELLED` | Bloqueada | Permitida |
| `EXPIRED` | Bloqueada | Permitida |

`Tenant.status=SUSPENDED` es un bloqueo administrativo independiente y siempre prevalece.

## Fuente de verdad

El navegador no puede cambiar estados. Stripe envía eventos firmados a `/api/webhooks/payments`; `PaymentProvider` valida la firma y `ExternalEvent` evita duplicados. El evento actualiza la suscripción y agrega `SubscriptionEvent`. Un job de conciliación programado debe comparar periódicamente proveedor y estado local cuando se conecte la cuenta de producción.

## Gracia y reactivación

El plan define `graceDays`; `graceEndsAt` materializa la fecha efectiva. Durante suspensión se conservan datos y se permite login, consulta de cuenta y `/api/billing/reactivation`. El estado sólo vuelve a activo tras confirmación confiable del proveedor o una acción auditada de plataforma conforme a política de soporte.

## Proveedores

- `mock`: pruebas/desarrollo; configuración de producción lo rechaza.
- `stripe`: crea PaymentIntents, usa claves de idempotencia y valida el cuerpo crudo del webhook.

Para otro proveedor, implementar `PaymentProvider` y registrarlo sin cambiar casos de uso de cita.
