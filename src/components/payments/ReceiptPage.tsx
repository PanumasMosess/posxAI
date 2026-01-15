"use client";

import { ReceiptProps } from "@/lib/type";
import { forwardRef } from "react";

export const ReceiptPage = forwardRef<HTMLDivElement, ReceiptProps>(
  (
    {
      orderId,
      table,
      date,
      items,
      total,
      currency,
      cashReceived,
      change,
      paymentMethod,
    },
    ref
  ) => {
    const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);

    const curr = currency || "LAK";
    const staffName = "LARNOY";

    const totalBaht = (total / 650).toFixed(2);
    const totalUSD = (total / 20500).toFixed(2);

    return (
      <div
        ref={ref}
        className="bg-white text-black mx-auto font-sans leading-none flex flex-col items-stretch px-2"
        style={{
          fontFamily: "'Noto Sans Lao', 'Saysettha OT', sans-serif",
          zoom: "0.75",
          width: "380px",
          padding: "5px",
        }}
      >
        {/* ================= HEADER ================= */}
        <div className="text-center mb-1">
          <h1 className="text-[16px] font-black mb-0.5 tracking-tight text-gray-800">
            18 Garage
          </h1>
          <div className="font-bold text-[10px]">ບິນຮັບເງິນ</div>
        </div>

        {/* ================= INFO ================= */}
        <div className="flex justify-between items-end mb-1 font-bold text-gray-700 border-b border-dashed border-gray-400 pb-0.5">
          <div className="flex flex-col gap-0 text-[10px]">
            <span>ວັນທີ: {date}</span>
            {/* <span className="uppercase">ພ.ງ: {staffName}</span> */}
          </div>
          <div className="flex flex-col items-end gap-0">
            <span className="text-[11px]">
              ໂຕະ <span className="border-b border-black">{table}</span>
            </span>
            <span className="text-[9px]">No: {orderId}</span>
          </div>
        </div>

        <table
          className="w-full text-[9px] mb-0.5 border-collapse table-fixed"
          style={{ width: "100%" }}
        >
          <thead>
            <tr>
              <th className="py-1 text-left pl-1 w-[55%]">ລາຍການ</th>
              <th
                className="py-1 text-center w-[10%]"
                style={{ whiteSpace: "nowrap" }}
              >
                ຈ/ນ
              </th>
              <th className="py-1 text-right w-[17%]">ລາຄາ</th>
              <th className="py-1 text-right w-[55%] pr-1">ລວມ</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {items.map((item, index) => {
              const startModIndex = item.name.indexOf(" (+");
              let mainName = item.name;
              let modifiersList: string[] = [];

              if (startModIndex !== -1) {
                mainName = item.name.substring(0, startModIndex);
                const modsString = item.name.substring(
                  startModIndex + 3,
                  item.name.length - 1
                );
                modifiersList = modsString.split(", ");
              }

              const unitPrice = item.price / item.quantity;

              return (
                <tr
                  key={index}
                  className="text-gray-900 font-bold border-b border-dotted border-gray-300 last:border-b-0"
                >
                  <td className="py-1 pl-1 pr-1 text-left align-top w-[55%] break-words">
                    <div className="leading-tight">- {mainName}</div>
                    {modifiersList.length > 0 && (
                      <div className="flex flex-col font-normal text-gray-500 mt-0.5">
                        {modifiersList.map((mod, i) => (
                          <span
                            key={i}
                            className="pl-2 text-[8px] leading-snug"
                          >
                            + {mod}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="py-1 text-center align-top w-[10%]">
                    {item.quantity}
                  </td>

                  <td className="py-1 text-right align-top whitespace-nowrap w-[17%]">
                    {unitPrice.toLocaleString()}
                  </td>

                  <td className="py-1 text-right align-top pr-1 whitespace-nowrap w-[18%]">
                    {item.price.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="border-t border-dashed border-gray-400 mb-0.5"></div>

        {/* ================= TOTALS ================= */}
        <div className="flex justify-between items-start mt-0.5">
          <div className="flex flex-col text-[8px] font-bold text-gray-700">
            <div className="mb-0.5 pb-0.5 border-b border-gray-300 w-fit">
              ອັດຕາແລກປ່ຽນ
            </div>
            <div>B: 650</div>
            <div>$: 20,500</div>
          </div>

          <div className="flex flex-col items-end flex-grow pl-4">
            <div className="flex justify-between w-full items-baseline mb-0.5">
              <span className="font-bold text-[9px] whitespace-nowrap">
                ລວມເງິນ K:
              </span>
              <span className="font-black text-[11px] border-b border-gray-800 leading-none pb-0.5 ml-2">
                {total.toLocaleString()}
              </span>
            </div>

            <div className="w-full font-bold text-[8px] space-y-0 text-gray-800 leading-tight mt-0.5">
              <div className="flex justify-between w-full">
                <span className="text-gray-500 text-end">B:</span>
                <span>{totalBaht}</span>
              </div>
              <div className="flex justify-between w-full">
                <span className="text-gray-500 text-end">$:</span>
                <span>{totalUSD}</span>
              </div>
            </div>

            <div className="mt-0.5 items-end font-bold text-[9px] text-gray-800 border border-black px-1 rounded-[2px]">
              {paymentMethod || "OnePay"}
            </div>
          </div>
        </div>

        <div className="border-t-2 border-double border-gray-300 mt-1 mb-0.5 opacity-60"></div>

        <div className="text-center pb-0.5">
          <div className="font-bold text-[9px] tracking-wide">
            ຂອບໃຈ ໂອກາດໜ້າເຊີນໃໝ່
          </div>
        </div>
      </div>
    );
  }
);

ReceiptPage.displayName = "ReceiptPage";
