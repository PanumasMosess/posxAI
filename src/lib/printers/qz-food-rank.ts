import qz from "qz-tray";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface PrintFoodRankParams {
  printerName: string;
  dateRange: DateRange | undefined;
  selectedShiftSeq: string;
  finalRankedFood: any[];
}

// 🟢 1. สร้าง Type บังคับโครงสร้างข้อมูลให้ชัดเจน ป้องกัน Type 'unknown'
interface GroupData {
  items: any[];
  totalPrice: number;
  currency: string;
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

    const config = qz.configs.create(printerName);

    const dateStr = dateRange?.from
      ? format(dateRange.from, "dd/MM/yyyy")
      : "ทุกวัน";
    const shiftStr =
      selectedShiftSeq === "All" ? "รวมทุกกะ" : `กะที่ ${selectedShiftSeq}`;

    // 🟢 2. บังคับ Type Record<string, GroupData> ให้กับตัวแปรที่รับค่า reduce
    const groupedByCategory: Record<string, GroupData> = finalRankedFood.reduce(
      (acc: Record<string, GroupData>, item: any) => {
        const category = item.categoryName || "ไม่มีหมวดหมู่";
        if (!acc[category]) {
          acc[category] = {
            items: [],
            totalPrice: 0,
            currency: item.currencyLabel || "LAK",
          };
        }
        acc[category].items.push(item);
        acc[category].totalPrice += item.price || 0;
        return acc;
      },
      {},
    );

    let html = `
      <div style="font-family: sans-serif; width: 100%; color: black; font-size: 14px;">
        <h3 style="text-align: center; margin-bottom: 4px;">สรุปอันดับเมนูอาหารขายดี (แยกหมวด)</h3>
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

    let grandTotal = 0;
    let mainCurrency = "LAK";

    for (const [category, groupData] of Object.entries(groupedByCategory)) {
      html += `
        <tr>
          <td colspan="4" style="padding: 8px 2px 4px 2px; font-weight: bold; border-bottom: 1px dotted #ccc;">
             หมวดหมู่: ${category}
          </td>
        </tr>
      `;

      groupData.items.forEach((item, index) => {
        const price = item.price || 0;
        const currency = item.currencyLabel || "LAK";
        mainCurrency = currency;

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
        <tr>
          <td colspan="3" style="padding: 4px 2px; text-align: right; font-weight: bold;">รวมหมวด ${category} :</td>
          <td style="padding: 4px 2px; text-align: right; font-weight: bold;">
            ${groupData.totalPrice.toLocaleString()} <span style="font-size: 10px; color: #555;">${groupData.currency}</span>
          </td>
        </tr>
      `;

      grandTotal += groupData.totalPrice;
    }

    html += `
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 8px 2px; text-align: right; font-weight: bold; border-top: 1px solid #000; font-size: 14px;">ยอดรวมทั้งสิ้น :</td>
              <td style="padding: 8px 2px; text-align: right; font-weight: bold; border-top: 1px solid #000; font-size: 14px;">
                ${grandTotal.toLocaleString()} <span style="font-size: 10px; color: #555;">${mainCurrency}</span>
              </td>
            </tr>
          </tfoot>
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
