"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Wallet, Calendar, CalendarDays, Package } from "lucide-react";
import { OrderCardProps } from "@/lib/type";


const OrderCard = ({ employee, currencyLabel, period }: OrderCardProps) => {
  const displayBadge = useMemo(() => {
    if (period === "daily") {
      return { label: "ขายวันนี้", items: employee.todayItems };
    }
    if (period === "monthly") {
      return { label: "ขายเดือนนี้", items: employee.monthItems };
    }
    return { label: "ขายปีนี้", items: employee.yearItems };
  }, [period, employee]);

  return (
    <Card className="bg-white dark:bg-zinc-900 border-none shadow-sm hover:shadow-md transition-all overflow-hidden rounded-2xl">
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg shrink-0">
            {employee.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {employee.name}
            </p>
            <p className="text-[10px] text-zinc-400 font-medium">พนักงาน</p>
          </div>
        </div>

        <div className="flex flex-col items-end bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-1.5 text-primary mb-0.5">
            <Package className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase">
              {displayBadge.label}
            </span>
          </div>
          <span className="font-black text-primary leading-none text-lg">
            {displayBadge.items.toLocaleString()}{" "}
            <span className="text-xs text-zinc-400 font-medium">ชิ้น</span>
          </span>
        </div>
      </div>

      <div className="p-5 space-y-2">
        <div
          className={`flex justify-between items-center p-2.5 rounded-xl transition-all ${
            period === "daily"
              ? "bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-500/20 shadow-sm"
              : ""
          }`}
        >
          <div className="flex items-center gap-2 text-zinc-500">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold">ยอดวันนี้</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {employee.todaySales.toLocaleString()}{" "}
              <span className="text-xs text-zinc-500 font-normal">
                {currencyLabel}
              </span>
            </span>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold leading-none mt-1">
              {employee.todayItems.toLocaleString()} ชิ้น
            </p>
          </div>
        </div>

        <Separator className="bg-zinc-100 dark:bg-zinc-800/50 opacity-50" />

        <div
          className={`flex justify-between items-center p-2.5 rounded-xl transition-all ${
            period === "monthly"
              ? "bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500/20 shadow-sm"
              : ""
          }`}
        >
          <div className="flex items-center gap-2 text-zinc-500">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold">ยอดเดือนนี้</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {employee.monthSales.toLocaleString()}{" "}
              <span className="text-xs text-zinc-500 font-normal">
                {currencyLabel}
              </span>
            </span>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold leading-none mt-1">
              {employee.monthItems.toLocaleString()} ชิ้น
            </p>
          </div>
        </div>

        <Separator className="bg-zinc-100 dark:bg-zinc-800/50 opacity-50" />

        <div
          className={`flex justify-between items-center p-2.5 rounded-xl transition-all ${
            period === "yearly"
              ? "bg-purple-50 dark:bg-purple-950/30 ring-1 ring-purple-500/20 shadow-sm"
              : ""
          }`}
        >
          <div className="flex items-center gap-2 text-zinc-500">
            <CalendarDays className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold">ยอดปีนี้</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {employee.yearSales.toLocaleString()}{" "}
              <span className="text-xs text-zinc-500 font-normal">
                {currencyLabel}
              </span>
            </span>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold leading-none mt-1">
              {employee.yearItems.toLocaleString()} ชิ้น
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OrderCard;