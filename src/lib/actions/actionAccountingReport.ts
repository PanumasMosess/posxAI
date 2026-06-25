"use server";

import prisma from "@/lib/prisma";

export const getAccountingReportData = async (filters: {
  startDate: string;
  endDate: string;
  organizationId: number;
}) => {
  try {
    const start = new Date(`${filters.startDate}T00:00:00.000Z`);
    const end = new Date(`${filters.endDate}T23:59:59.999Z`);

    // 1. ดึงข้อมูลธุรกรรมทั้งหมดในช่วงเวลา (สำหรับกน้ากราฟและยอด Summary หลัก)
    const txLogs = await prisma.account_transaction.findMany({
      where: {
        organizationId: filters.organizationId,
        createdAt: { gte: start, lte: end },
      },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    });

    // 2. ตัวแปรเก็บสรุปยอดรวม (Summary Cards)
    let totalIncome = 0;
    let totalExpense = 0;
    let totalARPayment = 0;

    // 3. เตรียมตัวแปรสำหรับกราฟ
    const dailyDataMap = new Map<string, { date: string; income: number; expense: number }>();
    const expenseCategoryMap = new Map<string, number>();

    txLogs.forEach((tx) => {
      const rawAmount = Number(tx.amount);
      const amount = Math.abs(rawAmount); 

      const dateKey = tx.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!dailyDataMap.has(dateKey)) {
        dailyDataMap.set(dateKey, { date: dateKey, income: 0, expense: 0 });
      }

      if (["SALES", "INCOME", "AR_PAYMENT"].includes(tx.type)) {
        totalIncome += amount;
        dailyDataMap.get(dateKey)!.income += amount;

        if (tx.type === "AR_PAYMENT") {
          totalARPayment += amount;
        }
      } 
      else if (tx.type === "EXPENSE") {
        totalExpense += amount;
        dailyDataMap.get(dateKey)!.expense += amount;

        const catName = tx.category?.name || "ไม่ระบุหมวดหมู่";
        expenseCategoryMap.set(catName, (expenseCategoryMap.get(catName) || 0) + amount);
      }
    });

    const netProfit = totalIncome - totalExpense;
    const dailyChartData = Array.from(dailyDataMap.values());
    const expenseCategoryData = Array.from(expenseCategoryMap.entries()).map(([name, value]) => ({ name, value }));

    const accounts = await prisma.account.findMany({
      where: { organizationId: filters.organizationId, status: "ACTIVE" },
      select: { accountName: true, balance: true },
    });

    // 🟢 5. 💰 คำนวณ "ยอดหนี้ค้างรับรวมปัจจุบัน (Outstanding AR)" จากตารางธุรกรรมสมาชิกจริง
    // ดึงประวัติ CREDIT ทั้งหมดของสาขานี้มาคำนวณแยกรายบุคคลแบบมีประสิทธิภาพ
    const memberTxs = await prisma.membertransaction.findMany({
      where: {
        organizationId: filters.organizationId,
        walletType: "CREDIT",
        type: { in: ["SPEND", "TOPUP"] }
      },
      select: {
        memberId: true,
        type: true,
        amount: true
      }
    });

    // ใช้ Map เพื่อจับกลุ่มคำนวณยอดสุทธิสุทธิแยกรายบุคคล
    const debtorMap = new Map<number, number>();

    memberTxs.forEach((tx) => {
      const currentDebt = debtorMap.get(tx.memberId) || 0;
      const amountValue = Number(tx.amount);

      if (tx.type === "SPEND") {
        // ยอดเซ็นยืมหน้าร้าน (มีค่าเป็นลบในระบบ จึงใช้ Math.abs บวกรวมเป็นยอดหนี้)
        debtorMap.set(tx.memberId, currentDebt + Math.abs(amountValue));
      } else if (tx.type === "TOPUP") {
        // ยอดที่นำเงินสดมารายงานชำระหนี้คืนร้าน (ลดยอดหนี้ลง)
        debtorMap.set(tx.memberId, currentDebt - amountValue);
      }
    });

    // รวมยอดเฉพาะสมาชิกที่ยังคงมียอดหนี้ค้างจ่าย (ยอดหนี้สุทธิ > 0)
    let totalOutstandingAR = 0;
    debtorMap.forEach((finalDebt) => {
      if (finalDebt > 0) {
        totalOutstandingAR += finalDebt;
      }
    });

    return {
      success: true,
      data: {
        summary: { totalIncome, totalExpense, netProfit, totalARPayment, totalOutstandingAR },
        dailyChartData,
        expenseCategoryData,
        accounts,
      },
    };
  } catch (err: any) {
    console.error("Accounting Report Error: ", err);
    return { success: false, message: err.message };
  }
};