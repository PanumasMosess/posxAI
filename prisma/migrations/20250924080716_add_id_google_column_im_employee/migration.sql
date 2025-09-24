/*
  Warnings:

  - A unique constraint covering the columns `[id_google]` on the table `Employees` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `employees` ADD COLUMN `id_google` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Employees_id_google_key` ON `Employees`(`id_google`);
