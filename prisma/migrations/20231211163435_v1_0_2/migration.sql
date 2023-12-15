/*
  Warnings:

  - The values [USER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `created_by` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `notification_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `facebookId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `forgotPasswordToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verifyEmailToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_course_teachers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,status]` on the table `notification_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[google_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facebook_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `created_by_id` to the `enrollments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `notification_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'STUDENT', 'TEACHER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
COMMIT;

-- DropForeignKey
ALTER TABLE "_course_teachers" DROP CONSTRAINT "_course_teachers_A_fkey";

-- DropForeignKey
ALTER TABLE "_course_teachers" DROP CONSTRAINT "_course_teachers_B_fkey";

-- DropForeignKey
ALTER TABLE "notification_tokens" DROP CONSTRAINT "notification_tokens_userId_fkey";

-- DropIndex
DROP INDEX "notification_tokens_userId_status_key";

-- DropIndex
DROP INDEX "users_facebookId_key";

-- DropIndex
DROP INDEX "users_googleId_key";

-- AlterTable
ALTER TABLE "enrollments" DROP COLUMN "created_by",
ADD COLUMN     "created_by_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "notification_tokens" DROP COLUMN "userId",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "facebookId",
DROP COLUMN "firstName",
DROP COLUMN "forgotPasswordToken",
DROP COLUMN "googleId",
DROP COLUMN "lastName",
DROP COLUMN "phoneNumber",
DROP COLUMN "verifyEmailToken",
ADD COLUMN     "facebook_id" TEXT,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "forgot_password_token" TEXT,
ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "verify_email_token" TEXT,
ALTER COLUMN "role" SET DEFAULT 'STUDENT';

-- DropTable
DROP TABLE "_course_teachers";

-- CreateTable
CREATE TABLE "course_teachers" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_teachers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_teachers_course_id_teacher_id_key" ON "course_teachers"("course_id", "teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_tokens_user_id_status_key" ON "notification_tokens"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_facebook_id_key" ON "users"("facebook_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_student_id_key" ON "users"("student_id");

-- AddForeignKey
ALTER TABLE "notification_tokens" ADD CONSTRAINT "notification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_teachers" ADD CONSTRAINT "course_teachers_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_teachers" ADD CONSTRAINT "course_teachers_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
