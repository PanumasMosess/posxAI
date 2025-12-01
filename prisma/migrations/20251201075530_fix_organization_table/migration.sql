-- AlterTable
ALTER TABLE `formularstock` ADD COLUMN `organizationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `formularstock` ADD CONSTRAINT `formularstock_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
