-- CreateTable
CREATE TABLE `formularstock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pcs_update` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'RUN_FORMULAR',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `menuId` INTEGER NOT NULL,
    `stockId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `formularstock` ADD CONSTRAINT `formularstock_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formularstock` ADD CONSTRAINT `formularstock_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
