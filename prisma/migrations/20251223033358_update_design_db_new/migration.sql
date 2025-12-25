/*
  Warnings:

  - You are about to drop the `menuoptiongroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `optiongroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `optionitem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orderitem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orderitemoption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `menuoptiongroup` DROP FOREIGN KEY `menuoptiongroup_menuId_fkey`;

-- DropForeignKey
ALTER TABLE `menuoptiongroup` DROP FOREIGN KEY `menuoptiongroup_optionGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `menuoptiongroup` DROP FOREIGN KEY `menuoptiongroup_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `optiongroup` DROP FOREIGN KEY `optiongroup_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `optionitem` DROP FOREIGN KEY `optionitem_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `optionitem` DROP FOREIGN KEY `optionitem_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `optionitem` DROP FOREIGN KEY `optionitem_stockId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `orderitem_menuId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `orderitem_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `orderitem_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitemoption` DROP FOREIGN KEY `orderitemoption_optionItemId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitemoption` DROP FOREIGN KEY `orderitemoption_orderItemId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitemoption` DROP FOREIGN KEY `orderitemoption_organizationId_fkey`;

-- DropTable
DROP TABLE `menuoptiongroup`;

-- DropTable
DROP TABLE `optiongroup`;

-- DropTable
DROP TABLE `optionitem`;

-- DropTable
DROP TABLE `orderitem`;

-- DropTable
DROP TABLE `orderitemoption`;
