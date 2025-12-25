"use client";

import { ReceiptProps } from "@/lib/type";
import { forwardRef } from "react";

export const ReceiptPage = forwardRef<HTMLDivElement, ReceiptProps>(
  (
    { orderId, table, date, items, total, currency, cashReceived, change, paymentMethod },
    ref
  ) => {

    const curr = currency || "THB"; 

    return (
      <div
        ref={ref}
        className="bg-white text-black p-6 w-[350px] min-h-[400px] font-mono text-xs leading-relaxed mx-auto border border-gray-100 shadow-sm"
      >
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h1 className="text-3xl font-black tracking-tighter mb-1 uppercase">
            Posx Cafe
          </h1>
          <div className="flex flex-col text-[10px] font-medium tracking-wide text-gray-500 uppercase">
            <span>Vientiane, Laos • 02-999-9999</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2 mb-6 text-[10px] uppercase font-medium">
            <div className="flex flex-col">
                <span className="text-gray-400">Date / Time</span>
                <span>{date}</span>
            </div>
            <div className="flex flex-col text-right">
                <span className="text-gray-400">Order No.</span>
                <span className="font-bold text-sm">#{orderId}</span>
            </div>
            <div className="flex flex-col mt-2">
                 <span className="bg-black text-white px-2 py-0.5 self-start rounded-sm font-bold">TABLE {table}</span>
            </div>
        </div>

        <div className="flex justify-between border-b border-black mb-2 pb-1 text-[10px] font-bold uppercase">
            <span>Item</span>
            <span>Amt ({curr})</span>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {items.map((item, index) => {
            const startModIndex = item.name.indexOf(" (+");
            let mainName = item.name;
            let modifiersList: string[] = [];

            if (startModIndex !== -1) {
                mainName = item.name.substring(0, startModIndex);
                const modsString = item.name.substring(startModIndex + 3, item.name.length - 1);
                modifiersList = modsString.split(", ");
            }

            return (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-start uppercase text-[11px]"
              >
                <div className="col-span-1 font-bold pt-0.5">{item.qty}</div>
                
                <div className="col-span-8 flex flex-col">
                  <span className="font-medium break-words leading-tight">
                    {mainName}
                  </span>
                  
                  {modifiersList.length > 0 && (
                    <div className="flex flex-col mt-1 pl-1 border-l-2 border-gray-200">
                      {modifiersList.map((mod, i) => (
                        <span key={i} className="text-[9px] text-gray-500 italic leading-snug">
                          + {mod}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-3 text-right font-bold whitespace-nowrap pt-0.5">
                  {item.price.toLocaleString()} 
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t-2 border-black pt-4 mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-bold tracking-widest">TOTAL</span>
            <span className="text-3xl font-black tracking-tighter flex items-start gap-1">
              {total.toLocaleString()}
              <span className="text-xs font-medium translate-y-1 text-gray-500">{curr}</span>
            </span>
          </div>

          <div className="flex justify-between text-[10px] uppercase text-gray-500 border-t border-dashed border-gray-300 pt-2 mt-2">
            <span className="font-bold text-black">Paid by: {paymentMethod}</span>
            {paymentMethod === "CASH" && (
                <span>Cash: {cashReceived?.toLocaleString()}</span>
            )}
          </div>
          {paymentMethod === "CASH" && (
             <div className="flex justify-between text-[11px] uppercase font-bold mt-1">
                <span>CHANGE</span>
                <span>{change?.toLocaleString()} {curr}</span>
             </div>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-[10px] font-bold uppercase mb-4">
            *** Thank you for support ***
          </p>
          
          <div className="h-8 w-3/4 mx-auto flex items-end justify-center gap-[2px] opacity-70">
             {[...Array(30)].map((_, i) => (
                 <div key={i} className={`bg-black h-full ${i % 3 === 0 ? 'w-[1px]' : 'w-[3px]'}`} style={{height: Math.random() > 0.3 ? '100%' : '60%'}}></div>
             ))}
          </div>
          <p className="text-[8px] text-gray-400 mt-1 uppercase tracking-widest">posx-system-verified</p>
        </div>
      </div>
    );
  }
);

ReceiptPage.displayName = "ReceiptPage";