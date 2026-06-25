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
  clearingTransactionIds?: number[];
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

      // ==========================================
      // 🟢 โลจิกคำนวณแบ่งยอดเงิน (Waterfall Split)
      // ==========================================
      const paymentGroupId = `PAY-${Date.now()}`; // สร้างรหัสกลุ่มสลิป
      let remainingMoney = data.amount;           // เงินทั้งหมดที่ลูกค้านำมาจ่าย
      let currentCreditBalance = member.creditBalance; // ยอดเครดิตวิ่ง (Running Balance)
      const memberTransactionsToInsert: any[] = [];

      // ถ้ามีการเลือกบิลมาจากหน้าจอ (จ่ายแบบเจาะจงบิล)
      if (data.clearingTransactionIds && data.clearingTransactionIds.length > 0) {
        
        // ดึงบิลทั้งหมดที่เลือก (เรียงจากเก่าไปใหม่ เพื่อหักอันเก่าก่อนในกลุ่มที่เลือก)
        const bills = await tx.membertransaction.findMany({
          where: { id: { in: data.clearingTransactionIds }, type: "SPEND" },
          orderBy: { createdAt: "asc" }
        });

        // ดึงประวัติที่เคยจ่ายของบิลกลุ่มนี้ เพื่อหายอดหนี้จริงที่ยังเหลือ
        const pastPayments = await tx.membertransaction.findMany({
          where: { referenceTxId: { in: data.clearingTransactionIds }, type: "TOPUP" }
        });

        for (const bill of bills) {
          if (remainingMoney <= 0) break; // ถ้าเงินหมดมือแล้ว ให้หยุดทำทันที

          // คำนวณยอดหนี้คงเหลือของบิลนี้
          const paidAlready = pastPayments
            .filter(p => p.referenceTxId === bill.id)
            .reduce((sum, p) => sum + p.amount, 0);
            
          const remainingDebt = Math.abs(bill.amount) - paidAlready;

          if (remainingDebt > 0) {
            // เลือกว่าจะจ่ายเท่าไหร่ (ระหว่างยอดหนี้ กับ เงินที่เหลือในมือ)
            const payAmount = Math.min(remainingMoney, remainingDebt);
            currentCreditBalance += payAmount; // ยอดเครดิตวิ่งเพิ่มขึ้น

            memberTransactionsToInsert.push({
              organizationId: data.organizationId,
              type: "TOPUP",
              walletType: "CREDIT",
              amount: payAmount,
              balanceAfter: currentCreditBalance,
              note: data.note || `ชำระหนี้บิล #${bill.orderId || bill.id}`,
              memberId: data.memberId,
              createdById: data.userId,
              referenceTxId: bill.id,          // 👈 ผูกกับบิลหนี้
              paymentGroupId: paymentGroupId   // 👈 ผูกรหัสกลุ่ม
            });

            remainingMoney -= payAmount; // หักเงินในมือออก
          }
        }
      }

      // 🟢 ถ้า "ไม่ได้เลือกบิล" หรือ "จ่ายเงินมาเกินกว่าหนี้ที่เลือก (Overpay)"
      if (remainingMoney > 0) {
        currentCreditBalance += remainingMoney;
        memberTransactionsToInsert.push({
          organizationId: data.organizationId,
          type: "TOPUP",
          walletType: "CREDIT",
          amount: remainingMoney,
          balanceAfter: currentCreditBalance,
          note: data.note || (data.paymentType === "CLEAR_DEBT" ? "ชำระหนี้ค้างส่ง" : "เติมเงินเครดิตล่วงหน้า"),
          memberId: data.memberId,
          createdById: data.userId,
          referenceTxId: null, // ปล่อยลอย ไม่ผูกบิลไหน
          paymentGroupId: paymentGroupId
        });
      }

      // 3. อัปเดตยอดกระเป๋าเงินสมาชิก (เอายอดรวมบวกเข้าไปได้เลย ค่าทางคณิตศาสตร์เท่ากัน)
      const oldMemberCredit = member.creditBalance;
      const newMemberCredit = oldMemberCredit + data.amount;
      await tx.member.update({
        where: { id: data.memberId },
        data: { creditBalance: newMemberCredit },
      });

      // บันทึกประวัติฝั่งสมาชิกที่คำนวณแยกยอดไว้ (createMany)
      await tx.membertransaction.createMany({
        data: memberTransactionsToInsert,
      });

      // 4. คำนวณเงินในบัญชีจริงของทางร้าน (สมุดบัญชีหลัก)
      const oldShopBalance = shopAccount.balance;
      const newShopBalance = oldShopBalance + data.amount;

      // อัปเดตเงินในบัญชีธนาคาร/ลิ้นชักของร้าน
      await tx.account.update({
        where: { id: data.companyAccountId },
        data: { balance: newShopBalance },
      });

      // บันทึก Log ลงสมุดบัญชีหลักของร้าน 
      await tx.account_transaction.create({
        data: {
          organizationId: data.organizationId,
          accountId: data.companyAccountId,
          type: "AR_PAYMENT", 
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
    return { success: false, message: err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
};