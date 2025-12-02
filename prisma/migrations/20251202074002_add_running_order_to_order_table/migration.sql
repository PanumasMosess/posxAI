-- AlterTable
ALTER TABLE `order` ADD COLUMN `orderrunningId` INTEGER NULL;

-- CreateTable
CREATE TABLE `orderrunning` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `runningCode` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `organizationId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_orderrunningId_fkey` FOREIGN KEY (`orderrunningId`) REFERENCES `orderrunning`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderrunning` ADD CONSTRAINT `orderrunning_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
