# Diseño de base de datos

## Motor y normalización

PostgreSQL es obligatorio. El esquema está en tercera forma normal para relaciones operativas. Horarios, especialidades, permisos, servicios por barbero y estados históricos son tablas, no listas o JSON. Importes usan centavos enteros y moneda ISO para evitar errores de coma flotante.

## Agregados

- Tenant: `Tenant`, `TenantDomain`, `TenantBranding`, `TenantSetting`, `Location`.
- Suscripción: `SubscriptionPlan`, `Subscription`, `SubscriptionEvent`.
- Identidad: `InternalUser`, `Role`, `Permission`, `UserRole`, `RolePermission`.
- Operación: `BarberProfile`, especialidades, servicios, horarios, descansos y ausencias.
- Cliente/reserva: `Customer`, `Appointment`, `AppointmentService`, historial e imágenes.
- Dinero: `Payment`, `PaymentAttempt`, `Refund`.
- Integraciones: `ExternalEvent`, `Notification`, `NotificationTemplate`, `AuditLog`.

## Duplicación histórica intencional

`AppointmentService` conserva nombre, duración y precio al reservar. `Appointment.totalCents/currency` conserva el total acordado. Estos snapshots no sustituyen la FK al servicio; protegen historia y conciliación cuando cambia el catálogo.

## Integridad y concurrencia

- FKs evitan huérfanos.
- Índices comienzan por `tenantId` en listados privados.
- UUID reduce enumeración.
- `Appointment_no_barber_overlap` usa `tstzrange` y GiST, sólo para estados que ocupan agenda.
- La creación usa aislamiento Serializable y vuelve a verificar suscripción, servicios, importe y conflicto.
- Webhooks, notificaciones e intentos de pago tienen claves idempotentes únicas.
- Triggers verifican que location, barber, customer, service y payment pertenezcan al mismo tenant.
- Checks validan rangos horarios, importes y duraciones.

## Zonas horarias

Se guardan instantes UTC (`timestamptz`) y el IANA timezone del tenant. Luxon convierte fecha/hora local a UTC. Esto maneja cambios de horario del tenant sin almacenar horas ambiguas. Horarios semanales se expresan como minutos desde medianoche local.

## Migrar datos reales desde la versión SQLite

El `dev.db` eliminado era demo y no se copia. Para una base con datos reales:

1. Crear un tenant, ubicación, plan y suscripción destino.
2. Exportar barberos, servicios, clientes y citas en modo sólo lectura.
3. Convertir horarios JSON a `BarberSchedule` y especialidades a tablas puente.
4. Convertir precio a centavos y fecha/hora local a `timestamptz` con timezone confirmado.
5. Importar en ese orden dentro de transacciones, conservando una tabla temporal de IDs.
6. Ejecutar conteos, totales, detección de huérfanos y traslapes antes de cambiar tráfico.
7. Conservar el origen como respaldo inmutable durante el periodo acordado.

No ejecutar `prisma db push` en producción; usar `prisma migrate deploy`.
