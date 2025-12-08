-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `order_order_running_code_fkey`;

-- DropIndex
DROP INDEX `order_order_running_code_fkey` ON `order`;
