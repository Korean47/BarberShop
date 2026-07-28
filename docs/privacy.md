# Privacidad

## Datos y finalidad

- Cliente: nombre, teléfono, correo opcional, notas, consentimiento y referencia visual; gestionar la cita y notificar.
- Personal: nombre, correo, roles, accesos y auditoría; operar el negocio.
- Pago: IDs, importe y estado; conciliación. No se almacenan tarjetas.
- Técnico: IP, correlación, resultado y timestamps; seguridad/diagnóstico.

## Minimización y acceso

Correo del cliente es opcional. Tokens no se almacenan en claro. URLs de administración no contienen PII. Barberos ven sólo información necesaria mediante permisos. Plataforma no obtiene acceso de soporte implícito; cualquier futura suplantación debe ser temporal y auditada.

## Retención

`privacy.customerRetentionDays` prepara política por tenant. Implementar un job que anonimice datos vencidos preservando snapshots contables obligatorios, y otro que elimine archivos según política. Exportación/eliminación debe validar permiso y registrar auditoría.

## Proveedores

PostgreSQL, S3-compatible, Stripe y futuros correo/SMS procesan datos según contrato. Antes de producción se requieren acuerdos, regiones, retención, aviso de privacidad y revisión jurídica aplicable. La implementación no constituye certificación legal.
