-- AlterTable
ALTER TABLE `menu` ADD COLUMN `unitPriceId` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `unitPriceId` INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE `stock` ADD CONSTRAINT `stock_unitPriceId_fkey` FOREIGN KEY (`unitPriceId`) REFERENCES `unitprice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu` ADD CONSTRAINT `menu_unitPriceId_fkey` FOREIGN KEY (`unitPriceId`) REFERENCES `unitprice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
