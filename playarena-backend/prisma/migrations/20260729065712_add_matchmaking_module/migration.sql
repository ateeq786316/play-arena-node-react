-- CreateEnum
CREATE TYPE "MatchRequestStatus" AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'score_pending');

-- CreateTable
CREATE TABLE "match_requests" (
    "id" UUID NOT NULL,
    "challengerTeamId" UUID NOT NULL,
    "opponentTeamId" UUID NOT NULL,
    "groundId" UUID,
    "proposedDate" TIMESTAMP(3),
    "status" "MatchRequestStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_matches" (
    "id" UUID NOT NULL,
    "matchRequestId" UUID,
    "challengerTeamId" UUID NOT NULL,
    "opponentTeamId" UUID NOT NULL,
    "groundId" UUID,
    "scheduledDate" TIMESTAMP(3),
    "status" "MatchStatus" NOT NULL DEFAULT 'scheduled',
    "scoreChallenger" INTEGER,
    "scoreOpponent" INTEGER,
    "scoreSubmittedBy" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "match_requests_challengerTeamId_idx" ON "match_requests"("challengerTeamId");

-- CreateIndex
CREATE INDEX "match_requests_opponentTeamId_idx" ON "match_requests"("opponentTeamId");

-- CreateIndex
CREATE INDEX "match_requests_status_idx" ON "match_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "team_matches_matchRequestId_key" ON "team_matches"("matchRequestId");

-- CreateIndex
CREATE INDEX "team_matches_challengerTeamId_idx" ON "team_matches"("challengerTeamId");

-- CreateIndex
CREATE INDEX "team_matches_opponentTeamId_idx" ON "team_matches"("opponentTeamId");

-- CreateIndex
CREATE INDEX "team_matches_status_idx" ON "team_matches"("status");

-- AddForeignKey
ALTER TABLE "match_requests" ADD CONSTRAINT "match_requests_challengerTeamId_fkey" FOREIGN KEY ("challengerTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_requests" ADD CONSTRAINT "match_requests_opponentTeamId_fkey" FOREIGN KEY ("opponentTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_matches" ADD CONSTRAINT "team_matches_matchRequestId_fkey" FOREIGN KEY ("matchRequestId") REFERENCES "match_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_matches" ADD CONSTRAINT "team_matches_challengerTeamId_fkey" FOREIGN KEY ("challengerTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_matches" ADD CONSTRAINT "team_matches_opponentTeamId_fkey" FOREIGN KEY ("opponentTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
