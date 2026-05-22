-- AlterTable
ALTER TABLE `shift` ADD COLUMN `endingQr` DOUBLE NULL,
    ADD COLUMN `expectedQr` DOUBLE NULL DEFAULT 0;
