import qz from "qz-tray";
import * as htmlToImage from "html-to-image";
import { renderToStaticMarkup } from "react-dom/server";
import { ReceiptProps } from "@/lib/type";
import { ReceiptPage } from "@/components/payments/ReceiptPage";
import {
  getCertContentFromS3,
  signDataWithS3Key,
} from "../actions/actionIndex";
import React from "react";

export const printReceiptQZ = async (
  data: ReceiptProps,
  printerName: string,
  organizationId: number,
) => {
  try {
    const receiptHtml = renderToStaticMarkup(
      React.createElement(ReceiptPage, data),
    );

    const hiddenDiv = document.createElement("div");
    hiddenDiv.style.position = "absolute";
    hiddenDiv.style.top = "-9999px";
    hiddenDiv.style.left = "-9999px";
    hiddenDiv.style.width = "380px";
    hiddenDiv.style.display = "block";
    hiddenDiv.style.backgroundColor = "#ffffff";

    hiddenDiv.innerHTML = `
      <style>
        .print-pure-wrapper {
          width: 380px !important;
          margin: 0 !important;
          padding: 0 !important;
          background-color: #ffffff !important;
        }
        .print-pure-wrapper * {
          color: #000000 !important;
          border-color: #000000 !important;
          opacity: 1 !important;
          font-weight: 900 !important;
          -webkit-font-smoothing: none !important;
          -webkit-text-stroke: 0.3px #000000;
        }
        
        /* ขยายขนาดตัวอักษรของใบเสร็จภาพรวม */
        .print-pure-wrapper h1 { font-size: 32px !important; }
        .print-pure-wrapper th, .print-pure-wrapper td { font-size: 16px !important; }
        .print-pure-wrapper .text-\\[22px\\] { font-size: 32px !important; }
        .print-pure-wrapper .text-\\[16px\\] { font-size: 26px !important; }
        .print-pure-wrapper .text-\\[14px\\] { font-size: 22px !important; }
        .print-pure-wrapper .text-\\[11px\\] { font-size: 19px !important; }
        .print-pure-wrapper .text-\\[10px\\] { font-size: 17px !important; }
        .print-pure-wrapper .text-\\[9px\\] { font-size: 16px !important; }
        .print-pure-wrapper .text-\\[8px\\] { font-size: 14px !important; }
        
        /* ขยายขนาดคำขอบคุณท้ายบิล */
        .print-pure-wrapper .tracking-wide { 
          font-size: 22px !important; 
          line-height: 1.4 !important;
          margin-top: 5px !important;
        }
        
        .print-pure-wrapper .border-b, 
        .print-pure-wrapper .border-t, 
        .print-pure-wrapper .border-b-2, 
        .print-pure-wrapper .border-t-2 {
          border-width: 2px !important;
        }
        .print-pure-wrapper table {
          margin-bottom: 8px !important;
        }
        .print-pure-wrapper > div {
          margin: 0 !important;
          zoom: 1 !important;
          width: 380px !important;
        }
      </style>
      <div class="print-pure-wrapper">
        ${receiptHtml}
      </div>
    `;

    document.body.appendChild(hiddenDiv);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const receiptContainer = hiddenDiv.querySelector(
      ".print-pure-wrapper",
    ) as HTMLElement;

    if (!receiptContainer) {
      document.body.removeChild(hiddenDiv);
      return { success: false, message: "สร้างบิลล่องหนไม่สำเร็จ" };
    }

    const dataUrl = await htmlToImage.toPng(receiptContainer, {
      pixelRatio: 4,
      backgroundColor: "#ffffff",
    });

    document.body.removeChild(hiddenDiv);
    const base64Image = dataUrl.replace(/^data:image\/png;base64,/, "");

    // ----------------------------------------------------
    // ส่งข้อมูลเข้าสู่ระบบ QZ Tray
    // ----------------------------------------------------
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

    const config = qz.configs.create(printerName || "POS-80", {
      colorType: "blackwhite",
      margins: 0,
      copies: 1,
    });

    const printData = [
      {
        type: "pixel",
        format: "image",
        flavor: "base64",
        data: base64Image,
        options: {
          pageWidth: 3.15,
        },
      },
    ];

    await qz.print(config, printData);
    return { success: true, message: "Printed Successfully" };
  } catch (err: any) {
    console.error(err);
    if (document.querySelector(".print-pure-wrapper")) {
      document.body.removeChild(
        document.querySelector(".print-pure-wrapper")!.parentElement!,
      );
    }
    return { success: false, message: err.message };
  }
};
