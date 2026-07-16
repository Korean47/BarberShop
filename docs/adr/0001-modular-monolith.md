# ADR-0001: monolito modular

Estado: aceptado — 2026-07-15.

## Contexto

La aplicación necesita transacciones entre agenda, pago, suscripción y notificación, pero aún no tiene escala o equipos que justifiquen operación distribuida.

## Decisión

Mantener una API Express desplegable como unidad, dividida por dominios y contratos. PostgreSQL es el origen transaccional. Integraciones quedan detrás de interfaces.

## Consecuencias

Menor complejidad, despliegue y depuración simples, consistencia fuerte. Una falla puede afectar más módulos y el escalado es conjunto; métricas por módulo permitirán decidir extracciones futuras con evidencia.
