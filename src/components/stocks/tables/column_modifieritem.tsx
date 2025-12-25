import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

export type ModifierItem = {
  id: number;
  name: string;
  price: number;
  groupId: number;
  organizationId?: number | null;
  group?: {
    id: number;
    name: string;
  } | null;
};

export const ModifierItemColumns = ({
  handleEdit,
  handleDelete,
}: {
  handleEdit: (item: ModifierItem) => void;
  handleDelete: (item: ModifierItem) => void;
}): ColumnDef<ModifierItem>[] => [
  {
    id: "sequence",
    header: () => <div className="text-left">#</div>,
    cell: ({ row }) => {
      const sequenceNumber = row.index + 1;
      return <div className="text-left font-medium">{sequenceNumber}</div>;
    },
  },
  {
    accessorKey: "name",
    header: () => <div className="text-center">ชื่อตัวเลือก</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">{row.getValue("name")}</div>
      );
    },
  },
  {
    id: "groupName",
    accessorKey: "group.name",
    header: () => <div className="text-center">อยู่ในกลุ่ม</div>,
    cell: ({ row }) => {
      const groupName = row.original.group?.name || "-";
      return (
        <div className="text-center text-sm text-muted-foreground">
          {groupName}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-center">ราคาบวกเพิ่ม</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));

      const formattedPrice = new Intl.NumberFormat("th-TH", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);

      return (
        <div
          className={`text-center font-medium ${
            price > 0 ? "text-green-600" : "text-zinc-500"
          }`}
        >
          {price > 0 ? `+${formattedPrice}` : "ฟรี (0.00)"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">เครื่องมือ</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  handleEdit(item);
                }}
              >
                แก้ไข (Update)
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  handleDelete(item);
                }}
              >
                ลบ (Delete)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
