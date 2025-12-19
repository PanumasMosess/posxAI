import qz from "qz-tray";
import QRCode from "qrcode"; 
import {
  getCertContentFromS3,
  signDataWithS3Key,
} from "../actions/actionIndex";

interface PrintQRProps {
  url: string;
  tableName: string;
  printerName?: string;
}

export const printTableQR = async (data: PrintQRProps, organizationId: number) => {
  try {

    const qrImageBase64 = await QRCode.toDataURL(data.url, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: 'M'
    });

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
              reject("Server Signing Failed");
            }
          })
          .catch(reject);
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

    const htmlContent = `
      <html>
      <head>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { 
            font-family: 'Leelawadee UI', sans-serif; 
            margin: 0; 
            padding: 10px 0; /* เว้นบนล่างนิดหน่อย */
            width: 80mm;
            text-align: center;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 16px;
            margin-bottom: 10px;
          }
          .qr-box {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 10px 0;
          }
          img {
            width: 60mm; /* บังคับขนาดรูปให้พอดีกระดาษ (เผื่อขอบข้างละ 10mm) */
            height: auto;
          }
          .footer {
            font-size: 12px;
            color: #555;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="title">โต๊ะ ${data.tableName}</div>
        <div class="subtitle">สแกนเพื่อสั่งอาหาร</div>
        
        <div class="qr-box">
          <img src="${qrImageBase64}" />
        </div>

        <div class="footer">
          Powered by YourApp<br/>
          ${new Date().toLocaleString("th-TH")}
        </div>
        
        <div style="height: 20px;"></div> </body>
      </html>
    `;

    const printData = [{ type: "html", format: "plain", data: htmlContent }];

    await qz.print(config, printData);
    return { success: true, message: "พิมพ์ QR Code สำเร็จ" };

  } catch (err: any) {
    console.error("Print QR Error:", err);
    return { success: false, message: err.message || "เกิดข้อผิดพลาดในการพิมพ์" };
  }
};