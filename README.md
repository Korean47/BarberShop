# BarberShop SaaS

Plataforma multi-tenant para barberías construida como monolito modular: React/Vite en el cliente, Express/TypeScript en la API, Prisma y PostgreSQL para persistencia.

## Inicio rápido en Windows

Requisitos: Node.js 22+, npm 10+ y PostgreSQL 16+ (o Docker).

1. Instala y abre Docker Desktop. Espera a que indique **Engine running**. El error `open //./pipe/docker_engine: The system cannot find the file specified` significa que Docker Desktop no está iniciado o que el motor todavía no terminó de arrancar.
2. Desde PowerShell, en la raíz del repositorio, crea los archivos locales:

```powershell
Copy-Item .env.example server/.env
Copy-Item .env.example client/.env
```

3. Cambia en `server/.env` `JWT_SECRET`, `PAYMENT_WEBHOOK_SECRET`, `SEED_OWNER_PASSWORD` y `SEED_PLATFORM_PASSWORD`. Cada secreto debe ser distinto; el JWT debe tener al menos 32 caracteres.
4. Inicia PostgreSQL e instala la aplicación:

```powershell
docker compose up -d postgres
npm run install:all
npm run db:setup
npm run dev
```

5. Abre `http://localhost:5173`. La API escucha en `http://localhost:3001` y el panel en `http://localhost:5173/admin`.

La semilla crea el tenant `blades`; el correo inicial es `owner@blades.mx` y la contraseña es el valor definido en `SEED_OWNER_PASSWORD`. Los valores de desarrollo incluidos como fallback nunca deben usarse fuera de una máquina local.

Si no usarás Docker, instala PostgreSQL 16, crea la base y el usuario indicados en `DATABASE_URL`, y comienza desde `npm run install:all`.

## Pagos y archivos

- `PAYMENT_PROVIDER=disabled`: recomendado hasta conectar un proveedor real; el pago en línea no se ofrece.
- `PAYMENT_PROVIDER=mock`: sólo desarrollo; muestra una pantalla explícita para simular aprobación, rechazo y vencimiento.
- `PAYMENT_PROVIDER=stripe`: producción; requiere `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y un webhook HTTPS en `/api/webhooks/payments`.
- `FILE_STORAGE_PROVIDER=local`: desarrollo. En producción usa `s3` y configura las variables `S3_*`.

La semilla usa `/videos/Horizontal.mp4` en escritorio y `/videos/Vertical.mp4` en móvil, con poster e imágenes de respaldo. El video de portada, su versión móvil, poster, imágenes de respaldo, colores, textos, ubicación y reglas de agenda se publican desde **Administración → Configuración**. Confirma que tienes derechos sobre todo el material y usa HTTPS en producción.

Desde el panel también se administran categorías y servicios, perfiles de barberos, jornadas, descansos, ausencias, horarios semanales de la sucursal y cierres especiales. **Pagos y caja** lee los movimientos persistidos, permite exportarlos y registrar un cobro en efectivo; los pagos en línea sólo cambian mediante el webhook firmado del proveedor.

## Antes de producción

- Usa PostgreSQL administrado con copias de seguridad, TLS y una `DATABASE_URL` exclusiva del entorno.
- Configura dominio HTTPS, CORS/orígenes permitidos y secretos únicos en el gestor de secretos de tu plataforma.
- Conecta Stripe y registra el webhook público antes de habilitar pago en línea.
- Usa almacenamiento S3-compatible para referencias fotográficas y aplica su política de retención.
- Conecta un proveedor transaccional para SMS, WhatsApp o correo. La consulta por teléfono + fecha de la cita funciona sin ese proveedor, con rate limit y token temporal; el envío real de OTP/avisos depende de esta integración.
- Sustituye las imágenes o videos de ejemplo por material propio o con licencia y prueba su carga en dispositivos reales.
- Ejecuta `npm run verify`, migraciones y una prueba de reserva/pago en un entorno de preproducción.

## Verificación

```bash
npm run verify
```

El comando ejecuta lint, tipos, pruebas, builds y presupuestos de rendimiento. Las migraciones se validan contra PostgreSQL en CI.

## Documentación

- [Auditoría del repositorio](docs/repository-audit.md)
- [Auditoría de experiencia y decisiones](docs/customer-experience-audit.md)
- [Arquitectura](docs/architecture.md)
- [Modelo de seguridad](docs/security-model.md)
- [Diseño de base de datos](docs/database-design.md)
- [Suscripciones](docs/subscription-model.md)
- [Despliegue y operación](docs/deployment.md)
- [Privacidad](docs/privacy.md)
- [Pruebas y evidencias](docs/testing.md)
