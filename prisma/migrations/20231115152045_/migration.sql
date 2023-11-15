/*
  Warnings:

  - You are about to drop the column `resetPasswordExpires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VerifyStatus" AS ENUM ('UNVERIFY', 'VERIFY');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "resetPasswordExpires",
DROP COLUMN "resetPasswordToken",
ADD COLUMN     "forgotPasswordToken" TEXT,
ADD COLUMN     "verify" "VerifyStatus" NOT NULL DEFAULT 'UNVERIFY',
ALTER COLUMN "isEmailConfirmed" SET DEFAULT false;
