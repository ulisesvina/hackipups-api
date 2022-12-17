/*
  Warnings:

  - You are about to drop the column `mascotId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Mascot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_mascotId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mascotId";
ALTER TABLE "User" ADD COLUMN     "petId" STRING;

-- DropTable
DROP TABLE "Mascot";

-- CreateTable
CREATE TABLE "Pet" (
    "id" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" STRING NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
