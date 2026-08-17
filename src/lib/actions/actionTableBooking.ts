"use server";

import prisma from "@/lib/prisma";
import { sendbase64toS3Data, deleteFileS3 } from "./actionIndex";

export async function createBookingAction(data: {
  organizationId: number;
  tableId: number;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  bookingDate: Date;
  depositAmount: number;
}) {
  try {
    const bDate = new Date(data.bookingDate);
    const timeString = `${String(bDate.getHours()).padStart(2, "0")}:${String(bDate.getMinutes()).padStart(2, "0")}`;
    // บันทึกข้อมูลลงตาราง table_booking
    const newBooking = await prisma.table_booking.create({
      data: {
        organizationId: data.organizationId,
        tableId: data.tableId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        guestCount: data.guestCount,
        bookingDate: data.bookingDate,
        bookingTime: timeString,
        depositAmount: data.depositAmount,
        paymentStatus: "UNPAID", // ค่าเริ่มต้นคือรอชำระเงิน
        status: "PENDING",
      },
    });

    return {
      success: true,
      bookingId: newBooking.id,
    };
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    return {
      success: false,
      message: "ไม่สามารถสร้างรายการจองได้",
    };
  }
}

export async function checkPaymentStatusAction(bookingId: number) {
  try {
    // ค้นหาบิลตาม ID
    const booking = await prisma.table_booking.findUnique({
      where: {
        id: bookingId,
      },
      select: {
        paymentStatus: true, // ดึงมาแค่ฟิลด์ paymentStatus เพื่อความรวดเร็ว
      },
    });

    if (!booking) {
      return { success: false, message: "ไม่พบบิลที่ระบุ" };
    }

    return {
      success: true,
      status: booking.paymentStatus,
    };
  } catch (error) {
    console.error("❌ Error checking payment status:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบระบบ",
    };
  }
}

export async function verifyTableAvailableAction(
  tableId: number,
  bookingDate: Date,
) {
  try {
    const selectedDate = new Date(bookingDate);

    // 1. เช็คคิวจองล่วงหน้าว่ามีทับซ้อนไหม
    const overlappingBooking = await prisma.table_booking.findFirst({
      where: {
        tableId: tableId,
        status: { in: ["PENDING", "CONFIRMED"] },
        // ดึงเฉพาะของวันเดียวกันมาเช็คเวลา
        bookingDate: {
          gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
          lte: new Date(selectedDate.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (overlappingBooking) {
      // เช็คว่าเวลาห่างกันไม่ถึง 2.5 ชม. ใช่ไหม
      const hoursDiff =
        Math.abs(
          bookingDate.getTime() - overlappingBooking.bookingDate.getTime(),
        ) /
        (1000 * 60 * 60);
      if (hoursDiff < 2.5) {
        return {
          success: false,
          message: "โต๊ะนี้เพิ่งถูกจองไปเมื่อสักครู่นี้",
        };
      }
    }

    // 2. ถ้าจองวันนี้ เช็คสถานะโต๊ะปัจจุบันด้วย
    const isToday = bookingDate.toDateString() === new Date().toDateString();
    if (isToday) {
      const table = await prisma.table.findUnique({ where: { id: tableId } });
      if (
        table &&
        ["OCCUPIED", "RESERVED", "WAIT_BOOKING"].includes(table.status)
      ) {
        return {
          success: false,
          message: "โต๊ะนี้เพิ่งมีลูกค้าเข้าใช้งานเมื่อสักครู่นี้",
        };
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: "เกิดข้อผิดพลาดในการตรวจสอบโต๊ะ" };
  }
}

export async function getBookingSettingsAction(organizationId: number) {
  try {
    const settings = await prisma.booking_table_settings.findUnique({
      where: { organizationId },
    });

    return { success: true, data: settings };
  } catch (error) {
    console.error("❌ Error fetching settings:", error);
    return { success: false, data: null };
  }
}

export async function uploadStoreLayoutAction(base64Data: string) {
  const result = await sendbase64toS3Data(base64Data, "layout_table_posx");
  return result;
}

const getS3KeyFromUrl = (url: string) => {
  try {
    const bucket = process.env.S3_BUCKET;
    if (!bucket || !url) return null;

    const splitStr = `/${bucket}/`;
    if (url.includes(splitStr)) {
      return url.split(splitStr)[1];
    }
    return null;
  } catch (error) {
    return null;
  }
};

export async function updateBookingSettings(
  organizationId: number,
  data: {
    promptpayNumber: string;
    promptpayName: string;
    baseDepositAmount: number;
    storeLayoutUrl?: string;
  },
) {
  try {
    const now = new Date();
    const existingSettings = await prisma.booking_table_settings.findUnique({
      where: { organizationId },
    });

    const oldUrl = existingSettings?.storeLayoutUrl;
    const newUrl = data.storeLayoutUrl;
    if (oldUrl && oldUrl !== newUrl) {
      const oldKey = getS3KeyFromUrl(oldUrl);
      if (oldKey) {
        const deleteResult = await deleteFileS3(oldKey);
        if (deleteResult.success) {
          console.log(`✅ ลบไฟล์รูปเก่าสำเร็จ: ${oldKey}`);
        } else {
          console.error(
            `❌ ลบไฟล์รูปเก่าไม่สำเร็จ: ${oldKey}`,
            deleteResult.error,
          );
        }
      }
    }
    const result = await prisma.booking_table_settings.upsert({
      where: { organizationId },
      update: {
        promptpayNumber: data.promptpayNumber,
        promptpayName: data.promptpayName,
        baseDepositAmount: data.baseDepositAmount,
        storeLayoutUrl: newUrl,
        updatedAt: now,
      },
      create: {
        organizationId,
        promptpayNumber: data.promptpayNumber,
        promptpayName: data.promptpayName,
        baseDepositAmount: data.baseDepositAmount,
        storeLayoutUrl: newUrl,
        createdAt: now,
        updatedAt: now,
      },
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error updating booking settings:", error);
    return { success: false, message: "อัปเดตข้อมูลไม่สำเร็จ" };
  }
}

export async function getBookingByPhoneAction(
  phone: string,
  organizationId: number,
) {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const booking = await prisma.table_booking.findFirst({
      where: {
        customerPhone: { contains: phone }, 
        status: { in: ["PENDING", "CONFIRMED"] }, 
        bookingDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
        table: {
          organizationId: organizationId,
        },
      },
      include: {
        table: true, 
      },
      orderBy: { bookingDate: "asc" },
    });

    if (!booking) {
      return {
        success: false,
        message: "ไม่พบคิวจองของวันนี้ที่ตรงกับเบอร์นี้",
      };
    }

    return { success: true, data: booking };
  } catch (error) {
    console.error("Error getBookingByPhoneAction:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการค้นหา" };
  }
}

// ==========================================
// 2. พนักงานกดยืนยันรับลูกค้าเข้าโต๊ะ (Check-in)
// ==========================================
export async function staffCheckInCustomerAction(
  bookingId: number,
  tableId: number,
) {
  try {
    // 1. เปลี่ยนบิลจองให้เสร็จสิ้น (ลูกค้ารับโต๊ะแล้ว)
    await prisma.table_booking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" },
    });

    // 2. ปรับโต๊ะหน้าร้านให้เป็น "ใช้งานอยู่ (OCCUPIED)"
    await prisma.table.update({
      where: { id: tableId },
      data: { status: "OCCUPIED" },
    });

    return { success: true, message: "ลูกค้ารับโต๊ะสำเร็จ!" };
  } catch (error) {
    console.error("Error staffCheckInCustomerAction:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการยืนยันโต๊ะ" };
  }
}

// ==========================================
// 3. พนักงานกด "เคลียร์โต๊ะ" ให้กลับมาว่าง
// ==========================================
export async function clearTableAction(tableId: number) {
  try {
    await prisma.table.update({
      where: { id: tableId },
      data: {
        status: "AVAILABLE", // ปรับสถานะเป็นว่าง
        tableBookingBy: null, // ล้างข้อมูลคนจองออก
      },
    });
    return { success: true, message: "เคลียร์โต๊ะสำเร็จ! โต๊ะกลับมาว่างแล้ว" };
  } catch (error) {
    console.error("Error clearTableAction:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการเคลียร์โต๊ะ" };
  }
}
