-- AlterTable
ALTER TABLE `shift` ADD COLUMN `amountMember` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `endingMember` DOUBLE NULL,
    ADD COLUMN `expectedMember` DOUBLE NULL DEFAULT 0;
