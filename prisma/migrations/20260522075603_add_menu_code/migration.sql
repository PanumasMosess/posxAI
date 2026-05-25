-- AlterTable
ALTER TABLE `categorystock` ADD COLUMN `categoryCode` VARCHAR(191) NULL,
    ADD COLUMN `menuRunningNumber` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `menu` ADD COLUMN `menuCode` VARCHAR(191) NULL;
