# Pruebas y evidencias

## Automatización actual

Pruebas del servidor cubren rangos/traslapes, máquina de estados, suscripciones y gracia, firma de webhooks, contraste, contrato de migración y encabezados HTTP. CI levanta PostgreSQL, aplica migraciones y ejecuta tipos, pruebas, lint, build, auditoría de dependencias, secreto scan y presupuesto.

## Comandos

```bash
npm --prefix server test
npm --prefix server run typecheck
npm --prefix client run lint
npm --prefix client run build
npm run performance:check
npm run verify
```

## Evidencia 2026-07-15

- Servidor: 7 archivos, 20 pruebas aprobadas.
- Cliente: 2 archivos, 2 pruebas de componentes aprobadas.
- TypeScript servidor: aprobado.
- ESLint cliente: aprobado.
- Build cliente y servidor: aprobado.
- Dependencias de producción: auditoría automatizada en CI para cliente y servidor.
- JavaScript principal: 497.12 kB → 260.34 kB (−47.6%). Gzip: 148.86 kB → 83.84 kB (−43.7%). El grafo inicial queda en 93 kB gzip, por debajo del presupuesto de 150 kB.
- Hero: 1,698.56 kB → 54.94 kB (−96.8%).

## Pruebas que requieren PostgreSQL/credenciales

CI aplica la migración completa. Antes de producción agregar pruebas de integración con dos tenants que creen/consulten recursos, dos transacciones concurrentes sobre el mismo rango, Stripe CLI para reenvío/duplicado y S3 real con política privada. Ejecutar E2E móvil para reserva, adjunto, login, suspensión y reactivación en un ambiente efímero.
