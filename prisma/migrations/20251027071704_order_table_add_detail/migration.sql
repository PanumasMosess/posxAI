/*
  Warnings:

  - Added the required column `orderDetail` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `orderDetail` VARCHAR(191) NOT NULL;
