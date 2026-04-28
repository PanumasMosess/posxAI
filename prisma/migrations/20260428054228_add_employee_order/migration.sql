-- AddForeignKey
ALTER TABLE `membertransaction` ADD CONSTRAINT `membertransaction_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membertransaction` ADD CONSTRAINT `membertransaction_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
