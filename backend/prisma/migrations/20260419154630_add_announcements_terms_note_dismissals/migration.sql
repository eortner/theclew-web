-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "termsNote" TEXT;

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDismissal" (
    "id" TEXT NOT NULL,
    "announcementKey" TEXT NOT NULL,
    "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserDismissal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Announcement_key_key" ON "Announcement"("key");

-- CreateIndex
CREATE INDEX "UserDismissal_userId_idx" ON "UserDismissal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDismissal_userId_announcementKey_key" ON "UserDismissal"("userId", "announcementKey");

-- AddForeignKey
ALTER TABLE "UserDismissal" ADD CONSTRAINT "UserDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDismissal" ADD CONSTRAINT "UserDismissal_announcementKey_fkey" FOREIGN KEY ("announcementKey") REFERENCES "Announcement"("key") ON DELETE CASCADE ON UPDATE CASCADE;
