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
  @page { margin: 0; size: 80mm auto; }
  body { 
    margin: 0; 
    padding: 10px; 
    font-family: 'Courier New', monospace; 
    width: 75mm; /* เผื่อขอบ */
    color: #000;
  }
  
  /* Utilities mimic Tailwind */
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .font-bold { font-weight: bold; }
  .uppercase { text-transform: uppercase; }
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .justify-between { justify-content: space-between; }
  .items-center { align-items: center; }
  .border-b { border-bottom: 1px solid #000; }
  .border-t { border-top: 1px solid #000; }
  .border-dashed { border-style: dashed; }
  .mb-1 { margin-bottom: 4px; }
  .mb-2 { margin-bottom: 8px; }
  .mb-4 { margin-bottom: 16px; }
  .mt-2 { margin-top: 8px; }
  .mt-4 { margin-top: 16px; }
  .pb-2 { padding-bottom: 8px; }
  .pt-2 { padding-top: 8px; }
  
  /* Specific sizes */
  h1 { font-size: 24px; margin: 0 0 5px 0; font-weight: 900; }
  .text-xs { font-size: 10px; }
  .text-sm { font-size: 12px; }
  .text-3xl { font-size: 24px; }
  
  /* Grid System mock */
  .grid { display: grid; }
  .grid-cols-2 { grid-template-columns: 1fr 1fr; }
  .grid-cols-12 { display: flex; width: 100%; } /* ใช้ flex แทน grid 12 col ในการพิมพ์ใบเสร็จจะง่ายกว่า */
  
  /* Custom Grid Layout for Items */
  .col-qty { width: 10%; font-weight: bold; }
  .col-name { width: 60%; padding-right: 5px; word-wrap: break-word; }
  .col-price { width: 30%; text-align: right; }
  
  .footer-dots { 
     border-top: 4px dotted #000; 
     opacity: 0.5; 
     width: 80%; 
     margin: 10px auto; 
  }
`;

export const printReceiptQZ = async (
  data: ReceiptProps,
  printerName: string,
  organizationId: number
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
      React.createElement(ReceiptPage, data)
    );

    const finalHtml = `
      <html>
      <head>
        <style>${RECEIPT_STYLES}</style>
      </head>
      <body>
        ${receiptHtml}
      </body>
      </html>
    `;

    const config = qz.configs.create(printerName || "POS-80", {
      size: { width: 80 },
      units: "mm",
      rasterize: true, 
      scaleContent: true,
      margins: 0,
    });

    const printData = [
      {
        type: "html",
        format: "plain",
        data: finalHtml,
      },
    ];

    await qz.print(config, printData);
    return { success: true, message: "Printed Successfully" };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err.message };
  }
};
