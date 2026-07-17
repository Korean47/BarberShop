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

## Evidencia 2026-07-17

- Servidor: 9 archivos, 25 pruebas aprobadas.
- Cliente: 3 archivos, 5 pruebas de componentes aprobadas.
- TypeScript servidor: aprobado.
- ESLint cliente: aprobado.
- Build cliente y servidor: aprobado.
- Dependencias de producción: auditoría automatizada en CI para cliente y servidor.
- Presupuesto inicial: menos de 150 kB gzip; presupuesto de la portada: menos de 200 kB gzip.
- QA real de reservación: creación, consulta segura, reprogramación, límite tardío y cancelación sincronizada con administración.
- QA de pagos: aprobación, rechazo, idempotencia y liberación de horario al vencer la retención.
- QA responsive sin desbordamiento horizontal en 320×568, 360×640, 375×667, 390×844, 412×915, 430×932, 768×1024, 1024×768, 1366×768 y 1440×900.
- Consola del navegador: cero errores y cero advertencias en los recorridos probados.

## Pruebas que requieren PostgreSQL/credenciales

CI aplica la migración completa. Antes de producción ejecutar las mismas pruebas con Stripe CLI, S3 real y el proveedor transaccional seleccionado; mantener pruebas de aislamiento con dos tenants y dos transacciones concurrentes sobre el mismo rango. También debe validarse el medio final licenciado de portada en conexiones lentas y dispositivos físicos.
