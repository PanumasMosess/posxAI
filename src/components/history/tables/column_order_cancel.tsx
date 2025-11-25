import { Button } from "@/components/ui/button";
import { HistoryOrder } from "@/lib/type";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const column_order_cancel = (): ColumnDef<HistoryOrder>[] => [
  {
    id: "id",
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        #
        <ArrowUpDown className=" h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const sequenceNumber = row.index + 1;
      return <div className="text-left font-medium">{sequenceNumber}</div>;
    },
  },
  {
    accessorKey: "menu.menuName",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ชื่อเมนู
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("menu_menuName")}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => <div className="text-center">จำนวน</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("quantity")}</div>;
    },
  },
  {
    accessorKey: "table.tableName",
    header: ({ column }) => <div className="text-center">ชื่อโต๊ะ</div>,
    cell: ({ row }) => {
      return (
        // ถ้าใช้ TanStack Table มันจะเปลี่ยน . เป็น _ อัตโนมัติ
        <div className="text-center">{row.getValue("table_tableName")}</div>
      );
    },
  },
  {
    accessorKey: "price_sum",
    header: ({ column }) => <div className="text-center">ราคารวม</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("price_sum")}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <div className="text-center">วัน/เวลา</div>,
    cell: ({ row }) => {
      const amount = new Date(row.getValue("updatedAt"));

      const formatted = amount.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Bangkok",
      });

      return <div className="text-center">{formatted}</div>;
    },
  },
];

export default column_order_cancel;
