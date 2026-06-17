import { PrintSummaryProps } from "../type";

export const generatePrintSummaryHTML = ({
  dateText,
  shiftText,
  printTime,
  printerName,
  totalSum,
  currencyLabel,
  filteredBreakdown,
}: PrintSummaryProps) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Summary</title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Leelawadee UI', 'DokChampa', 'Saysettha OT', sans-serif; 
            padding: 15px 10px; 
            width: 280px; 
            color: black; 
            margin: 0 auto;
            font-size: 13px;
            line-height: 1.4;
          }
          .header { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 15px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .bold { font-weight: bold; }
          .text-lg { font-size: 15px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .divider-double { border-top: 3px double #000; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">สรุปยอดขาย (End of Shift)</div>
        
        <div class="row">
          <span>วันที่:</span>
          <span>${dateText}</span>
        </div>
        <div class="row">
          <span>กะการขาย:</span>
          <span>${shiftText}</span>
        </div>
        <div class="row">
          <span>พิมพ์เมื่อ:</span>
          <span>${printTime}</span>
        </div>
        <div class="row">
          <span>ผู้พิมพ์:</span>
          <span>${printerName}</span>
        </div>

        <div class="divider"></div>

        <div class="row bold text-lg">
          <span>ยอดรวมทั้งสิ้น:</span>
          <span>${totalSum.toLocaleString()} ${currencyLabel}</span>
        </div>

        <div class="divider"></div>

        <div class="row">
          <span>เงินสด (CASH):</span>
          <span>${filteredBreakdown.CASH.toLocaleString()}</span>
        </div>
        <div class="row">
          <span>โอนเงิน (QR):</span>
          <span>${filteredBreakdown.QR.toLocaleString()}</span>
        </div>
        <div class="row">
          <span>สมาชิก (MEMBER):</span>
          <span>${filteredBreakdown.MEMBER.toLocaleString()}</span>
        </div>

        <div class="divider-double"></div>
        <div style="text-align: center; font-size: 11px; margin-top: 15px;">
          *** สิ้นสุดรายงาน ***
        </div>
      </body>
    </html>
  `;
};
