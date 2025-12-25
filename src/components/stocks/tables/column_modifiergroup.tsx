import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

export type ModifierGroup = {
  id: number;
  name: string;
  minSelect: number;
  maxSelect: number;
  organizationId?: number | null;
};

export const ModifierGroupColumns = ({
  handleEdit,
  handleDelete,
}: {
  handleEdit: (group: ModifierGroup) => void;
  handleDelete: (group: ModifierGroup) => void;
}): ColumnDef<ModifierGroup>[] => [
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
    header: () => <div className="text-center">ชื่อกลุ่มตัวเลือก</div>,
    cell: ({ row }) => {
      return <div className="text-center font-medium">{row.getValue("name")}</div>;
    },
  },
  {
    id: "rules",
    header: () => <div className="text-center">เงื่อนไขการเลือก</div>,
    cell: ({ row }) => {
      const min = row.original.minSelect;
      const max = row.original.maxSelect;

      let text = "";
      if (max === 1) {
        text = "เลือกได้ 1 ข้อ (Radio)";
      } else {
        text = `เลือกได้สูงสุด ${max} ข้อ`;
      }

      return (
        <div className="text-center text-sm">
          <div>{text}</div>
          <div className="text-xs text-muted-foreground">
            {min > 0 ? `(บังคับเลือกขั้นต่ำ ${min})` : "(ไม่บังคับเลือก)"}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">เครื่องมือ</div>,
    cell: ({ row }) => {
      const group = row.original; 

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
                  handleEdit(group); 
                }}
              >
                แก้ไข (Update)
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  handleDelete(group); 
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