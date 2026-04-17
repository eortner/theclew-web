-- DropIndex
DROP INDEX "tag_embedding_hnsw_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totpSecret" TEXT,
ADD COLUMN     "totpVerifiedAt" TIMESTAMP(3);
