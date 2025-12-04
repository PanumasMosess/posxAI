"use client";

import { ReceiptProps } from "@/lib/type";
import { forwardRef } from "react";

export const ReceiptPage = forwardRef<HTMLDivElement, ReceiptProps>(
  (
    { orderId, table, date, items, total, cashReceived, change, paymentMethod },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 w-[350px] min-h-[400px] font-mono text-sm leading-relaxed shadow-none"
      >

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">POSX Cafe</h1>
          <p className="text-xs text-gray-500">Vientiane, Laos</p>
          <p className="text-xs text-gray-500">Tel: 02-999-9999</p>
        </div>

        <div className="mb-4 border-b border-dashed border-gray-300 pb-4">
          <div className="flex justify-between">
            <span>Table: {table}</span>
            <span>{date}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">ID: {orderId}</div>
        </div>

        <div className="space-y-2 mb-4 border-b border-dashed border-gray-300 pb-4">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>
                {item.name}{" "}
                <span className="text-xs text-gray-400">x{item.qty}</span>
              </span>
              <span>{item.price.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 mb-6">
          <div className="flex justify-between font-bold text-lg">
            <span>TOTAL</span>
            <span>{total.toLocaleString()}</span>
          </div>

          {paymentMethod === "CASH" && (
            <>
              <div className="flex justify-between text-xs text-gray-500">
                <span>CASH</span>
                <span>{cashReceived?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>CHANGE</span>
                <span>{change?.toLocaleString()}</span>
              </div>
            </>
          )}

          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Payment Type</span>
            <span>{paymentMethod}</span>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-8">
          <p>THANK YOU!</p>
          <p className="mt-1">Please come again.</p>
        </div>
      </div>
    );
  }
);

ReceiptPage.displayName = "ReceiptPage";
