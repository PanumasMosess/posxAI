import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const smsMessage = body.sms_message;

    if (!smsMessage) {
      return NextResponse.json(
        { success: false, message: "ไม่มีข้อความส่งมา" },
        { status: 400 },
      );
    }

    // console.log("📨 ได้รับ SMS:", smsMessage);

    let amount = 0;
    let match = null;

    const bankSpecificPattern =
      /มีเงิน\s*([0-9,]+\.\d{2})|รับโอนจาก\S+\s+([0-9,]+\.\d{2})|(?:\s|^)([0-9,]+\.\d{2})\s+จาก/;
    match = smsMessage.match(bankSpecificPattern);

    if (match) {
      const extractedAmount = match[1] || match[2] || match[3];
      amount = parseFloat(extractedAmount.replace(/,/g, ""));
    }

    if (!amount) {
      match = smsMessage.match(
        /(?:เงินเข้า|จำนวน|จำนวนเงิน|ยอด|ยอดเงิน|รับโอนเงิน|โอนเข้า)\s*([0-9,]+\.\d{2})/,
      );
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ""));
      }
    }

    if (!amount) {
      match = smsMessage.match(/([0-9,]+\.\d{2})\s*(?:บ\.|บาท|THB|thb|Baht)/i);
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ""));
      }
    }

    if (!amount) {
      match = smsMessage.match(/([0-9,]+\.\d{2})/);
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ""));
      }
    }

    if (!amount) {
      match = smsMessage.match(/(?:เงินเข้า|จำนวน|ยอด)\s*([\d,]+)/);
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ""));
      }
    }

    // console.log("💰 ยอดเงินที่สกัดได้:", amount);

    if (amount > 0) {
      const expirationTime = new Date(Date.now() - 15 * 60 * 1000);
      const booking = await prisma.table_booking.findFirst({
        where: {
          paymentStatus: "UNPAID",
          depositAmount: amount,
          createdAt: {
            gte: expirationTime,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      if (booking) {
        await prisma.table_booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
          },
        });

        const today = new Date();
        const bookingDate = new Date(booking.bookingDate);
        const isToday = today.toDateString() === bookingDate.toDateString();

        if (isToday) {
          await prisma.table.update({
            where: { id: booking.tableId },
            data: {
              status: "RESERVED", 
              tableBookingBy: booking.customerName || "Online Booking", 
            },
          });
        }

        // console.log(
        //   `✅ อัปเดตบิล ${booking.id} เป็น PAID สำเร็จ! ยอด: ${amount} บาท`,
        // );
      } else {
        // console.log(
        //   `⚠️ ไม่พบบิลที่รอยืนยันภายใน 15 นาที ด้วยยอด ${amount} บาท`,
        // );
      }
    }

    return NextResponse.json({
      success: true,
      extractedAmount: amount,
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
