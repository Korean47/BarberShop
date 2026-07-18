UPDATE "Payment" AS payment
SET "status" = 'CANCELLED', "updatedAt" = CURRENT_TIMESTAMP
FROM "Appointment" AS appointment
WHERE payment."appointmentId" = appointment."id"
  AND payment."status" = 'PENDING'
  AND appointment."status" = 'CANCELLED';
