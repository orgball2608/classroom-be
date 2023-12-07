/*
  Warnings:

  - You are about to drop the column `class_id` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the `_class_teachers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `classes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[student_id,course_id]` on the table `enrollments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `course_id` to the `enrollments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_class_teachers" DROP CONSTRAINT "_class_teachers_A_fkey";

-- DropForeignKey
ALTER TABLE "_class_teachers" DROP CONSTRAINT "_class_teachers_B_fkey";

-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_class_id_fkey";

-- DropIndex
DROP INDEX "enrollments_student_id_class_id_key";

-- AlterTable
ALTER TABLE "enrollments" DROP COLUMN "class_id",
ADD COLUMN     "course_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_class_teachers";

-- DropTable
DROP TABLE "classes";

-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "description" TEXT,
    "room" TEXT,
    "topic" TEXT,
    "code" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_course_teachers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_course_teachers_AB_unique" ON "_course_teachers"("A", "B");

-- CreateIndex
CREATE INDEX "_course_teachers_B_index" ON "_course_teachers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_course_id_key" ON "enrollments"("student_id", "course_id");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_course_teachers" ADD CONSTRAINT "_course_teachers_A_fkey" FOREIGN KEY ("A") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_course_teachers" ADD CONSTRAINT "_course_teachers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
