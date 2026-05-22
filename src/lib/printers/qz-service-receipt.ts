import qz from "qz-tray";
import { renderToStaticMarkup } from "react-dom/server";
import { ReceiptProps } from "@/lib/type";
import { ReceiptPage } from "@/components/payments/ReceiptPage";
import {
  getCertContentFromS3,
  signDataWithS3Key,
} from "../actions/actionIndex";
import React from "react";

const RECEIPT_STYLES = `
  @page { margin: 0; }
  body { 
      background-color: #ffffff; 
      color: #000000 !important; 
      margin: 0; 
      padding: 5px; 
      /* 🟢 เรียกใช้ฟอนต์ลาวมาตรฐาน (เครื่องคอมพิวเตอร์ที่ต่อปริ้นเตอร์ต้องติดตั้งฟอนต์นี้ไว้ด้วยนะครับ) */
      font-family: 'Phetsarath OT', 'Saysettha OT', 'Noto Sans Lao', sans-serif;
      width: 75mm; 
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
  }
    
  div, span, p, td, th {
      font-weight: normal; /* 🟢 เอาตัวหนาออก เพื่อไม่ให้หัวตัวอักษรลาวบอดเวลาโดนความร้อน */
      font-size: 13px; /* 🟢 ปรับขนาดให้พอดีสายตา */
      line-height: 1.5; /* 🟢 เพิ่มระยะห่างบรรทัด ป้องกันสระบน-ล่าง ทับกัน */
  }
  
  /* Utilities */
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  
  /* 🟢 ให้เป็นตัวหนาเฉพาะจุดที่เรียกใช้คลาส .font-bold จริงๆ เท่านั้น */
  .font-bold, h1 { font-weight: bold; }
  
  .uppercase { text-transform: uppercase; }
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .justify-between { justify-content: space-between; }
  .items-center { align-items: center; }
  .border-b { border-bottom: 1px solid #000; }
  .border-t { border-top: 1px solid #000; }
  
  .border-dashed { 
      border-bottom: 1px dashed #000 !important; 
  }
  
  .mb-1 { margin-bottom: 4px; }
  .mb-2 { margin-bottom: 8px; }
  .mb-4 { margin-bottom: 16px; }
  .mt-2 { margin-top: 8px; }
  .mt-4 { margin-top: 16px; }
  .pb-2 { padding-bottom: 8px; }
  .pt-2 { padding-top: 8px; }
  
  h1 { font-size: 22px; margin: 0 0 5px 0; }
  .text-xs { font-size: 11px; }
  .text-sm { font-size: 12px; }
  .text-3xl { font-size: 22px; }
  
  .grid { display: grid; }
  .grid-cols-2 { grid-template-columns: 1fr 1fr; }
  .grid-cols-12 { display: flex; width: 100%; } 
  
  .col-qty { width: 10%; font-weight: bold; }
  .col-name { width: 60%; padding-right: 5px; word-wrap: break-word; }
  .col-price { width: 30%; text-align: right; }
  
  .footer-dots { 
      border-top: 1px dashed #000; 
      width: 100%; 
      margin: 10px auto; 
  }
`;

export const printReceiptQZ = async (
  data: ReceiptProps,
  printerName: string,
  organizationId: number,
) => {
  try {
    qz.security.setCertificatePromise((resolve: any, reject: any) => {
      getCertContentFromS3(`digital-certificate_${organizationId}.txt`)
        .then((res) => {
          if (res.success && res.data) resolve(res.data);
          else reject("Load Cert Failed");
        })
        .catch(reject);
    });

    qz.security.setSignaturePromise((toSign: string) => {
      return function (resolve: any, reject: any) {
        signDataWithS3Key(toSign, organizationId.toString())
          .then((res) => {
            if (res.success && res.data) resolve(res.data);
            else reject("Sign Failed");
          })
          .catch(reject);
      };
    });

    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }

    const receiptHtml = renderToStaticMarkup(
      React.createElement(ReceiptPage, data),
    );

    const finalHtml = `
      <html>
      <head>
        <meta charset="UTF-8">
        <style>${RECEIPT_STYLES}</style>
      </head>
      <body>
        ${receiptHtml}
      </body>
      </html>
    `;

    // 🟢 กำหนด Config แค่ชื่อปริ้นเตอร์และตั้งให้เป็นขาวดำ (ป้องกันสีจาง)
    const config = qz.configs.create(printerName || "POS-80", {
      colorType: "blackwhite",
      margins: 0,
      copies: 1,
    });

    // 🟢 กำหนด Format ของ QZ Tray
    const printData = [
      {
        type: "pixel",
        format: "html",
        flavor: "plain",
        data: finalHtml,
        options: {
          pageWidth: 3.15, // 🟢 สำคัญมาก! หน่วยเป็น นิ้ว (80mm = ~3.15 นิ้ว)
        },
      },
    ];

    await qz.print(config, printData);
    return { success: true, message: "Printed Successfully" };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err.message };
  }
};
