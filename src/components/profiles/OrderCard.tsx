"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import CountdownTimer from "./CountdownTimer"; 

const OrderCard = ({ bill, currencyLabel = "฿" }: { bill: any; currencyLabel?: string }) => {
  return (
    <Card className="p-4 sm:p-5 hover:shadow-md transition-all duration-200 border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-xs"
            >
              โต๊ะ {bill.tableName}
            </Badge>
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-mono">
              {bill.runningCode}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock className="w-3.5 h-3.5" />
            {new Date(bill.createdAt).toLocaleString("th-TH")}
          </div>
        </div>

        <div className="md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start">
          <div className="flex flex-col md:items-end">
            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mb-0.5">
              ยอดรวมเฉพาะของคุณ
            </span>
            <p className="text-xl sm:text-2xl font-black text-primary dark:text-primary">
              {bill.totalPrice?.toLocaleString() || 0}{" "}
              <span className="text-sm sm:text-base font-bold ml-1">{currencyLabel}</span>
            </p>
          </div>
          <Badge
            className={`text-[10px] px-2 py-0.5 mt-0 md:mt-1 shadow-sm ${
              bill.status === "PAY_COMPLETED"
                ? "bg-green-100 text-green-700 border-green-200"
                : bill.status === "CANCELLED"
                  ? "bg-red-100 text-red-700 border-red-200"
                  : "bg-blue-100 text-blue-700 border-blue-200"
            }`}
            variant="outline"
          >
            {bill.status === "PAY_COMPLETED"
              ? "ชำระแล้ว"
              : bill.status === "CANCELLED"
                ? "ยกเลิก"
                : "กำลังใช้งาน"}
          </Badge>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
        {bill.items?.map((item: any, idx: number) => {
          const itemTotal =
            item.note && item.price_package
              ? item.price_package * item.quantity
              : item.price * item.quantity;

          return (
            <div
              key={`${item.id}-${idx}`}
              className="flex justify-between items-start text-sm p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg group transition-colors"
            >
              <div className="flex gap-3 items-start flex-1">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0">
                  <AvatarImage src={item.img} className="object-cover" />
                  <AvatarFallback className="text-xs bg-zinc-100 text-zinc-400">
                    IMG
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <p className="text-zinc-800 dark:text-zinc-200 font-semibold leading-tight flex items-center gap-2">
                    <span className="text-primary font-black text-xs sm:text-sm bg-primary/10 px-1.5 py-0.5 rounded">
                      {item.quantity}x
                    </span>
                    {item.menuName}
                  </p>
                  {item.note && (
                    <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                      * {item.note}
                    </p>
                  )}
                  {item.orderStatus === "COMPLETED" && item.mcEmployeeId && (
                    <div className="mt-1">
                      <CountdownTimer
                        startTime={item.orderCreatedAt}
                        packageHours={item.package_hours}
                        quantity={item.quantity}
                        unit={item.unit}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 ml-2">
                <span className="text-zinc-900 dark:text-white text-xs sm:text-sm font-bold mt-1">
                  {itemTotal.toLocaleString()}{" "}
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-normal">{currencyLabel}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default OrderCard;