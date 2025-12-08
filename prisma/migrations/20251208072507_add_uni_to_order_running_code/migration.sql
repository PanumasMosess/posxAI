/*
  Warnings:

  - A unique constraint covering the columns `[orderIdRunning]` on the table `paymentorder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `paymentorder_orderIdRunning_key` ON `paymentorder`(`orderIdRunning`);

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_order_running_code_fkey` FOREIGN KEY (`order_running_code`) REFERENCES `paymentorder`(`orderIdRunning`) ON DELETE SET NULL ON UPDATE CASCADE;
