"use client";

import { HistoryOrder } from "@/lib/type";
import { ColumnDef } from "@tanstack/react-table";

export const column_order_comple = (): ColumnDef<HistoryOrder>[] => [
  {
    id: "id",
    header: () => <div className="text-center font-bold">รหัสบิล</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-mono text-xs">
          {row.original.order_running_code}
        </div>
      );
    },
  },
  {
    id: "food",
    header: () => <div className="text-left ml-2">รายการอาหาร</div>,
    cell: ({ row }) => {
      // ดึงจากถัง foodList
      const menus = (row.original as any).foodList || [];

      if (menus.length === 0)
        return <span className="text-zinc-400 dark:text-zinc-500 pl-2">-</span>;

      return (
        <div className="flex flex-col gap-2 my-1 ml-2 max-h-[150px] overflow-y-auto pr-2 min-w-[160px]">
          {menus.map((menu: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 h-8">
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
                className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[160px]"
                title={menu.name}
              >
                {menu.name}
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "entertainer",
    accessorFn: (row) => {
      const entertainers = (row as any).entertainerList || [];
      return entertainers.map((ent: any) => ent.prName || ent.name).join(" ");
    },
    header: () => <div className="text-left ml-2">Entertainer</div>,
    cell: ({ row }) => {
      const entertainers = (row.original as any).entertainerList || [];

      if (entertainers.length === 0)
        return <span className="text-zinc-400 dark:text-zinc-500 pl-2">-</span>;

      return (
        <div className="flex flex-col gap-2 my-1 ml-2 max-h-[150px] overflow-y-auto pr-2 min-w-[160px]">
          {entertainers.map((ent: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 h-8">
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
                  className="text-sm font-bold text-amber-700 dark:text-amber-400 truncate"
                  title={ent.prName || ent.name}
                >
                  {ent.prName || ent.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "quantity",
    header: () => <div className="text-center">รวมจำนวน</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">{row.original.quantity}</div>
      );
    },
  },
  {
    id: "table",
    header: () => <div className="text-center">ชื่อโต๊ะ</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.table?.tableName || "-"}
        </div>
      );
    },
  },
  {
    id: "price_sum",
    header: () => <div className="text-center">ยอดสุทธิ</div>,
    cell: ({ row }) => {
      const currency = (row.original as any).currencyLabel || "";

      return (
        <div className="text-center font-bold text-amber-600 dark:text-amber-500">
          {row.original.price_sum.toLocaleString()}{" "}
          <span className="text-xs text-zinc-400 font-normal ml-1">
            {currency}
          </span>
        </div>
      );
    },
  },
  {
    id: "shift",
    accessorFn: (row) => {
      const shift = row.paymentInfo?.shift;
      const displaySeq = shift?.shiftSequence || shift?.id;
      return displaySeq ? `กะที่ ${displaySeq}` : "";
    },
    header: () => <div className="text-center">กะการทำงาน</div>,
    cell: ({ row }) => {
      const shift = row.original.paymentInfo?.shift;
      const displaySeq = shift?.shiftSequence || shift?.id;

      return (
        <div className="text-center">
          {displaySeq ? (
            <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded-md text-xs font-medium border dark:border-zinc-800">
              กะที่ {displaySeq}
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
    accessorFn: (row) => row.employeeName,
    header: () => <div className="text-center">คนรับออเดอร์</div>,
    cell: ({ row }) => {
      const orderTakerName = row.original.employeeName;
      return (
        <div className="text-center text-sm font-medium">
          {orderTakerName || (
            <span className="text-zinc-400">สั่งผ่านระบบ</span>
          )}
        </div>
      );
    },
  },
  {
    id: "cashier",
    accessorFn: (row) => row.paymentInfo?.creator?.name,
    header: () => <div className="text-center">คนรับชำระ</div>,
    cell: ({ row }) => {
      const cashierName = row.original.paymentInfo?.creator?.name;
      return (
        <div className="text-center text-sm font-medium">
          {cashierName || <span className="text-zinc-400">ไม่ระบุ</span>}
        </div>
      );
    },
  },

  {
    id: "updatedAt",
    header: () => <div className="text-center">เวลาชำระ</div>,
    cell: ({ row }) => {

      const paymentDate = new Date(row.original.updatedAt);

      const shiftData = row.original.paymentInfo?.shift as any;
      const businessDate =
        shiftData?.createdAt || shiftData?.startTime
          ? new Date(shiftData.createdAt || shiftData.startTime)
          : paymentDate;

      return (
        <div className="text-center text-xs text-zinc-500">
          <div className="font-bold text-zinc-700 dark:text-zinc-300">
            {businessDate.toLocaleDateString("th-TH", {
              day: "2-digit",
              month: "short",
              year: "2-digit",
              timeZone: "Asia/Bangkok",
            })}
          </div>
          <div>
            {paymentDate.toLocaleTimeString("th-TH", {
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

export default column_order_comple;
