/*
  Warnings:

  - You are about to drop the `user_logins` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `user_logins` DROP FOREIGN KEY `user_logins_userId_fkey`;

-- DropTable
DROP TABLE `user_logins`;

-- CreateTable
CREATE TABLE `session` (
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

    INDEX `session_userId_tokenId_idx`(`userId`, `tokenId`),
    UNIQUE INDEX `session_userId_tokenId_key`(`userId`, `tokenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `users_email_key` ON `users`(`email`);

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
