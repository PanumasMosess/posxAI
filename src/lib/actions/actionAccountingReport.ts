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

    // 1. ดึงข้อมูลธุรกรรมทั้งหมดในช่วงเวลา
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
      // 🟢 แก้ไขตรงนี้: ใช้ Math.abs() เพื่อแปลงตัวเลขทุกตัวให้เป็นบวกเสมอ
      const rawAmount = Number(tx.amount);
      const amount = Math.abs(rawAmount); 

      const dateKey = tx.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD

      // สร้างช่องวันที่รอก่อนถ้ายังไม่มี
      if (!dailyDataMap.has(dateKey)) {
        dailyDataMap.set(dateKey, { date: dateKey, income: 0, expense: 0 });
      }

      // แยกประเภท
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

    // 5. 💰 คำนวณ "ยอดหนี้ค้างรับรวม (Outstanding AR)"
    // ตรงนี้ผมใส่ตัวอย่างไว้ให้ คุณต้องไปดึงจาก Table ที่คุณใช้เก็บข้อมูลลูกหนี้/บิลที่ค้างชำระครับ
    // ตัวอย่างการดึง (สมมติว่าคุณมี table ชื่อ receipt ที่เก็บยอดบิล และมี status = 'UNPAID')
    /*
    const outstandingArResult = await prisma.receipt.aggregate({
      where: { 
        organizationId: filters.organizationId, 
        paymentStatus: 'UNPAID' // หรือสถานะที่คุณตั้งไว้
      },
      _sum: { totalAmount: true }
    });
    const totalOutstandingAR = Number(outstandingArResult._sum.totalAmount) || 0;
    */
   
    // ชั่วคราว: กำหนดค่า 0 ไปก่อนจนกว่าคุณจะ Query ฝั่งบิลค้างชำระมาใส่
    const totalOutstandingAR = 0; 

    return {
      success: true,
      data: {
        // ส่งยอดหนี้ค้างรับกลับไปให้ Dashboard ด้วย
        summary: { totalIncome, totalExpense, netProfit, totalARPayment, totalOutstandingAR },
        dailyChartData,
        expenseCategoryData,
        accounts,
      },
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};