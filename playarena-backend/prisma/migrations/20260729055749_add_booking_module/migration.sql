-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending_payment_verification', 'approved', 'rejected', 'expired', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'partial', 'paid', 'overpaid');

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "groundId" UUID NOT NULL,
    "courtId" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "depositAmount" DECIMAL(12,2),
    "status" "BookingStatus" NOT NULL DEFAULT 'pending_payment_verification',
    "playerName" TEXT,
    "playerPhone" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_finance" (
    "bookingId" UUID NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "onlineReceived" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "offlineReceived" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_finance_pkey" PRIMARY KEY ("bookingId")
);

-- CreateTable
CREATE TABLE "booking_payments" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "channel" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "recordedById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookings_groundId_status_idx" ON "bookings"("groundId", "status");

-- CreateIndex
CREATE INDEX "bookings_courtId_date_startTime_endTime_idx" ON "bookings"("courtId", "date", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "bookings_playerId_status_idx" ON "bookings"("playerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "booking_payments_idempotencyKey_key" ON "booking_payments"("idempotencyKey");

-- CreateIndex
CREATE INDEX "booking_payments_bookingId_idx" ON "booking_payments"("bookingId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES "grounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_finance" ADD CONSTRAINT "booking_finance_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
