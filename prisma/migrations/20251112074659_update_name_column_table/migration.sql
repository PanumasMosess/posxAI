/*
  Warnings:

  - You are about to drop the column `tablleName` on the `table` table. All the data in the column will be lost.
  - Added the required column `tableName` to the `table` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `table` DROP COLUMN `tablleName`,
    ADD COLUMN `tableName` VARCHAR(191) NOT NULL;
