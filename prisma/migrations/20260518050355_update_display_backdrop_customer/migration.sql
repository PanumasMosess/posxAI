-- AlterTable
ALTER TABLE `display_backdrop` ADD COLUMN `igName` VARCHAR(191) NULL,
    ADD COLUMN `isTemporary` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `message` VARCHAR(191) NULL;
