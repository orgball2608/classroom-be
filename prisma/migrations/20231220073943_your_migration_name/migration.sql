/*
  Warnings:

  - You are about to drop the column `course_order` on the `course_teachers` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `course_teachers` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `course_order` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `grade_struct_id` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - The `student_id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `grade_structs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `grade_composition_id` to the `grades` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "grade_structs" DROP CONSTRAINT "grade_structs_course_id_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_grade_struct_id_fkey";

-- DropIndex
DROP INDEX "course_teachers_teacher_id_course_order_key";

-- DropIndex
DROP INDEX "enrollments_student_id_course_order_key";

-- AlterTable
ALTER TABLE "course_teachers" DROP COLUMN "course_order",
DROP COLUMN "status",
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "status",
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "enrollments" DROP COLUMN "course_order",
DROP COLUMN "status",
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "grades" DROP COLUMN "grade_struct_id",
DROP COLUMN "status",
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "grade_composition_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "status",
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
DROP COLUMN "student_id",
ADD COLUMN     "student_id" INTEGER;

-- DropTable
DROP TABLE "grade_structs";

-- CreateTable
CREATE TABLE "grade_compositions" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "scale" INTEGER NOT NULL,
    "index" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_compositions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grade_compositions_course_id_index_deleted_key" ON "grade_compositions"("course_id", "index", "deleted");

-- CreateIndex
CREATE UNIQUE INDEX "users_student_id_key" ON "users"("student_id");

-- AddForeignKey
ALTER TABLE "grade_compositions" ADD CONSTRAINT "grade_compositions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_compositions" ADD CONSTRAINT "grade_compositions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_grade_composition_id_fkey" FOREIGN KEY ("grade_composition_id") REFERENCES "grade_compositions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
