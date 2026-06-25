-- AlterTable
ALTER TABLE `membertransaction` ADD COLUMN `paymentGroupId` VARCHAR(191) NULL,
    ADD COLUMN `referenceTxId` INTEGER NULL;
