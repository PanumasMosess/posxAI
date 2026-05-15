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

    return activeShift;
  } catch (error) {
    console.error("Error checking active shift:", error);
    return null;
  }
};

export const openShift = async (
  organizationId: number,
  employeeId: number,
  startingCash: number,
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
  note?: string
) => {
  try {
    const currentShift = await prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!currentShift || currentShift.status === "CLOSED") {
      return { success: false, message: "ไม่พบข้อมูลกะ หรือกะนี้ถูกปิดไปแล้ว" };
    }

    const cashSalesAgg = await prisma.paymentorder.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        shiftId: shiftId,
        paymentMethod: "CASH", 
      },
    });

    const totalCashSales = cashSalesAgg._sum.totalAmount || 0;

    const expectedCashInDrawer = currentShift.startingCash + totalCashSales;

    const closedShift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        closedById: employeeId,
        expectedCash: expectedCashInDrawer,
        endingCash: actualEndingCash,
        note: note || null,
      },
    });

    const diffAmount = actualEndingCash - expectedCashInDrawer;

    return {
      success: true,
      message: "ปิดกะและสรุปยอดสำเร็จ",
      data: {
        expected: expectedCashInDrawer,
        actual: actualEndingCash,
        diff: diffAmount, 
      },
    };
  } catch (error) {
    console.error("Error closing shift:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการสรุปยอดปิดกะ" };
  }
};