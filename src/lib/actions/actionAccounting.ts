"use server";

import prisma from "@/lib/prisma";

// ==========================================
// 1. จัดการบัญชี (Accounts)
// ==========================================

export const createAccount = async (data: { 
  accountName: string; 
  initialBalance: number; 
  organizationId: number;
  createdById: number;
}) => {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. สร้างบัญชี
      const newAcc = await tx.account.create({
        data: {
          accountName: data.accountName,
          status: "ACTIVE",
          balance: data.initialBalance || 0,
          organizationId: data.organizationId,
        },
      });

      // 2. ถ้ามีการใส่เงินตั้งต้น ให้บันทึก Log เป็น OVERRIDE_BALANCE ทันที
      if (data.initialBalance > 0) {
        await tx.account_transaction.create({
          data: {
            organizationId: data.organizationId,
            accountId: newAcc.id,
            type: "OVERRIDE_BALANCE",
            amount: data.initialBalance,
            accountBalance: data.initialBalance,
            title: "ยอดยกมาตั้งต้น",
            note: "กำหนดเงินตั้งต้นตอนสร้างบัญชี",
            createdById: data.createdById,
          },
        });
      }
    });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "เกิดข้อผิดพลาดในการสร้างบัญชี" };
  }
};

export const updateAccountStatus = async (id: number, status: string) => {
  try {
    await prisma.account.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
    return { success: true, error: false };
  } catch (err) {
    return { success: false, error: true };
  }
};

export const updateAccountName = async (id: number, name: string) => {
  try {
    await prisma.account.update({
      where: { id },
      data: { accountName: name, updatedAt: new Date() },
    });
    return { success: true, error: false };
  } catch (err) {
    return { success: false, error: true };
  }
};

// ==========================================
// 2. จัดการเงิน: แก้ไข/เพิ่ม/ลด ยอดเงินโดยตรง (มี Log)
// ==========================================
export const adjustAccountBalance = async (
  accountId: number,
  amount: number,
  mode: "OVERRIDE" | "ADD" | "REDUCE",
  note: string,
  createdById: number,
  organizationId: number
) => {
  try {
    await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) throw new Error("ไม่พบข้อมูลบัญชี");

      let diffAmount = amount; 
      let newBalance = account.balance;
      let txType: any = "OVERRIDE_BALANCE";

      if (mode === "OVERRIDE") {
        // 🔥 แก้ตรงนี้: ไม่ใส่ Math.abs() แล้ว ถ้าแก้ยอดลดลง diffAmount จะติดลบไปลง DB เลย
        diffAmount = amount - account.balance; 
        newBalance = amount;
        txType = "OVERRIDE_BALANCE";
      } else if (mode === "ADD") {
        diffAmount = amount;
        newBalance = account.balance + amount;
        txType = "ADJUSTMENT_UP";
      } else if (mode === "REDUCE") {
        if (account.balance < amount) throw new Error("ยอดเงินในบัญชีไม่เพียงพอ");
        diffAmount = amount; // เก็บเป็นบวกไป (เพราะประเภทเป็น DOWN อยู่แล้ว)
        newBalance = account.balance - amount;
        txType = "ADJUSTMENT_DOWN";
      }

      // 1. อัปเดตยอดคงเหลือ
      await tx.account.update({
        where: { id: accountId },
        data: { balance: newBalance },
      });

      // 2. บันทึก Log
      await tx.account_transaction.create({
        data: {
          organizationId,
          accountId,
          type: txType,
          amount: diffAmount, // 🔥 ส่ง diffAmount ตัวใหม่ลงไป
          accountBalance: newBalance,
          title: mode === "OVERRIDE" ? "ปรับแก้ไขยอดเงินในบัญชี" : mode === "ADD" ? "เพิ่มเงินในบัญชี" : "ลดเงินในบัญชี",
          note,
          createdById,
        },
      });
    });

    return { success: true, message: "บันทึกรายการสำเร็จ" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};

// ==========================================
// 3. จัดการเงิน: โอนเงินระหว่างบัญชี (มี Log คู่)
// ==========================================
export const transferMoney = async (
  fromAccountId: number,
  toAccountId: number,
  amount: number,
  note: string,
  createdById: number,
  organizationId: number
) => {
  try {
    if (fromAccountId === toAccountId) throw new Error("ไม่สามารถโอนเข้าบัญชีเดียวกันได้");
    if (amount <= 0) throw new Error("จำนวนเงินต้องมากกว่า 0");

    await prisma.$transaction(async (tx) => {
      const fromAcc = await tx.account.findUnique({ where: { id: fromAccountId } });
      const toAcc = await tx.account.findUnique({ where: { id: toAccountId } });

      if (!fromAcc || !toAcc) throw new Error("ไม่พบบัญชีต้นทางหรือปลายทาง");
      if (fromAcc.balance < amount) throw new Error("เงินในบัญชีต้นทางไม่เพียงพอ");

      const fromNewBalance = fromAcc.balance - amount;
      const toNewBalance = toAcc.balance + amount;

      // หักเงินต้นทาง
      await tx.account.update({ where: { id: fromAccountId }, data: { balance: fromNewBalance } });
      // เพิ่มเงินปลายทาง
      await tx.account.update({ where: { id: toAccountId }, data: { balance: toNewBalance } });

      // สร้าง Log ฝั่งโอนออก
      const txOut = await tx.account_transaction.create({
        data: {
          organizationId, accountId: fromAccountId, type: "TRANSFER_OUT", amount, accountBalance: fromNewBalance,
          title: `โอนเงินไป ${toAcc.accountName}`, note, createdById,
        },
      });

      // สร้าง Log ฝั่งรับเข้า
      const txIn = await tx.account_transaction.create({
        data: {
          organizationId, accountId: toAccountId, type: "TRANSFER_IN", amount, accountBalance: toNewBalance,
          title: `รับเงินโอนจาก ${fromAcc.accountName}`, note, createdById, transferPairId: txOut.id,
        },
      });

      // อัปเดตฝั่งโอนออกให้รู้จักฝั่งรับเข้า
      await tx.account_transaction.update({
        where: { id: txOut.id }, data: { transferPairId: txIn.id }
      });
    });

    return { success: true, message: "โอนเงินสำเร็จ" };
  } catch (err: any) {
    return { success: false, message: err.message || "เกิดข้อผิดพลาดในการโอนเงิน" };
  }
};

// ==========================================
// 4. จัดการหมวดหมู่ (Categories)
// ==========================================
export const createCategory = async (data: { name: string; type: string; organizationId: number }) => {
  try {
    await prisma.account_category.create({
      data: { name: data.name, type: data.type, status: "ACTIVE", organizationId: data.organizationId },
    });
    return { success: true };
  } catch (err) { return { success: false }; }
};

export const updateCategoryStatus = async (id: number, status: string) => {
  try {
    await prisma.account_category.update({ where: { id }, data: { status } });
    return { success: true };
  } catch (err) { return { success: false }; }
};

export const updateCategoryName = async (id: number, name: string) => {
  try {
    await prisma.account_category.update({ where: { id }, data: { name } });
    return { success: true };
  } catch (err) { return { success: false }; }
};