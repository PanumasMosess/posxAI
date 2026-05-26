"use client";

import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

export type RankedItem = {
  id: string;
  name: string;
  image: string | null;
  type: string;
  quantity: number;
};

export const column_food_rank = (): ColumnDef<RankedItem>[] => [
  {
    id: "rank",
    header: () => (
      <div className="text-center font-bold w-12 sm:w-16">อันดับ</div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-black text-lg text-zinc-400">
        #{row.index + 1}
      </div>
    ),
  },
  {
    id: "item",
    accessorKey: "name",
    header: () => <div className="text-left ml-2">ชื่อรายการ</div>,
    cell: ({ row }) => {
      const item = row.original;
      const isPR = item.type === "Entertainer (PR)";
      return (
        <div className="flex items-center gap-3 py-1 ml-2">
          <div
            className={cn(
              "h-10 w-10 shrink-0 border overflow-hidden shadow-sm flex items-center justify-center text-[10px] font-bold",
              isPR
                ? "rounded-full border-pink-200 bg-pink-50 text-pink-500"
                : "rounded-md border-zinc-200 bg-zinc-100 text-zinc-400",
            )}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : isPR ? (
              "PR"
            ) : (
              "รูป"
            )}
          </div>
          <span className="font-bold text-sm sm:text-base text-zinc-800 dark:text-zinc-100 line-clamp-2">
            {item.name}
          </span>
        </div>
      );
    },
  },
  {
    id: "quantity",
    accessorKey: "quantity",
    header: () => <div className="text-right pr-4">ยอดขายรวม (ครั้ง)</div>,
    cell: ({ row }) => (
      <div className="text-right pr-4 font-black text-xl text-emerald-600 dark:text-emerald-400">
        {row.original.quantity.toLocaleString()}
      </div>
    ),
  },
];
