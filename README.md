# BarberShop SaaS

Plataforma multi-tenant para barberías construida como monolito modular: React/Vite en el cliente, Express/TypeScript en la API, Prisma y PostgreSQL para persistencia.

## Inicio rápido

Requisitos: Node.js 22+, npm 10+ y PostgreSQL 16+ (o Docker).

```bash
cp .env.example server/.env
cp .env.example client/.env
docker compose up -d postgres
npm run install:all
npm run db:setup
npm run dev
```

En PowerShell, usa `Copy-Item .env.example server/.env` y `Copy-Item .env.example client/.env` en lugar de `cp`. Antes de ejecutar la semilla, cambia `SEED_OWNER_PASSWORD` y `SEED_PLATFORM_PASSWORD` en `server/.env`.

Abre `http://localhost:5173`. La API escucha en `http://localhost:3001`.

La semilla crea el tenant `blades`. Define `SEED_OWNER_PASSWORD` antes de ejecutar la semilla; el correo inicial es `owner@blades.mx`. Los valores de desarrollo incluidos como fallback nunca deben usarse fuera de una máquina local.

## Verificación

```bash
npm run verify
```

El comando ejecuta lint, tipos, pruebas, builds y presupuestos de rendimiento. Las migraciones se validan contra PostgreSQL en CI.

## Documentación

- [Auditoría del repositorio](docs/repository-audit.md)
- [Arquitectura](docs/architecture.md)
- [Modelo de seguridad](docs/security-model.md)
- [Diseño de base de datos](docs/database-design.md)
- [Suscripciones](docs/subscription-model.md)
- [Despliegue y operación](docs/deployment.md)
- [Privacidad](docs/privacy.md)
- [Pruebas y evidencias](docs/testing.md)
