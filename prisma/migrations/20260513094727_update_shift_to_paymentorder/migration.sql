/*
  Warnings:

  - You are about to drop the column `shiftId` on the `order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `order_shiftId_fkey`;

-- DropIndex
DROP INDEX `order_shiftId_fkey` ON `order`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `shiftId`;

-- AlterTable
ALTER TABLE `paymentorder` ADD COLUMN `shiftId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `paymentorder` ADD CONSTRAINT `paymentorder_shiftId_fkey` FOREIGN KEY (`shiftId`) REFERENCES `shift`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
