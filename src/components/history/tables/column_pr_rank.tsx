"use client";

import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

export type RankedPRItem = {
  id: string;
  name: string;
  image: string | null;
  quantity: number;
  price_sum?: number; 
  currencyLabel?: string; 
};

export const column_pr_rank = (): ColumnDef<RankedPRItem>[] => [
  {
    id: "rank",
    header: () => <div className="text-center font-bold w-16">อันดับ</div>,
    cell: ({ row }) => (
      <div className="text-center font-black text-lg text-zinc-400">
        #{row.index + 1}
      </div>
    ),
  },
  {
    id: "item",
    accessorKey: "name",
    header: () => <div className="text-left ml-2">ชื่อ Entertainer</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-3 py-1 ml-2">
          <div className="h-10 w-10 shrink-0 rounded-full border border-pink-200 bg-pink-50 text-pink-500 overflow-hidden shadow-sm flex items-center justify-center text-[10px] font-bold">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              "PR"
            )}
          </div>
          <span className="font-bold text-base text-zinc-800 dark:text-zinc-100 line-clamp-2">
            {item.name}
          </span>
        </div>
      );
    },
  },
  {
    id: "quantity",
    accessorKey: "quantity",
    header: () => <div className="text-right">จำนวนดื่ม (ครั้ง)</div>,
    cell: ({ row }) => (
      <div className="text-right font-black text-xl text-emerald-600 dark:text-emerald-400">
        {row.original.quantity.toLocaleString()}
      </div>
    ),
  },
  {
    id: "price_sum",
    accessorKey: "price_sum",
    header: () => <div className="text-right pr-4">ยอดรวม</div>,
    cell: ({ row }) => {
      const price = row.original.price_sum || 0;
      const currency = row.original.currencyLabel || "LAK";
      return (
        <div className="text-right pr-4 font-bold text-lg text-pink-600 dark:text-pink-400">
          {price.toLocaleString()}{" "}
          <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
            {currency}
          </span>
        </div>
      );
    },
  },
];
