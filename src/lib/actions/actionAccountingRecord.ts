"use server";
import prisma from "@/lib/prisma";

export const recordTransaction = async (data: {
  accountId: number;
  categoryName: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note: string;
  userId: number;
  organizationId: number;
}) => {
  try {
    await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({ where: { id: data.accountId } });
      if (!account) throw new Error("ไม่พบข้อมูลบัญชี");
      const cleanCategoryName = data.categoryName.trim();
      let category = await tx.account_category.findFirst({
        where: { 
          name: cleanCategoryName, 
          type: data.type, 
          organizationId: data.organizationId 
        }
      });
      if (!category) {
        category = await tx.account_category.create({
          data: {
            name: cleanCategoryName,
            type: data.type,
            status: "ACTIVE",
            organizationId: data.organizationId
          }
        });
      }
      let diffAmount = data.amount;
      let newBalance = account.balance;

      if (data.type === "INCOME") {
        newBalance = account.balance + data.amount;
      } else if (data.type === "EXPENSE") {
        if (account.balance < data.amount) throw new Error("ยอดเงินในบัญชีไม่เพียงพอ");
        diffAmount = data.amount;
        newBalance = account.balance - data.amount;
      }
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });
      await tx.account_transaction.create({
        data: {
          organizationId: data.organizationId,
          accountId: data.accountId,
          categoryId: category.id,
          type: data.type,
          amount: data.type === "EXPENSE" ? -diffAmount : diffAmount,
          accountBalance: newBalance,
          title: category.name, 
          note: data.note,
          createdById: data.userId,
        },
      });
    });

    return { success: true, message: "บันทึกรายการสำเร็จ" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};