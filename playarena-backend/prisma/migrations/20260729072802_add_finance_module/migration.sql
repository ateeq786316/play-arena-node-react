-- CreateEnum
CREATE TYPE "CashSessionStatus" AS ENUM ('open', 'closed');

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ground_payment_methods" (
    "groundId" UUID NOT NULL,
    "paymentMethodId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ground_payment_methods_pkey" PRIMARY KEY ("groundId","paymentMethodId")
);

-- CreateTable
CREATE TABLE "region_payment_methods" (
    "regionId" UUID NOT NULL,
    "paymentMethodId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "region_payment_methods_pkey" PRIMARY KEY ("regionId","paymentMethodId")
);

-- CreateTable
CREATE TABLE "cash_sessions" (
    "id" UUID NOT NULL,
    "groundId" UUID NOT NULL,
    "openedById" UUID NOT NULL,
    "closedById" UUID,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "openingCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "closingCash" DECIMAL(12,2),
    "expectedCash" DECIMAL(12,2),
    "variance" DECIMAL(12,2),
    "status" "CashSessionStatus" NOT NULL DEFAULT 'open',
    "notes" TEXT,

    CONSTRAINT "cash_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_session_payments" (
    "id" UUID NOT NULL,
    "cashSessionId" UUID NOT NULL,
    "bookingPaymentId" UUID NOT NULL,

    CONSTRAINT "cash_session_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_name_key" ON "payment_methods"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_slug_key" ON "payment_methods"("slug");

-- CreateIndex
CREATE INDEX "cash_sessions_groundId_status_idx" ON "cash_sessions"("groundId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "cash_session_payments_cashSessionId_bookingPaymentId_key" ON "cash_session_payments"("cashSessionId", "bookingPaymentId");

-- AddForeignKey
ALTER TABLE "ground_payment_methods" ADD CONSTRAINT "ground_payment_methods_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES "grounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ground_payment_methods" ADD CONSTRAINT "ground_payment_methods_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "region_payment_methods" ADD CONSTRAINT "region_payment_methods_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "region_payment_methods" ADD CONSTRAINT "region_payment_methods_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES "grounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_session_payments" ADD CONSTRAINT "cash_session_payments_cashSessionId_fkey" FOREIGN KEY ("cashSessionId") REFERENCES "cash_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_session_payments" ADD CONSTRAINT "cash_session_payments_bookingPaymentId_fkey" FOREIGN KEY ("bookingPaymentId") REFERENCES "booking_payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
