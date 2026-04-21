-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'MERGED';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "monthlyRevenue" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "pitchDeck" TEXT,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "teamSize" INTEGER DEFAULT 1,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "ProjectOwnership" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "equityPercent" DOUBLE PRECISION NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'FOUNDER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectOwnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "approve" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectOwnership_projectId_idx" ON "ProjectOwnership"("projectId");

-- CreateIndex
CREATE INDEX "ProjectOwnership_userId_idx" ON "ProjectOwnership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectOwnership_projectId_userId_key" ON "ProjectOwnership"("projectId", "userId");

-- CreateIndex
CREATE INDEX "Vote_threadId_idx" ON "Vote"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_threadId_userId_key" ON "Vote"("threadId", "userId");

-- AddForeignKey
ALTER TABLE "ProjectOwnership" ADD CONSTRAINT "ProjectOwnership_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectOwnership" ADD CONSTRAINT "ProjectOwnership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
