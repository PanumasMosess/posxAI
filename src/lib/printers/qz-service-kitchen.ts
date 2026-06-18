import qz from "qz-tray";
import { PrintTicketData } from "../type";
import {
  getCertContentFromS3,
  signDataWithS3Key,
} from "../actions/actionIndex";

export const printToKitchen = async (
  data: PrintTicketData,
  organizationId: number,
) => {
  try {
    // ... (ส่วน Certificate และ Security เหมือนเดิม ไม่ต้องแก้)
    qz.security.setCertificatePromise((resolve: any, reject: any) => {
      getCertContentFromS3(`digital-certificate_${organizationId}.txt`)
        .then((res) => {
          if (res.success && res.data) resolve(res.data);
          else reject("โหลด Cert ไม่ได้");
        })
        .catch(reject);
    });

    qz.security.setSignaturePromise((toSign: string) => {
      return function (resolve: any, reject: any) {
        signDataWithS3Key(toSign, organizationId.toString())
          .then((res) => {
            if (res.success && res.data) resolve(res.data);
            else
              reject(
                "Server Signing Failed: " + (res.message || "Unknown error"),
              );
          })
          .catch((err) => {
            console.error("Signing Error:", err);
            reject(err);
          });
      };
    });

    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }

    const printerToUse = data.printerName || "POS-80";

    const config = qz.configs.create(printerToUse, {
      size: { width: 80 },
      units: "mm",
      rasterize: false,
      scaleContent: true,
      margins: 0,
    });

    const allTableNames = data.orders.map((o) => o.tableName);
    const uniqueTables = Array.from(new Set(allTableNames));
    const isMixedTable = uniqueTables.length > 1;

    let headerTableName = data.orders[0]?.tableName || "-";
    if (isMixedTable) {
      headerTableName = `${headerTableName}++`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
            font-family: 'Noto Sans Lao', 'Phetsarath OT', 'Saysettha OT', sans-serif;
            font-size: 16px;
            line-height: 1; 
          }

          body { 
            width: 100%;
            background-color: #fff;
            color: #000;
            padding: 0 2px; 
          }

          .header { 
            text-align: center; 
            border-bottom: 1px solid #000; 
            padding-bottom: 4px; 
            margin-bottom: 4px; 
          }
          .title { 
            font-size: 20px; 
            font-weight: bold; 
            background: #000; 
            color: #fff; 
            padding: 0 6px; 
            border-radius: 2px; 
            display: inline-block; 
            margin-bottom: 2px;
          }
          .time { font-size: 14px; font-weight: bold; }

          .menu-row { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-top: 2px; 
          }
          .menu-name { 
            font-size: 24px; /* 🟢 ปรับเฉพาะชื่อเมนูจาก 18px เป็น 24px */
            font-weight: bold; 
            width: 80%; 
            line-height: 1.1; 
          }
          .menu-qty { 
            font-size: 28px; /* 🟢 ปรับเฉพาะจำนวนจาก 22px เป็น 28px */
            font-weight: 900; 
            width: 20%; 
            text-align: right; 
          }
          
          .modifiers-box { 
            font-size: 15px; 
            font-weight: bold; 
            margin-top: 2px; 
            padding-left: 6px; 
            border-left: 2px solid #000; 
            line-height: 1.1;
          }

          .sub-list { 
            margin-top: 4px; 
            padding-top: 4px; 
            border-top: 1px dashed #000; 
            list-style: none; 
          }
          .sub-item { 
            font-size: 15px; 
            margin-bottom: 3px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
          }
          .table-tag { 
            font-weight: bold; 
            font-size: 15px; 
            margin-right: 4px; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">KITCHEN</div>
          <div class="time">${new Date(
            data.createdAt || new Date(),
          ).toLocaleString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          })}</div>
        </div>
        
        <div class="menu-row">
          <div class="menu-name">${data.menuName}</div>
          <div class="menu-qty">x${data.totalQuantity}</div>
        </div>

        ${
          data.modifiers
            ? `<div class="modifiers-box">+ ${data.modifiers}</div>`
            : ""
        }

        ${
          data.orders && data.orders.length > 0
            ? `
          <ul class="sub-list">
            ${data.orders
              .map((order) => {
                return `
              <li class="sub-item">
                <div style="width:85%; display:flex; align-items:center; flex-wrap:wrap; gap:2px;">
                  <span class="table-tag">[ โต๊ะ ${order.tableName} ]</span>
                  ${order.note ? `<span style="font-weight:bold;">(Note: ${order.note})</span>` : ""}
                </div>
                <div style="font-weight:bold; font-size:16px;">x${order.quantity}</div>
              </li>`;
              })
              .join("")}
          </ul>
        `
            : ""
        }
      </body>
      </html>
    `;

    const printData = [{ type: "html", format: "plain", data: htmlContent }];

    await qz.print(config, printData);
    return { success: true, message: "พิมพ์สำเร็จ" };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err.message };
  }
};
