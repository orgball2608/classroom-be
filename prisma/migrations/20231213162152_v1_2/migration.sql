/*
  Warnings:

  - You are about to drop the column `created_by` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `notification_token_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the `notification_tokens` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[teacher_id,course_order]` on the table `course_teachers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `courses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_id,course_order]` on the table `enrollments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "notification_tokens" DROP CONSTRAINT "notification_tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_notification_token_id_fkey";

-- AlterTable
ALTER TABLE "course_teachers" ADD COLUMN     "course_order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "course_order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "created_by",
DROP COLUMN "notification_token_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "notification_tokens";

-- DropEnum
DROP TYPE "FirebaseTokenStatus";

-- CreateTable
CREATE TABLE "grade_structs" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "scale" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_structs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "grade_struct_id" INTEGER NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_teachers_teacher_id_course_order_key" ON "course_teachers"("teacher_id", "course_order");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_course_order_key" ON "enrollments"("student_id", "course_order");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_structs" ADD CONSTRAINT "grade_structs_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_grade_struct_id_fkey" FOREIGN KEY ("grade_struct_id") REFERENCES "grade_structs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
