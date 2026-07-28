import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('database migration contract', () => {
  it('targets PostgreSQL and protects tenant integrity and booking concurrency', async () => {
    const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
    const migration = await readFile(
      new URL('../prisma/migrations/20260715000100_saas_foundation/migration.sql', import.meta.url),
      'utf8',
    );
    const experienceMigration = await readFile(
      new URL('../prisma/migrations/20260717000100_customer_experience/migration.sql', import.meta.url),
      'utf8',
    );
    const reconciliationMigration = await readFile(
      new URL('../prisma/migrations/20260717000200_reconcile_cancelled_payments/migration.sql', import.meta.url),
      'utf8',
    );
    expect(schema).toContain('provider = "postgresql"');
    expect(schema).not.toContain('provider = "sqlite"');
    expect(migration).toContain('Appointment_no_barber_overlap');
    expect(migration).toContain('Appointment_tenant_consistency');
    expect(migration).toContain('AppointmentService_tenant_consistency');
    expect(migration).toContain('ExternalEvent_provider_externalEventId_key');
    expect(experienceMigration).toContain('Appointment_tenantId_publicCode_key');
    expect(experienceMigration).toContain('holdExpiresAt');
    expect(experienceMigration).toContain('LocationScheduleException');
    expect(experienceMigration).toContain('ServicePriceType');
    expect(reconciliationMigration).toContain('payment."status" = \'PENDING\'');
    expect(reconciliationMigration).toContain('appointment."status" = \'CANCELLED\'');
    expect(reconciliationMigration).toContain('SET "status" = \'CANCELLED\'');
  });
});
