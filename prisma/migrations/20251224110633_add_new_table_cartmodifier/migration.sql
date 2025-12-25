-- CreateTable
CREATE TABLE `cartmodifier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cartId` INTEGER NOT NULL,
    `modifierItemId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cartmodifier` ADD CONSTRAINT `cartmodifier_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cartmodifier` ADD CONSTRAINT `cartmodifier_modifierItemId_fkey` FOREIGN KEY (`modifierItemId`) REFERENCES `modifieritem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
