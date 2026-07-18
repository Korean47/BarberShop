# Despliegue y operación

## Topología recomendada

Cliente estático detrás de CDN; API Express con al menos dos réplicas; PostgreSQL administrado con backups/PITR; S3-compatible privado; Stripe; gateway TLS. Servir cliente y API bajo el mismo sitio simplifica cookies y CSP (`app.example.com` y `/api`).

## Variables

Copiar `.env.example` a un gestor de secretos, nunca a una imagen. Producción exige `NODE_ENV=production`, URL PostgreSQL con TLS, secretos JWT/webhook aleatorios, `PAYMENT_PROVIDER=stripe`, claves Stripe, `FILE_STORAGE_PROVIDER=s3`, bucket y credenciales de mínimo privilegio. `ALLOWED_ORIGINS` debe contener sólo orígenes públicos exactos.

## Build reproducible

```bash
npm ci
npm ci --prefix client
npm ci --prefix server
npm --prefix server run prisma:generate
npm run verify
```

## Base de datos

```bash
npm --prefix server run db:migrate
SEED_OWNER_PASSWORD='valor-seguro' npm --prefix server run db:seed
```

La semilla es idempotente, pero en producción debe ejecutarse sólo para bootstrap autorizado. Cambiar inmediatamente la contraseña inicial.

## Inicio

```bash
npm --prefix server run start
```

Publicar `client/dist` en CDN y redirigir rutas SPA a `index.html`. El balanceador debe comprobar `/api/health/live`; readiness usa `/api/health/ready`.

## Nueva barbería

1. Crear `Tenant` con slug, timezone, moneda y locale.
2. Crear `TenantBranding`, una `Location` por defecto y horarios.
3. Asociar `Subscription` a un plan y cliente del proveedor.
4. Crear rol owner, usuario con hash bcrypt y permisos.
5. Crear categorías, servicios, barberos, capacidades y horarios.
6. Añadir/verificar dominio y configurar DNS/TLS.
7. Probar aislamiento con una cuenta de tenant distinto antes de publicar.

La semilla muestra el orden; para operación real conviene convertirlo en un comando administrativo que reciba los datos y registre auditoría.

## Pagos

La reserva crea primero una cita pendiente con retención temporal. El cliente se envía a un checkout alojado y sólo un evento firmado cambia el pago a pagado y la cita a confirmada. Un rechazo o vencimiento cancela la cita pendiente y libera el horario. Las claves nunca se exponen al cliente y el modo `mock` está bloqueado cuando `NODE_ENV=production`.

Para desarrollo puede usarse `PAYMENT_PROVIDER=mock`. Para operar sin cobro en línea usa `PAYMENT_PROVIDER=disabled`; la interfaz oculta esa opción y conserva pago en el local.

### Stripe

1. Crear claves restringidas y endpoint webhook HTTPS.
2. Configurar los eventos `checkout.session.completed` y `checkout.session.expired` para reservaciones. Los eventos de suscripción siguen en el flujo de billing separado.
3. Guardar secret del endpoint en `STRIPE_WEBHOOK_SECRET`.
4. Apuntar el webhook de reservaciones a `https://TU_DOMINIO/api/webhooks/payments`.
5. Ejecutar aprobación, rechazo, abandono y reenvío duplicado; comprobar `ExternalEvent`, `PaymentAttempt`, `Payment` y `AppointmentHistory`.
6. No activar pago online en `TenantSetting` antes de completar conciliación y política de reembolso.

La pantalla administrativa indica si el proveedor está configurado, pero no muestra ni permite editar secretos.

## Medios de la portada

La portada acepta video de escritorio, video móvil, poster e imágenes de respaldo. El video debe estar optimizado para web, reproducirse sin audio y disponer de poster. Si no existe video, falla o la persona prefiere movimiento reducido, se conserva una imagen funcional. En producción sirve estos medios desde CDN/S3 con URLs HTTPS y derechos de uso verificados.

## Notificaciones y acceso a citas

El acceso público requiere teléfono y fecha de la cita, rota el token de gestión y aplica rate limit. Si hay varias citas para esos datos, la persona selecciona el horario correcto. El repositorio registra los eventos de notificación, pero el envío real por SMS, WhatsApp o correo requiere conectar un proveedor transaccional antes de prometer OTP o confirmaciones automáticas al cliente.

## Backup y restauración

Backup diario + PITR según RPO. Probar restauración trimestral en una cuenta aislada.

```bash
pg_dump --format=custom --no-owner "$DATABASE_URL" > barbershop.dump
pg_restore --clean --if-exists --no-owner --dbname "$RESTORE_DATABASE_URL" barbershop.dump
```

Objetos S3 requieren versionado y ciclo de vida compatible con la retención. Restaurar DB y objetos al mismo punto lógico.

## Rollout y rollback

Aplicar migraciones compatibles hacia adelante antes de desplegar código. Cambios destructivos usan expand/migrate/contract en releases separadas. Para rollback de aplicación, volver a la imagen anterior; no revertir una migración con datos sin un script probado. Detener rollout si readiness, error rate, webhooks o reservas 409 suben fuera del umbral.
