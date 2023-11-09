/*
  Warnings:

  - You are about to drop the column `job_title` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `organization` on the `users` table. All the data in the column will be lost.
  - Added the required column `address` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `job_title`,
    DROP COLUMN `name`,
    DROP COLUMN `organization`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `resetPasswordExpires` DATETIME(3) NULL,
    ADD COLUMN `resetPasswordToken` VARCHAR(191) NULL,
    ADD COLUMN `role` ENUM('COMPANY', 'USER') NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `user_logins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `loggedOut` BOOLEAN NOT NULL DEFAULT false,
    `ipAddress` VARCHAR(191) NULL,
    `tokenId` VARCHAR(191) NULL,
    `tokenSecret` VARCHAR(191) NULL,
    `tokenDeleted` BOOLEAN NOT NULL DEFAULT false,
    `device` VARCHAR(191) NULL,
    `loggedInAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `loggedOutAt` DATETIME(3) NULL,

    UNIQUE INDEX `user_logins_userId_tokenId_key`(`userId`, `tokenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_logins` ADD CONSTRAINT `user_logins_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
