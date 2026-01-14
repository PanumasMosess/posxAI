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
      rasterize: true,
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
      <html>
      <head>
        <style>
          @page { size: 80mm auto; margin: 0; }
          
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
            line-height: 1; 
          }

          body { 
            font-family: 'Leelawadee UI', 'Tahoma', sans-serif; 
            width: 75mm; 
            color: #000;
            padding: 0 2px; 
          }

          /* --- Header Zone --- */
          .header { 
            text-align: center; 
            border-bottom: 2px solid #000; 
            padding-bottom: 3px;
            margin-bottom: 3px;
            padding-top: 2px; /* เว้นขอบบนนิดเดียวพอให้พิมพ์ติด */
          }
          .title { 
            font-size: 14px; /* ขนาดปกติ */
            font-weight: bold; 
            background: #000; 
            color: #fff; 
            padding: 2px 6px; 
            border-radius: 4px; 
            display: inline-block; 
          }
          .time { 
            font-size: 12px; 
            font-weight: bold;
            margin-top: 2px;
          }
      
          /* --- Table Zone --- */
          .table-box {
            display: flex; 
            justify-content: center; 
            align-items: baseline;
            border-bottom: 1px dashed #000; 
            padding-bottom: 3px; 
            margin-bottom: 3px;
          }
          .tbl-label { font-size: 16px; font-weight: bold; margin-right: 5px; }
          .tbl-num { font-size: 18px; font-weight: 900; } /* เลขโต๊ะใหญ่ชัด */

          /* --- Menu Zone --- */
          .menu-row { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-top: 3px; 
          }
          .menu-name { 
            font-size: 14px; /* ชื่อเมนูใหญ่ */
            font-weight: bold; 
            width: 75%; 
            line-height: 1; 
            word-wrap: break-word; 
          }
          .menu-qty { 
            font-size: 14x; /* จำนวนใหญ่ */
            font-weight: 900; 
            width: 25%; 
            text-align: right; 
          }
          
          /* --- Modifiers Zone --- */
          .modifiers-box {
            font-size: 12px; 
            font-weight: bold; 
            margin-top: 2px; 
            padding-left: 10px;
            border-left: 3px solid #000; 
          }

          /* --- Sub List Zone --- */
          .sub-list { 
            margin-top: 3px; 
            padding-top: 3px; 
            border-top: 1px dotted #ccc; 
            list-style: none; 
          }
          .sub-item {
             font-size: 12px; 
             margin-bottom: 2px; 
             padding-left: 5px; 
             display: flex; 
             justify-content: space-between; 
             flex-wrap: wrap;
          }
          .table-tag {
             font-weight: bold; 
             font-size: 10px; 
             background: #eee; 
             border: 1px solid #000;
             padding: 0 4px; 
             border-radius: 3px; 
             margin-right: 5px; 
             display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">KITCHEN</div>
       <div class="time">${new Date(
         data.createdAt || new Date()
       ).toLocaleString("lo-LA", {
         day: "2-digit",
         month: "2-digit",
         year: "numeric",
         hour: "2-digit",
         minute: "2-digit",
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
                <div style="width:85%">
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
              </li>
            `;
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
