/*
  Warnings:

  - A unique constraint covering the columns `[runningCode]` on the table `orderrunning` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `orderIdRunning` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `orderrunning_runningCode_key` ON `orderrunning`(`runningCode`);

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_orderIdRunning_fkey` FOREIGN KEY (`orderIdRunning`) REFERENCES `orderrunning`(`runningCode`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paymentorder` ADD CONSTRAINT `paymentorder_orderIdRunning_fkey` FOREIGN KEY (`orderIdRunning`) REFERENCES `orderrunning`(`runningCode`) ON DELETE RESTRICT ON UPDATE CASCADE;
