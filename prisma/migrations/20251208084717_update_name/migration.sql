/*
  Warnings:

  - You are about to drop the column `orderIdRunning` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `orderIdRunning` on the `paymentorder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_running_code]` on the table `paymentorder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_running_code` to the `paymentorder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `order_orderIdRunning_fkey`;

-- DropForeignKey
ALTER TABLE `paymentorder` DROP FOREIGN KEY `paymentorder_orderIdRunning_fkey`;

-- DropIndex
DROP INDEX `order_orderIdRunning_fkey` ON `order`;

-- DropIndex
DROP INDEX `paymentorder_orderIdRunning_key` ON `paymentorder`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `orderIdRunning`;

-- AlterTable
ALTER TABLE `paymentorder` DROP COLUMN `orderIdRunning`,
    ADD COLUMN `order_running_code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `paymentorder_order_running_code_key` ON `paymentorder`(`order_running_code`);

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_order_running_code_fkey` FOREIGN KEY (`order_running_code`) REFERENCES `orderrunning`(`runningCode`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paymentorder` ADD CONSTRAINT `paymentorder_order_running_code_fkey` FOREIGN KEY (`order_running_code`) REFERENCES `orderrunning`(`runningCode`) ON DELETE RESTRICT ON UPDATE CASCADE;
