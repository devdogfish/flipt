/*
  Warnings:

  - A unique constraint covering the columns `[dalEmail]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "dalEmail" TEXT,
ADD COLUMN     "fieldOfStudy" TEXT;

-- CreateTable
CREATE TABLE "DeckShare" (
    "deckId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeckShare_pkey" PRIMARY KEY ("deckId","userId")
);

-- CreateTable
CREATE TABLE "DalVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dalEmail" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DalVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeckShare_userId_idx" ON "DeckShare"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DalVerification_userId_key" ON "DalVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DalVerification_token_key" ON "DalVerification"("token");

-- CreateIndex
CREATE INDEX "DalVerification_token_idx" ON "DalVerification"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_dalEmail_key" ON "user"("dalEmail");

-- AddForeignKey
ALTER TABLE "DeckShare" ADD CONSTRAINT "DeckShare_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckShare" ADD CONSTRAINT "DeckShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DalVerification" ADD CONSTRAINT "DalVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
