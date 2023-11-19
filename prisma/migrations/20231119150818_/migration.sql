/*
  Warnings:

  - You are about to drop the column `isEmailConfirmed` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "isEmailConfirmed",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "verifyEmailToken" TEXT;
