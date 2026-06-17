"use server";

import prisma from "@/lib/prisma";

export const getFilteredTransactions = async (filters: {
  accountId?: string;
  types?: string[]; // 🔥 เปลี่ยนมารับเป็น Array ของประเภทที่เลือก
  startDate?: string;
  endDate?: string;
  organizationId: number;
}) => {
  try {
    const whereClause: any = {
      organizationId: filters.organizationId,
    };

    // 1. กรองด้วยบัญชี (ถ้าไม่เลือก 'all')
    if (filters.accountId && filters.accountId !== "all") {
      whereClause.accountId = parseInt(filters.accountId);
    }

    // 🔥 2. กรองด้วยประเภทรายการ (ถ้าระบุมามากกว่า 0 อัน)
    // ถ้าไม่ได้เลือกอะไรเลย (Array ว่าง) ระบบจะถือว่าให้ดึงมา "ทั้งหมด"
    if (filters.types && filters.types.length > 0) {
      whereClause.type = { in: filters.types }; // ใช้คำสั่ง in เพื่อหาหลายๆ เคส
    }

    // 3. กรองด้วยช่วงวันที่
    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = new Date(`${filters.startDate}T00:00:00.000Z`);
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = new Date(`${filters.endDate}T23:59:59.999Z`);
      }
    }

    const txLogs = await prisma.account_transaction.findMany({
      where: whereClause,
      include: {
        account: { select: { accountName: true } },
        category: { select: { name: true } },
        creator: { select: { name: true, surname: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: txLogs };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
};