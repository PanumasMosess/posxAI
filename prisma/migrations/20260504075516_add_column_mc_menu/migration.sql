-- AlterTable
ALTER TABLE `menu` ADD COLUMN `mcEmployeeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `menu` ADD CONSTRAINT `menu_mcEmployeeId_fkey` FOREIGN KEY (`mcEmployeeId`) REFERENCES `employeepin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
