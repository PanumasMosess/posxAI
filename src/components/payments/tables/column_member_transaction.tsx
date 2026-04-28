import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const column_member_transaction: ColumnDef<any>[] = [
  {
    accessorKey: "createdAt",
    header: "วันที่/เวลา",
    cell: ({ row }) => {
      const dateVal = row.getValue("createdAt");
      if (!dateVal) return "-";
      return new Date(dateVal as string | Date).toLocaleString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    accessorKey: "member.phone",
    header: "เบอร์โทรศัพท์",
    cell: ({ row }) => (
      <span className="font-bold text-zinc-700 dark:text-zinc-200">
        {row.original.member?.phone || "-"}
      </span>
    ),
  },
  {
    header: "ชื่อสมาชิก",
    cell: ({ row }) => (
      <span>
        {row.original.member?.firstName} {row.original.member?.lastName || ""}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: () => <div className="text-center">ประเภท</div>,
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const colors: Record<string, string> = {
        TOPUP: "bg-emerald-500",
        EARN: "bg-emerald-500",
        SPEND: "bg-blue-500",
        REDEEM: "bg-purple-500",
        REFUND: "bg-red-500",
        ADJUST: "bg-orange-500",
      };
      return (
        <div className="flex justify-center">
          <Badge className={`${colors[type] || "bg-zinc-500"} text-white`}>
            {type}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">จำนวน</div>,
    cell: ({ row }) => {
      const amount = Number(row.getValue("amount")) || 0;
      const isPoint = row.original.walletType === "POINT";
      return (
        <div
          className={`text-right font-bold ${
            amount > 0 ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {amount > 0 ? "+" : ""}
          {amount.toLocaleString(undefined, {
            minimumFractionDigits: isPoint ? 0 : 2,
            maximumFractionDigits: isPoint ? 0 : 2,
          })}{" "}
          <span className="text-[10px] font-normal text-zinc-500">
            {isPoint ? "แต้ม" : "฿"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "balanceAfter",
    header: () => <div className="text-right">คงเหลือ</div>,
    cell: ({ row }) => {
      const balance = Number(row.getValue("balanceAfter")) || 0;
      const isPoint = row.original.walletType === "POINT";
      return (
        <div className="text-right text-zinc-600 dark:text-zinc-300">
          {balance.toLocaleString(undefined, {
            minimumFractionDigits: isPoint ? 0 : 2,
            maximumFractionDigits: isPoint ? 0 : 2,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "employee.name",
    header: "ผู้ทำรายการ",
    cell: ({ row }) => (
      <span className="text-sm text-zinc-500">
        {row.original.employee?.name || "System"}
      </span>
    ),
  },
];
