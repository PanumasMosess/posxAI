"use server";

import prisma from "@/lib/prisma";

export const getProfitLossTransactions = async (filters: {
  accountId?: string;
  types?: string[];
  startDate?: string;
  endDate?: string;
  organizationId: number;
}) => {
  try {
    const whereClause: any = {
      organizationId: filters.organizationId,
    };

    if (filters.accountId && filters.accountId !== "all") {
      whereClause.accountId = parseInt(filters.accountId);
    }

    if (filters.types && filters.types.length > 0) {
      whereClause.type = { in: filters.types };
    }

    // 🔥 ลอจิกกรองวันที่ (เน้นหาจากฟิลด์ date เป็นหลัก แต่ถ้าไม่มีให้ดู createdAt แทนสำหรับข้อมูลเก่า)
    if (filters.startDate || filters.endDate) {
      const dateFilter: any = {};
      const createdAtFilter: any = {};

      if (filters.startDate) {
        // ใช้เวลา 00:00:00 ของไทย (+07:00) 
        const start = new Date(`${filters.startDate}T00:00:00+07:00`);
        dateFilter.gte = start;
        createdAtFilter.gte = start;
      }
      if (filters.endDate) {
        // ใช้เวลา 23:59:59 ของไทย (+07:00)
        const end = new Date(`${filters.endDate}T23:59:59+07:00`);
        dateFilter.lte = end;
        createdAtFilter.lte = end;
      }

      // ใช้ OR เพื่อให้ครอบคลุมทั้งข้อมูลใหม่ (มี date) และข้อมูลเก่า (ไม่มี date)
      whereClause.OR = [
        { date: dateFilter },
        { date: null, createdAt: createdAtFilter }
      ];
    }

    const txLogs = await prisma.account_transaction.findMany({
      where: whereClause,
      include: {
        account: { select: { accountName: true } },
        category: { select: { name: true } },
        creator: { select: { name: true, surname: true } },
      },
      // เรียงตามวันที่จริงก่อน ถ้าไม่มีให้เรียงตามวันที่สร้าง
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" }
      ],
    });

    return { success: true, data: txLogs };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
};