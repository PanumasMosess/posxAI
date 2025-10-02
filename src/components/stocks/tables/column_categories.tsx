import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export type Categories = {
  id: number;
  categoryName: string;
};

export const CategoriesColumns = ({
  handleEditCat,
  handleDeleteCat,
}: {
  handleEditCat: (category: Categories) => void;
  handleDeleteCat: (category: Categories) => void;
}): ColumnDef<Categories>[] => [
  {
    id: "sequence",
    header: () => <div className="text-left">#</div>,
    cell: ({ row }) => {
      const sequenceNumber = row.index + 1;
      return <div className="text-left font-medium">{sequenceNumber}</div>;
    },
  },
  {
    accessorKey: "categoryName",
    header: () => <div className="text-center">ชื่อหมวดหมู่</div>, // จัด Header กึ่งกลาง
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("categoryName")}</div>; // จัด Cell กึ่งกลาง
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">เครื่องมือ</div>, // จัด Header กึ่งกลาง
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => {
                  handleEditCat(category);
                }}
              >
                UPDATE
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                 handleDeleteCat(category);
                }}
              >
                DELETE
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
