ALTER TABLE "TenantBranding"
  ALTER COLUMN "fontFamily" SET DEFAULT 'contemporary';

UPDATE "TenantBranding"
SET "fontFamily" = 'contemporary'
WHERE "fontFamily" NOT IN ('contemporary', 'technical', 'signage');
