-- CreateTable
CREATE TABLE `booking_table_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `organizationId` INTEGER NOT NULL,
    `promptpayNumber` VARCHAR(191) NULL,
    `promptpayName` VARCHAR(191) NULL,
    `baseDepositAmount` DOUBLE NOT NULL DEFAULT 20.00,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `booking_table_settings_organizationId_key`(`organizationId`),
    INDEX `booking_table_settings_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
