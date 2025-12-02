/*
  Warnings:

  - You are about to drop the column `orderrunningId` on the `order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `order_orderrunningId_fkey`;

-- DropIndex
DROP INDEX `order_orderrunningId_fkey` ON `order`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `orderrunningId`,
    ADD COLUMN `order_running_code` VARCHAR(191) NULL;
