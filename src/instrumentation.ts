export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron");
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    console.log("⏰ เริ่มต้นระบบ Cron Job เช็คบิลหมดอายุ และ No-Show...");

    cron.schedule(
      "*/5 * * * *",
      async () => {
        try {
          const now = new Date();

          const logTime = now.toLocaleString("th-TH", {
            timeZone: "Asia/Bangkok",
          });

          const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
          const twentyMinsAgo = new Date(now.getTime() - 20 * 60 * 1000);

          // ==============================================================
          // 🧹 1. ยกเลิกบิลที่ "ยังไม่ได้จ่ายเงิน" ภายใน 15 นาที
          // ==============================================================
          const resultUnpaid = await prisma.table_booking.updateMany({
            where: {
              paymentStatus: "UNPAID",
              createdAt: { lt: fifteenMinsAgo },
              status: { not: "CANCELLED" },
            },
            data: {
              status: "CANCELLED",
            },
          });

          if (resultUnpaid.count > 0) {
            console.log(
              `🧹 [${logTime}] ยกเลิกบิลค้างชำระ (เกิน 15 นาที) สำเร็จ: ${resultUnpaid.count} รายการ`,
            );
          }

          // ==============================================================
          // 🚨 2. ยกเลิกบิลที่ "จ่ายแล้ว แต่ไม่มา" ภายใน 20 นาที (No-Show)
          // ==============================================================
          const startOfToday = new Date(now);
          startOfToday.setHours(0, 0, 0, 0);

          const endOfToday = new Date(now);
          endOfToday.setHours(23, 59, 59, 999);

          // 2.2 ดึงคิวของวันนี้ที่ยืนยันแล้วทั้งหมดมาก่อน
          const todaysBookings = await prisma.table_booking.findMany({
            where: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
              bookingDate: {
                gte: startOfToday,
                lte: endOfToday,
              },
            },
          });

          // 2.3 ใช้ JavaScript กรองหาเฉพาะคนที่ "เลยเวลาจองมาแล้ว 20 นาที"
          const noShowBookings = todaysBookings.filter((b) => {
            if (!b.bookingTime) return false; // ถ้าไม่มีเวลาจอง ข้ามไปก่อน

            // นำวันที่จอง มาผสมกับ เวลาจอง (เช่น "18:30")
            const [hours, minutes] = b.bookingTime.split(":").map(Number);
            const exactBookingDateTime = new Date(b.bookingDate);
            exactBookingDateTime.setHours(hours, minutes, 0, 0);

            // เทียบว่า เวลาที่จองจริง เก่ากว่า 20 นาทีที่แล้ว หรือไม่
            return exactBookingDateTime < twentyMinsAgo;
          });

          // 2.4 ถัาเจอคนเบี้ยวคิว ค่อยทำการยกเลิกและคืนโต๊ะ
          if (noShowBookings.length > 0) {
            const tableIdsToFree = noShowBookings.map((b) => b.tableId);
            const bookingIdsToUpdate = noShowBookings.map((b) => b.id);

            // ยกเลิกบิล
            await prisma.table_booking.updateMany({
              where: { id: { in: bookingIdsToUpdate } },
              data: { status: "CANCELLED" },
            });

            // คืนสถานะโต๊ะให้หน้าร้าน
            await prisma.table.updateMany({
              where: { id: { in: tableIdsToFree } },
              data: {
                status: "AVAILABLE",
                tableBookingBy: null,
              },
            });

            console.log(
              `🚨 [${logTime}] ยกเลิกการจองลูกค้าไม่มา (เกิน 20 นาที) และคืนโต๊ะสำเร็จ: ${noShowBookings.length} รายการ`,
            );
          }
        } catch (error) {
          console.error("❌ [Cron Error]:", error);
        }
      },
      {
        timezone: "Asia/Bangkok",
      } as any,
    );
  }
}
