import qz from "qz-tray";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface PrintFoodRankParams {
  printerName: string; // 🟢 รับชื่อปริ้นเตอร์
  dateRange: DateRange | undefined;
  selectedShiftSeq: string;
  finalRankedFood: any[];
}

export const printFoodRank = async ({
  printerName,
  dateRange,
  selectedShiftSeq,
  finalRankedFood,
}: PrintFoodRankParams) => {
  try {
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }

    // 🟢 ตั้งค่าปริ้นเตอร์จากรายชื่อที่ User เลือกมา
    const config = qz.configs.create(printerName);

    const dateStr = dateRange?.from
      ? format(dateRange.from, "dd/MM/yyyy")
      : "ทุกวัน";
    const shiftStr =
      selectedShiftSeq === "All" ? "รวมทุกกะ" : `กะที่ ${selectedShiftSeq}`;

    // 🟢 ปรับ Layout: เปลี่ยนจำนวนเป็น Center, ปรับ % ความกว้างใหม่ให้ช่องราคาใหญ่ขึ้น
    let html = `
      <div style="font-family: sans-serif; width: 100%; color: black; font-size: 14px;">
        <h3 style="text-align: center; margin-bottom: 4px;">สรุปอันดับเมนูอาหารขายดี</h3>
        <p style="text-align: center; margin-top: 0; font-size: 12px;">วันที่: ${dateStr} | ${shiftStr}</p>
        <hr style="border-top: 1px dashed black;" />
        <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr>
              <th style="border-bottom: 1px solid #000; padding: 4px 2px; text-align: center; width: 10%;">#</th>
              <th style="border-bottom: 1px solid #000; padding: 4px 2px; text-align: left; width: 40%;">ชื่อเมนู</th>
              <th style="border-bottom: 1px solid #000; padding: 4px 2px; text-align: center; width: 15%;">จำนวน</th>
              <th style="border-bottom: 1px solid #000; padding: 4px 2px; text-align: right; width: 35%;">ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
    `;

    finalRankedFood.forEach((item, index) => {
      const price = item.price || 0;
      const currency = item.currencyLabel || "LAK";

      html += `
        <tr>
          <td style="padding: 4px 2px; text-align: center; vertical-align: top;">${index + 1}</td>
          <td style="padding: 4px 2px; text-align: left; vertical-align: top; word-break: break-word;">${item.name}</td>
          <td style="padding: 4px 2px; text-align: center; vertical-align: top;">${item.quantity}</td>
          <td style="padding: 4px 2px; text-align: right; vertical-align: top;">
            ${price.toLocaleString()} <span style="font-size: 10px; color: #555;">${currency}</span>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <hr style="border-top: 1px dashed black;" />
        <p style="text-align: center; font-size: 10px;">End of Report</p>
      </div>
    `;

    const printData = [
      {
        type: "pixel",
        format: "html",
        flavor: "plain",
        data: html,
      },
    ];

    await qz.print(config, printData);

    return { success: true };
  } catch (error) {
    console.error("Print Error in qz-food-rank:", error);
    throw error;
  }
};
