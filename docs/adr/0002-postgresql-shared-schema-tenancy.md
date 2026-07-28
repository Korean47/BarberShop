# ADR-0002: PostgreSQL con esquema compartido

Estado: aceptado — 2026-07-15.

## Contexto

SQLite no soporta la concurrencia, restricciones de rango y operación SaaS requeridas. Las alternativas fueron base por tenant, esquema por tenant o tablas compartidas con `tenantId`.

## Decisión

PostgreSQL con tablas compartidas y `tenantId`, UUID, filtros de aplicación, índices compuestos y triggers cruzados. No se habilita RLS hasta garantizar `SET LOCAL` por transacción con el pool de Prisma.

## Consecuencias

Onboarding y migraciones sencillos, utilización eficiente y reportes globales posibles. El olvido de filtro es un riesgo, mitigado por middleware, revisión, pruebas y triggers. Tenants con requisitos regulatorios especiales podrían migrar a base dedicada detrás del mismo repositorio.
