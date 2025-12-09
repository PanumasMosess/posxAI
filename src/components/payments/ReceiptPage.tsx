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
        className="bg-white text-black p-6 w-[350px] min-h-[400px] font-mono text-xs leading-relaxed mx-auto border border-gray-100"
      >
        {/* --- HEADER --- */}
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
                 <span className="bg-black text-white px-2 py-0.5 self-start rounded-sm">TABLE {table}</span>
            </div>
        </div>

        <div className="flex justify-between border-b border-black mb-2 pb-1 text-[10px] font-bold uppercase">
            <span>Item</span>
            <span>Amt ({curr})</span>
        </div>
        <div className="flex flex-col gap-3 mb-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 items-start uppercase text-[11px]"
            >
              <div className="col-span-1 font-bold">{item.qty}</div>
              <div className="col-span-7 font-medium break-words leading-tight">
                {item.name}
              </div>
              <div className="col-span-4 text-right font-bold whitespace-nowrap">
                {item.price.toLocaleString()} 
                <span className="text-[9px] font-normal text-gray-400 ml-1">{curr}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-black pt-4 mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-bold tracking-widest">TOTAL</span>
            <span className="text-3xl font-black tracking-tighter flex items-start gap-1">
              {total.toLocaleString()}
              <span className="text-xs font-medium translate-y-1">{curr}</span>
            </span>
          </div>

          <div className="flex justify-between text-[10px] uppercase text-gray-500 border-t border-dashed border-gray-300 pt-2 mt-2">
            <span>Type: {paymentMethod}</span>
            {paymentMethod === "CASH" && (
                <span>Cash: {cashReceived?.toLocaleString()} {curr}</span>
            )}
          </div>
          {paymentMethod === "CASH" && (
             <div className="flex justify-between text-[10px] uppercase font-bold mt-1">
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
             {[...Array(20)].map((_, i) => (
                 <div key={i} className={`bg-black h-full ${i % 2 === 0 ? 'w-[2px]' : 'w-[4px]'}`} style={{height: Math.random() > 0.5 ? '100%' : '70%'}}></div>
             ))}
          </div>
          <p className="text-[8px] text-gray-400 mt-1 uppercase tracking-widest">posx-system-verified</p>
        </div>
      </div>
    );
  }
);

ReceiptPage.displayName = "ReceiptPage";