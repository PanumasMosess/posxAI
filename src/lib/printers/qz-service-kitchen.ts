import qz from "qz-tray";
import { PrintTicketData } from "../type";
import {
  getCertContentFromS3,
  signDataWithS3Key,
} from "../actions/actionIndex";

export const printToKitchen = async (
  data: PrintTicketData,
  organizationId: number
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
                "Server Signing Failed: " + (res.message || "Unknown error")
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
            font-size: 12px;
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
            padding-bottom: 2px; 
            margin-bottom: 2px; 
          }
          .title { 
            font-size: 16px; 
            font-weight: bold; 
            background: #000; 
            color: #fff; 
            padding: 0 6px; 
            border-radius: 2px; 
            display: inline-block; 
            margin-bottom: 2px;
          }
          .time { font-size: 10px; font-weight: bold; }
      
          .table-box { 
            display: flex; 
            justify-content: center; 
            align-items: baseline; 
            border-bottom: 1px dashed #000; 
            padding-bottom: 2px; 
            margin-bottom: 2px; 
          }
          .tbl-label { font-size: 14px; font-weight: bold; margin-right: 4px; }
          .tbl-num { font-size: 18px; font-weight: 900; }

          .menu-row { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-top: 2px; 
          }
          .menu-name { 
            font-size: 14px; 
            font-weight: bold; 
            width: 80%; 
            line-height: 1.1; 
          }
          .menu-qty { 
            font-size: 16px; 
            font-weight: 900; 
            width: 20%; 
            text-align: right; 
          }
          
          .modifiers-box { 
            font-size: 11px; 
            font-weight: bold; 
            margin-top: 1px; 
            padding-left: 6px; 
            border-left: 2px solid #000; 
            line-height: 1.1;
          }

          .sub-list { 
            margin-top: 2px; 
            padding-top: 2px; 
            border-top: 1px dotted #ccc; 
            list-style: none; 
          }
          .sub-item { 
            font-size: 11px; 
            margin-bottom: 1px; 
            padding-left: 4px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
          }
          .table-tag { 
            font-weight: bold; 
            font-size: 9px; 
            background: #eee; 
            border: 1px solid #000; 
            padding: 0 2px; 
            border-radius: 2px; 
            margin-right: 4px; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">KITCHEN</div>
          <div class="time">${new Date(
            data.createdAt || new Date()
          ).toLocaleString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          })}</div>
        </div>

        <div class="table-box">
          <span class="tbl-label">โต๊ะ</span>
          <span class="tbl-num">${headerTableName}</span>
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
          data.orders.length > 0
            ? `
          <ul class="sub-list">
            ${data.orders
              .map((order) => {
                const showTableLabel =
                  isMixedTable || order.tableName !== data.orders[0]?.tableName;
                return `
              <li class="sub-item">
                <div style="width:85%; display:flex; align-items:center; flex-wrap:wrap;">
                  ${
                    showTableLabel
                      ? `<span class="table-tag">โต๊ะ ${order.tableName}</span>`
                      : ""
                  }
                  ${order.note ? `<span>(Note: ${order.note})</span>` : ""}
                </div>
                ${
                  data.orders.length > 1
                    ? `<div style="font-weight:bold;">x${order.quantity}</div>`
                    : ""
                }
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
