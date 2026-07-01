"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

// แปลง Enum ประเภทให้เป็นภาษาไทย และสี
const getTypeBadge = (type: string) => {
  switch (type) {
    case "INCOME":
      return { label: "เงินเข้า", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" };
    case "EXPENSE":
      return { label: "เงินออก", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300" };
    case "SALES":
      return { label: "ขาย", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" };
    case "ADJUSTMENT_UP":
      return { label: "เติมเงินเข้า", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" };
    case "ADJUSTMENT_DOWN":
      return { label: "เบิกเงินออก", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300" };
    case "OVERRIDE_BALANCE":
      return { label: "ปรับยอดคงเหลือ", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" };
    case "TRANSFER_IN":
      return { label: "รับโอนเข้า", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" };
    case "TRANSFER_OUT":
      return { label: "โอนเงินออก", color: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300" };
    case "AR_PAYMENT":
      return { label: "รับชำระหนี้", color: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300" };
    default:
      return { label: type, color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-300" };
  }
};

const column_setting_txlog = (showDateColumn: boolean = false): ColumnDef<any>[] => {
  const columns: ColumnDef<any>[] = [];
  if (showDateColumn) {
    columns.push({
      accessorKey: "date",
      header: ({ column }) => (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            วันที่ทำรายการ
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const dateVal = row.original.date || row.original.createdAt;
        if (!dateVal) return <div className="text-center text-zinc-400 dark:text-zinc-600 text-sm">-</div>;

        const formatted = new Date(dateVal as string | Date).toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });
        return <div className="text-center text-sm font-medium text-zinc-800 dark:text-zinc-200">{formatted}</div>;
      },
    });
  }

  if (!showDateColumn) {
    columns.push({
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            วันที่ / เวลา
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const dateVal = row.getValue("createdAt");
        if (!dateVal) return <div className="text-center text-gray-400">-</div>;
        const formatted = new Date(dateVal as string | Date).toLocaleString("th-TH", {
          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        });
        return <div className="text-center text-sm text-gray-600 dark:text-gray-400">{formatted}</div>;
      },
    });
  }

  columns.push(
    {
      accessorKey: "account.accountName",
      id: "accountName",
      header: () => <div>ชื่อบัญชี</div>,
      cell: ({ row }) => <div className="font-medium text-sm">{row.original.account?.accountName || "-"}</div>,
    },
    {
      accessorKey: "title",
      header: () => <div>รายการ</div>,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.getValue("title")}</span>
          {row.original.note && <span className="text-xs text-gray-500">{row.original.note}</span>}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: () => <div className="text-center">ประเภท</div>,
      cell: ({ row }) => {
        const badge = getTypeBadge(row.getValue("type") as string);
        return (
          <div className="flex justify-center">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${badge.color}`}>{badge.label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">จำนวนเงิน</div>,
      cell: ({ row }) => {
        const rawAmount = parseFloat(row.getValue("amount"));
        const type = row.getValue("type") as string;

        const isNegative = type === "ADJUSTMENT_DOWN" || type === "TRANSFER_OUT" || rawAmount < 0;
        const displayAmount = Math.abs(rawAmount);

        return (
          <div className={`text-right font-bold ${isNegative ? "text-red-500" : "text-emerald-600"}`}>
            {isNegative ? "-" : "+"}{displayAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
        );
      },
    },
    {
      accessorKey: "accountBalance",
      header: () => <div className="text-right pr-4 text-gray-500">คงเหลือหลังทำรายการ</div>,
      cell: ({ row }) => {
        const balance = parseFloat(row.getValue("accountBalance"));
        return <div className="text-right pr-4 text-sm text-gray-500 font-medium">{balance.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</div>;
      },
    }
  );

  if (showDateColumn) {
    columns.push({
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            บันทึกเข้าระบบเมื่อ
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const dateVal = row.getValue("createdAt");
        if (!dateVal) return <div className="text-center text-gray-400">-</div>;
        const formatted = new Date(dateVal as string | Date).toLocaleString("th-TH", {
          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        });
        return <div className="text-center text-xs text-gray-400 dark:text-gray-500">{formatted}</div>;
      },
    });
  }

  columns.push({
    id: "creator",
    header: () => <div className="text-center">ผู้ทำรายการ</div>,
    cell: ({ row }) => {
      const creator = row.original.creator;
      return <div className="text-center text-xs text-gray-500">{creator ? `${creator.name} ${creator.surname || ""}` : "-"}</div>;
    },
  });

  return columns;
};

export default column_setting_txlog;