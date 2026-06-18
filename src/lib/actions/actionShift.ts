"use server";
import prisma from "../prisma";

export const checkActiveShift = async (organizationId: number) => {
  try {
    const activeShift = await prisma.shift.findFirst({
      where: {
        organizationId: organizationId,
        status: "OPEN",
      },
    });

    if (!activeShift) {
      return null;
    }

    const startOfDay = new Date(activeShift.createdAt);
    startOfDay.setHours(0, 0, 0, 0);

    const shiftSequence = await prisma.shift.count({
      where: {
        organizationId: organizationId,
        createdAt: {
          gte: startOfDay,
          lte: activeShift.createdAt,
        },
      },
    });

    return {
      ...activeShift,
      shiftSequence,
    };
  } catch (error) {
    console.error("Error checking active shift:", error);
    return null;
  }
};

export const openShift = async (
  organizationId: number,
  employeeId: number,
  startingCash: number,
  amountQr: number,
  note?: string,
) => {
  try {
    const existingShift = await prisma.shift.findFirst({
      where: {
        organizationId: organizationId,
        status: "OPEN",
      },
    });

    if (existingShift) {
      return { success: false, message: "มีกะที่กำลังเปิดใช้งานอยู่แล้ว" };
    }

    const newShift = await prisma.shift.create({
      data: {
        organizationId: organizationId,
        openedById: employeeId,
        startingCash: startingCash,
        amountQr: amountQr,
        note: note || null,
        status: "OPEN",
      },
    });

    return { success: true, message: "เปิดกะสำเร็จ!", data: newShift };
  } catch (error) {
    console.error("Error opening shift:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการเปิดกะ" };
  }
};

export const closeShift = async (
  shiftId: number,
  employeeId: number,
  actualEndingCash: number,
  actualEndingQr: number,
  actualEndingMember: number, 
  note?: string,
) => {
  try {
    const currentShift = await prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!currentShift || currentShift.status === "CLOSED") {
      return { success: false, message: "ไม่พบข้อมูลกะ หรือกะนี้ถูกปิดไปแล้ว" };
    }

    // 1. คำนวณยอดเงินสด (CASH)
    const cashSalesAgg = await prisma.paymentorder.aggregate({
      _sum: { totalAmount: true },
      where: { shiftId: shiftId, paymentMethod: "CASH" },
    });
    const totalCashSales = cashSalesAgg._sum.totalAmount || 0;
    const expectedCashInDrawer = currentShift.startingCash + totalCashSales;

    // 2. คำนวณยอดสแกนจ่าย (QR)
    const qrSalesAgg = await prisma.paymentorder.aggregate({
      _sum: { totalAmount: true },
      where: { shiftId: shiftId, paymentMethod: "QR" }, 
    });
    const totalQrSales = qrSalesAgg._sum.totalAmount || 0;
    const startingQr = currentShift.amountQr || 0;
    const expectedQrInBank = startingQr + totalQrSales;

    // 3. 🟢 คำนวณยอดจ่ายผ่านสมาชิก (MEMBER)
    const memberSalesAgg = await prisma.paymentorder.aggregate({
      _sum: { totalAmount: true },
      where: { shiftId: shiftId, paymentMethod: "MEMBER" }, 
    });
    const totalMemberSales = memberSalesAgg._sum.totalAmount || 0;
    const startingMember = currentShift.amountMember || 0;
    const expectedMemberTotal = startingMember + totalMemberSales;

    // 4. บันทึกปิดกะ
    const closedShift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        closedById: employeeId,
        expectedCash: expectedCashInDrawer,
        endingCash: actualEndingCash,
        expectedQr: expectedQrInBank,
        endingQr: actualEndingQr,
        expectedMember: expectedMemberTotal, 
        endingMember: actualEndingMember,
        note: note || null,
      },
    });

    // 5. คำนวณส่วนต่าง
    const diffCash = actualEndingCash - expectedCashInDrawer;
    const diffQr = actualEndingQr - expectedQrInBank;
    const diffMember = actualEndingMember - expectedMemberTotal; 
    const totalDiff = diffCash + diffQr + diffMember;

    return {
      success: true,
      message: "ปิดกะและสรุปยอดสำเร็จ",
      data: {
        expectedCash: expectedCashInDrawer,
        actualCash: actualEndingCash,
        diffCash: diffCash,

        expectedQr: expectedQrInBank,
        actualQr: actualEndingQr,
        diffQr: diffQr,

        expectedMember: expectedMemberTotal,
        actualMember: actualEndingMember, 
        diffMember: diffMember, 

        totalDiff: totalDiff,
      },
    };
  } catch (error) {
    console.error("Error closing shift:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการสรุปยอดปิดกะ" };
  }
};
