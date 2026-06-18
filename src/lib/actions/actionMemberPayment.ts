"use server";

import prisma from "@/lib/prisma";

export const executeMemberPayment = async (data: {
  memberId: number;
  companyAccountId: number; // บัญชีของร้านที่รับเงิน (เช่น กสิกร, เงินสดหน้าร้าน)
  paymentType: "CLEAR_DEBT" | "TOPUP_CREDIT"; // ชำระหนี้ค้าง หรือ เติมเงินล่วงหน้า
  amount: number;
  note: string;
  userId: number;
  organizationId: number;
}) => {
  try {
    if (data.amount <= 0) throw new Error("จำนวนเงินต้องมากกว่า 0 บาท");

    return await prisma.$transaction(async (tx) => {
      // 1. ตรวจสอบข้อมูลสมาชิก
      const member = await tx.member.findUnique({ where: { id: data.memberId } });
      if (!member) throw new Error("ไม่พบข้อมูลสมาชิกในระบบ");

      // 2. ตรวจสอบบัญชีการเงินของทางร้าน
      const shopAccount = await tx.account.findUnique({ where: { id: data.companyAccountId } });
      if (!shopAccount) throw new Error("ไม่พบข้อมูลบัญชีรับเงินของร้าน");

      // 3. คำนวณยอดเงินของฝั่งสมาชิก
      const oldMemberCredit = member.creditBalance;
      // การรับชำระเงินจะไปทำให้ค่าเครดิตสมาชิกเพิ่มขึ้น (ถ้าเดิมติดลบ เช่น -500 จ่ายมา 500 จะกลายเป็น 0)
      const newMemberCredit = oldMemberCredit + data.amount;

      // อัปเดตยอดกระเป๋าเงินสมาชิก
      await tx.member.update({
        where: { id: data.memberId },
        data: { creditBalance: newMemberCredit },
      });

      // บันทึกประวัติฝั่งสมาชิก (Audit Log)
      await tx.membertransaction.create({
        data: {
          organizationId: data.organizationId,
          type: "TOPUP", // ใช้สเตตัสเติมเงินเข้ากระเป๋าของสมาชิก
          walletType: "CREDIT",
          amount: data.amount,
          balanceAfter: newMemberCredit,
          note: data.paymentType === "CLEAR_DEBT" ? `ชำระหนี้ค้างส่ง: ${data.note}` : `เติมเงินเครดิตล่วงหน้า: ${data.note}`,
          memberId: data.memberId,
          createdById: data.userId,
        },
      });

      // 4. คำนวณเงินในบัญชีจริงของทางร้าน (สมุดบัญชีหลัก)
      const oldShopBalance = shopAccount.balance;
      const newShopBalance = oldShopBalance + data.amount;

      // อัปเดตเงินในบัญชีธนาคาร/ลิ้นชักของร้าน
      await tx.account.update({
        where: { id: data.companyAccountId },
        data: { balance: newShopBalance },
      });

      // บันทึก Log ลงสมุดบัญชีหลักของร้าน (ผูกกับรายงานเดินบัญชีที่คุณเพิ่งทำไปก่อนหน้า)
      await tx.account_transaction.create({
        data: {
          organizationId: data.organizationId,
          accountId: data.companyAccountId,
          type: "AR_PAYMENT", // ✅ หมวดหมู่ "รับชำระหนี้" ที่เราเซ็ตไว้ในป้าย Badge
          amount: data.amount,
          accountBalance: newShopBalance,
          title: `รับชำระเงินสมาชิก (${member.firstName} ${member.lastName || ""})`,
          note: data.note || "-",
          createdById: data.userId,
        },
      });

      return { success: true, message: "บันทึกรายการรับชำระเงินเรียบร้อยแล้ว" };
    });
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};