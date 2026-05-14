-- AlterTable
ALTER TABLE `order` ADD COLUMN `shiftId` INTEGER NULL;

-- CreateTable
CREATE TABLE `shift` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `organizationId` INTEGER NOT NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `startingCash` DOUBLE NOT NULL DEFAULT 0,
    `expectedCash` DOUBLE NULL,
    `endingCash` DOUBLE NULL,
    `note` VARCHAR(191) NULL,
    `openedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `closedAt` DATETIME(3) NULL,
    `openedById` INTEGER NOT NULL,
    `closedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_shiftId_fkey` FOREIGN KEY (`shiftId`) REFERENCES `shift`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shift` ADD CONSTRAINT `shift_openedById_fkey` FOREIGN KEY (`openedById`) REFERENCES `employeepin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shift` ADD CONSTRAINT `shift_closedById_fkey` FOREIGN KEY (`closedById`) REFERENCES `employeepin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shift` ADD CONSTRAINT `shift_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
