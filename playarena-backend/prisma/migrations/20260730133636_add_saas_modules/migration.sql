-- CreateEnum
CREATE TYPE "PlanInterval" AS ENUM ('monthly', 'yearly');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'past_due', 'suspended', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('pending', 'under_review', 'resolved', 'dismissed');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('booking_conflict', 'no_show', 'damage', 'other');

-- CreateEnum
CREATE TYPE "BroadcastStatus" AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "interval" "PlanInterval" NOT NULL,
    "maxGrounds" INTEGER NOT NULL,
    "maxCourtsPerGround" INTEGER NOT NULL,
    "maxBookingsPerMonth" INTEGER,
    "commissionRate" DECIMAL(5,4) NOT NULL,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ground_owner_subscriptions" (
    "id" UUID NOT NULL,
    "groundOwnerId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ground_owner_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "status" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "invoiceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" UUID NOT NULL,
    "groundId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "totalRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "onlineRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "offlineRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "completedBookings" INTEGER NOT NULL DEFAULT 0,
    "cancelledBookings" INTEGER NOT NULL DEFAULT 0,
    "utilizationRate" DECIMAL(5,2),
    "newCustomers" INTEGER NOT NULL DEFAULT 0,
    "returningCustomers" INTEGER NOT NULL DEFAULT 0,
    "avgBookingValue" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_aggregations" (
    "id" UUID NOT NULL,
    "groundId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "hour" INTEGER NOT NULL,
    "courtId" UUID NOT NULL,
    "bookings" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "daily_aggregations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broadcast_messages" (
    "id" UUID NOT NULL,
    "groundId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "audience" JSONB,
    "status" "BroadcastStatus" NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_logs" (
    "id" UUID NOT NULL,
    "broadcastId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "status" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_communication_preferences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "marketing" BOOLEAN NOT NULL DEFAULT true,
    "bookingUpdates" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_communication_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" UUID NOT NULL,
    "groundId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "startTime" TEXT,
    "endTime" TEXT,
    "multiplier" DECIMAL(5,2) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holiday_pricing" (
    "id" UUID NOT NULL,
    "groundId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "multiplier" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holiday_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL,
    "groundId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "minBookingAmount" DECIMAL(12,2),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_usages" (
    "id" UUID NOT NULL,
    "couponId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "filedById" UUID NOT NULL,
    "type" "DisputeType" NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "evidence" JSONB,
    "status" "DisputeStatus" NOT NULL DEFAULT 'pending',
    "resolution" TEXT,
    "resolvedById" UUID,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "damage_claims" (
    "id" UUID NOT NULL,
    "disputeId" UUID,
    "groundId" UUID NOT NULL,
    "reportedById" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "damageType" TEXT NOT NULL,
    "estimatedCost" DECIMAL(12,2),
    "images" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "damage_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "no_show_penalties" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "no_show_penalties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ground_owner_subscriptions_groundOwnerId_key" ON "ground_owner_subscriptions"("groundOwnerId");

-- CreateIndex
CREATE INDEX "ground_owner_subscriptions_groundOwnerId_status_idx" ON "ground_owner_subscriptions"("groundOwnerId", "status");

-- CreateIndex
CREATE INDEX "ground_owner_subscriptions_planId_idx" ON "ground_owner_subscriptions"("planId");

-- CreateIndex
CREATE INDEX "invoices_subscriptionId_idx" ON "invoices"("subscriptionId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "analytics_snapshots_groundId_date_idx" ON "analytics_snapshots"("groundId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_snapshots_groundId_date_key" ON "analytics_snapshots"("groundId", "date");

-- CreateIndex
CREATE INDEX "daily_aggregations_groundId_date_idx" ON "daily_aggregations"("groundId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_aggregations_groundId_courtId_date_hour_key" ON "daily_aggregations"("groundId", "courtId", "date", "hour");

-- CreateIndex
CREATE INDEX "broadcast_messages_groundId_status_idx" ON "broadcast_messages"("groundId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "communication_logs_broadcastId_userId_key" ON "communication_logs"("broadcastId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_communication_preferences_userId_key" ON "user_communication_preferences"("userId");

-- CreateIndex
CREATE INDEX "pricing_rules_groundId_isActive_idx" ON "pricing_rules"("groundId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "holiday_pricing_groundId_date_key" ON "holiday_pricing"("groundId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_groundId_idx" ON "coupons"("groundId");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_usages_couponId_bookingId_key" ON "coupon_usages"("couponId", "bookingId");

-- CreateIndex
CREATE INDEX "disputes_bookingId_idx" ON "disputes"("bookingId");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "disputes_filedById_idx" ON "disputes"("filedById");

-- CreateIndex
CREATE UNIQUE INDEX "damage_claims_disputeId_key" ON "damage_claims"("disputeId");

-- CreateIndex
CREATE INDEX "damage_claims_groundId_idx" ON "damage_claims"("groundId");

-- CreateIndex
CREATE UNIQUE INDEX "no_show_penalties_bookingId_key" ON "no_show_penalties"("bookingId");

-- CreateIndex
CREATE INDEX "no_show_penalties_bookingId_idx" ON "no_show_penalties"("bookingId");

-- CreateIndex
CREATE INDEX "grounds_latitude_longitude_idx" ON "grounds"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "ground_owner_subscriptions" ADD CONSTRAINT "ground_owner_subscriptions_groundOwnerId_fkey" FOREIGN KEY ("groundOwnerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ground_owner_subscriptions" ADD CONSTRAINT "ground_owner_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "ground_owner_subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES "grounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_aggregations" ADD CONSTRAINT "daily_aggregations_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES "grounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broadcast_messages" ADD CONSTRAINT "broadcast_messages_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES "grounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "broadcast_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_communication_preferences" ADD CONSTRAINT "user_communication_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES "grounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_pricing" ADD CONSTRAINT "holiday_pricing_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES "grounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES "grounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_filedById_fkey" FOREIGN KEY ("filedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "damage_claims" ADD CONSTRAINT "damage_claims_groundId_fkey" FOREIGN KEY ("groundId") REFERENCES "grounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "damage_claims" ADD CONSTRAINT "damage_claims_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
