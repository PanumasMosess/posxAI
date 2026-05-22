"use client";

import { Button } from "@/components/ui/button";
import { HistoryPayment } from "@/lib/type";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const column_payment = (): ColumnDef<HistoryPayment>[] => [
  {
    id: "index",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-xs"
      >
        # <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium text-zinc-500">
        {row.index + 1}
      </div>
    ),
  },
  {
    accessorKey: "runningRef.runningCode",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        เลขที่บิล <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.original.runningRef?.runningCode || "-"}
      </div>
    ),
  },
  {
    accessorKey: "table.tableName",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          โต๊ะ <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-bold">
        {row.original.table?.tableName || "N/A"}
      </div>
    ),
  },
  // 🟢 คอลัมน์ที่ 1: รายการอาหาร (ใส่จำนวนกลับมาแล้ว)
  {
    id: "food",
    header: () => <div className="text-left ml-2">รายการอาหาร</div>,
    cell: ({ row }) => {
      const menus = (row.original as any).foodList || [];

      if (menus.length === 0) {
        return <div className="text-sm text-zinc-400 pl-2">-</div>;
      }

      return (
        <div className="flex flex-col gap-2 my-1 ml-2 text-sm max-h-[150px] overflow-y-auto pr-1 min-w-[160px]">
          {menus.map((menu: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 text-zinc-700 dark:text-zinc-300 h-8"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 shrink-0 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-hidden shadow-sm">
                  {menu.image ? (
                    <img
                      src={menu.image}
                      alt={menu.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-400 dark:text-zinc-600">
                      รูป
                    </div>
                  )}
                </div>
                <span
                  className="font-medium truncate max-w-[120px]"
                  title={menu.name}
                >
                  {menu.name}
                </span>
              </div>
              {/* 🟢 คืนค่าจำนวนชิ้น (x) กลับมา */}
              <span className="text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">
                x{menu.quantity}
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  // 🟢 คอลัมน์ที่ 2: พนักงาน Entertainer (ใส่จำนวนกลับมาแล้ว)
  {
    id: "entertainer",
    accessorFn: (row) => {
      const entertainers = (row as any).entertainerList || [];
      return entertainers.map((ent: any) => ent.prName || ent.name).join(" ");
    },
    header: () => <div className="text-left ml-2">Entertainer</div>,
    cell: ({ row }) => {
      const entertainers = (row.original as any).entertainerList || [];

      if (entertainers.length === 0) {
        return <div className="text-sm text-zinc-400 pl-2">-</div>;
      }

      return (
        <div className="flex flex-col gap-2 my-1 ml-2 text-sm max-h-[150px] overflow-y-auto pr-1 min-w-[160px]">
          {entertainers.map((ent: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 text-zinc-700 dark:text-zinc-300 h-8"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 overflow-hidden shadow-sm">
                  {ent.image ? (
                    <img
                      src={ent.image}
                      alt={ent.prName || ent.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-amber-600 dark:text-amber-500 font-bold">
                      PR
                    </div>
                  )}
                </div>
                <div className="flex flex-col truncate">
                  <span
                    className="text-sm font-bold text-amber-700 dark:text-amber-400 truncate max-w-[120px]"
                    title={ent.prName || ent.name}
                  >
                    {ent.prName || ent.name}
                  </span>
                </div>
              </div>
              {/* 🟢 คืนค่าจำนวนรอบ/ดริ้งค์ (x) กลับมา */}
              <span className="text-xs font-mono text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded shrink-0">
                x{ent.quantity}
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: ({ column }) => <div className="text-center">ชำระโดย</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
          {row.getValue("paymentMethod")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ยอดรวม <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"));
      const currency = (row.original as any).currencyLabel || "";
      return (
        <div className="text-right font-bold text-green-600 dark:text-green-400">
          {amount.toLocaleString()}{" "}
          <span className="text-xs text-zinc-400 font-normal">{currency}</span>
        </div>
      );
    },
  },
  {
    id: "shift",
    accessorFn: (row) => {
      const seq = (row.shift as any)?.shiftSequence || row.shift?.id;
      return seq ? `กะที่ ${seq}` : "";
    },
    header: () => <div className="text-center">กะการทำงาน</div>,
    cell: ({ row }) => {
      const seq =
        (row.original.shift as any)?.shiftSequence || row.original.shift?.id;
      return (
        <div className="text-center">
          {seq ? (
            <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold border dark:border-zinc-700">
              กะที่ {seq}
            </span>
          ) : (
            <span className="text-zinc-400">-</span>
          )}
        </div>
      );
    },
  },
  {
    id: "orderTaker",
    accessorFn: (row) => (row as any).orderTakerName,
    header: () => <div className="text-center">คนรับออเดอร์</div>,
    cell: ({ row }) => {
      const orderTakerName = (row.original as any).orderTakerName;
      return (
        <div className="text-center text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {orderTakerName || (
            <span className="text-zinc-400">สั่งผ่านระบบ</span>
          )}
        </div>
      );
    },
  },
  {
    id: "cashier",
    accessorFn: (row) =>
      `${row.creator?.name || ""} ${row.creator?.surname || ""}`.trim(),
    header: () => <div className="text-center">คนรับชำระ</div>,
    cell: ({ row }) => {
      const name = row.original.creator?.name;
      const surname = row.original.creator?.surname;
      return (
        <div className="text-center text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {name ? (
            `${name} ${surname || ""}`
          ) : (
            <span className="text-zinc-400 dark:text-zinc-600">-</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <div className="text-center">เวลาชำระ</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-center text-xs text-zinc-500">
          <div>
            {date.toLocaleDateString("th-TH", {
              day: "2-digit",
              month: "short",
              year: "2-digit",
              timeZone: "Asia/Bangkok",
            })}
          </div>
          <div>
            {date.toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "Asia/Bangkok",
            })}
          </div>
        </div>
      );
    },
  },
];

export default column_payment;
