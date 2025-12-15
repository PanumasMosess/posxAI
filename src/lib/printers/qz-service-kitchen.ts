import qz from "qz-tray";
import { PrintTicketData } from "../type";
import {
  getCertContentFromS3,
  signDataWithS3Key,
} from "../actions/actionIndex";

export const printToKitchen = async (data: PrintTicketData, organizationId: number) => {
  try {

    qz.security.setCertificatePromise((resolve: any, reject: any) => {
      getCertContentFromS3(`digital-certificate_${organizationId}.txt`)
        .then((res) => {
          if (res.success && res.data) {
            resolve(res.data);
          } else {
            reject("โหลด Cert ไม่ได้");
          }
        })
        .catch(reject);
    });

    qz.security.setSignaturePromise((toSign: string) => {
      return function (resolve: any, reject: any) {
        signDataWithS3Key(toSign, organizationId.toString())
          .then((res) => {
            if (res.success && res.data) {
              resolve(res.data);
            } else {
              reject(
                "Server Signing Failed: " + (res.message || "Unknown error")
              );
            }
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
      // กำหนดขนาดให้ชัดเจน
      size: { width: 80 },
      units: "mm",
      // rasterize: true เพื่อให้ Font ไทยไม่เพี้ยน
      rasterize: true,
      // scaleContent: true เพื่อให้ QZ ขยายเนื้อหาเราให้เต็มหน้ากระดาษ 80mm พอดี
      scaleContent: true,
      margins: 0,
    });

    const htmlContent = `
      <html>
      <head>
        <style>
          /* 1. บังคับขนาดกระดาษระดับ Driver */
          @page {
            size: 80mm auto; /* กว้าง 80mm สูงอัตโนมัติ */
            margin: 0;
          }

          /* 2. บังคับ Body */
          body { 
            font-family: 'Leelawadee UI', 'Tahoma', sans-serif; 
            margin: 0; 
            padding: 5px; 
            width: 75mm; /* เผื่อขอบขาวนิดหน่อย (Safe Zone) */
            color: #000;
          }
          
          /* Reset */
          * { box-sizing: border-box; }

          /* Header */
          .header { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 5px; }
          .title { font-size: 18px; font-weight: bold; background: #000; color: #fff; padding: 2px 5px; border-radius: 4px; display: inline-block; }
          .time { font-size: 12px; margin-top: 5px; font-weight: bold;}

          /* Table Box */
          .table-box {
            display: flex;
            justify-content: center;
            align-items: baseline;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
            margin-bottom: 5px;
          }
          .tbl-label { font-size: 20px; font-weight: bold; margin-right: 5px; }
          .tbl-num { font-size: 40px; font-weight: 900; line-height: 1; }

          /* Menu */
          .menu-row { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 5px; }
          .menu-name { font-size: 22px; font-weight: bold; width: 70%; line-height: 1.1; word-wrap: break-word; }
          .menu-qty { font-size: 30px; font-weight: 900; width: 30%; text-align: right; line-height: 1; }

          /* Sub Items */
          .sub-list { margin-top: 2px; padding-left: 0; list-style: none; }
          .sub-item {
             font-size: 18px; 
             margin-bottom: 2px; 
             padding-left: 5px; 
             border-left: 3px solid #ccc;
             display: flex; justify-content: space-between;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">KITCHEN</div>
          <div class="time">${new Date().toLocaleString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })}</div>
        </div>

        <div class="table-box">
          <span class="tbl-label">โต๊ะ</span>
          <span class="tbl-num">${data.orders[0]?.tableName || "-"}</span>
        </div>

        <div class="menu-row">
          <div class="menu-name">${data.menuName}</div>
          <div class="menu-qty">x${data.totalQuantity}</div>
        </div>

        ${
          data.orders.length > 0
            ? `
          <ul class="sub-list">
            ${data.orders
              .map(
                (order) => `
              <li class="sub-item">
                <div style="width:80%">${
                  order.tableName !== data.orders[0]?.tableName
                    ? `(T-${order.tableName}) `
                    : ""
                } ${order.note || ""}</div>
                ${
                  data.orders.length > 1
                    ? `<div style="font-weight:bold;">x${order.quantity}</div>`
                    : ""
                }
              </li>
            `
              )
              .join("")}
          </ul>
        `
            : ""
        }
        
        <div style="height: 10px;"></div>
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
