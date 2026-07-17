CREATE TYPE "ServicePriceType" AS ENUM ('FIXED', 'STARTING_AT', 'ESTIMATE', 'CONFIRM');

ALTER TABLE "TenantBranding"
  ADD COLUMN "heroVideoUrl" VARCHAR(500),
  ADD COLUMN "heroMobileVideoUrl" VARCHAR(500),
  ADD COLUMN "heroPosterUrl" VARCHAR(500),
  ADD COLUMN "heroFallbackUrls" TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN "heroTitle" VARCHAR(180) NOT NULL DEFAULT 'Cortes y barba, con tiempo para hacerlo bien.',
  ADD COLUMN "heroSubtitle" VARCHAR(300) NOT NULL DEFAULT 'Elige servicio, barbero y horario. Tu cita queda lista en pocos pasos.',
  ADD COLUMN "shopImageUrl" VARCHAR(500),
  ADD COLUMN "mapUrl" VARCHAR(500),
  ADD COLUMN "whatsappUrl" VARCHAR(500),
  ADD COLUMN "instagramUrl" VARCHAR(500);

ALTER TABLE "TenantBranding"
  ALTER COLUMN "primaryColor" SET DEFAULT '#183A44',
  ALTER COLUMN "secondaryColor" SET DEFAULT '#17191C',
  ALTER COLUMN "accentColor" SET DEFAULT '#B8543C',
  ALTER COLUMN "backgroundColor" SET DEFAULT '#F5F2EB';

ALTER TABLE "Location" ADD COLUMN "mapsUrl" VARCHAR(500);

CREATE TABLE "LocationScheduleException" (
  "id" UUID NOT NULL,
  "locationId" UUID NOT NULL,
  "date" DATE NOT NULL,
  "isOpen" BOOLEAN NOT NULL DEFAULT false,
  "startMinute" INTEGER,
  "endMinute" INTEGER,
  "label" VARCHAR(160),
  CONSTRAINT "LocationScheduleException_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LocationScheduleException_locationId_date_key" ON "LocationScheduleException"("locationId", "date");
CREATE INDEX "LocationScheduleException_locationId_date_idx" ON "LocationScheduleException"("locationId", "date");
ALTER TABLE "LocationScheduleException" ADD CONSTRAINT "LocationScheduleException_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Service" ADD COLUMN "priceType" "ServicePriceType" NOT NULL DEFAULT 'FIXED';

ALTER TABLE "Appointment"
  ADD COLUMN "publicCode" VARCHAR(12),
  ADD COLUMN "holdExpiresAt" TIMESTAMPTZ(3);

UPDATE "Appointment"
SET "publicCode" = UPPER(SUBSTRING(REPLACE("id"::text, '-', '') FROM 1 FOR 8));

ALTER TABLE "Appointment" ALTER COLUMN "publicCode" SET NOT NULL;
CREATE UNIQUE INDEX "Appointment_tenantId_publicCode_key" ON "Appointment"("tenantId", "publicCode");

ALTER TABLE "Payment" ADD COLUMN "checkoutExpiresAt" TIMESTAMPTZ(3);
