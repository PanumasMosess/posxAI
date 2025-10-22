import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StocksFormularRunning } from "@/lib/type";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash2 } from "lucide-react";

import { useState, useEffect, KeyboardEvent, FocusEvent } from "react";

export const FormularRunningColumns = ({
  handleUpdatePCSFormularRunning,
  handleRemoveFormularRunning,
}: {
  handleUpdatePCSFormularRunning: (id: number, pcs: number) => void;
  handleRemoveFormularRunning: (stocksFormular: StocksFormularRunning) => void;
}): ColumnDef<StocksFormularRunning>[] => [
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
    accessorKey: "productName",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          สินค้าในคลัง
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("productName")}</div>;
    },
  },
  {
    accessorKey: "menuName",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          สินค้าที่ต้องการขาย
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("menuName")}</div>;
    },
  },
  {
    accessorKey: "pcs_update",
    header: () => <div className="text-center">จำนวนที่ถูกตัด</div>,
    cell: ({ row }) => {
      const initialValue = row.getValue("pcs_update");
      const [value, setValue] = useState(initialValue);

      useEffect(() => {
        setValue(row.getValue("pcs_update"));
      }, [row.getValue("pcs_update")]);


      const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleUpdatePCSFormularRunning(
            row.original.id,
            parseInt(e.currentTarget.value) || 0
          );
          e.currentTarget.blur();
        }
      };

      const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        handleUpdatePCSFormularRunning(
          row.original.id,
          parseInt(e.target.value) || 0
        );
      };

      return (
        <div className="text-center">
          <Input
            type="number"
            value={value as string}
            onChange={(e) => setValue(e.target.value)} 
            onKeyDown={handleKeyDown} 
            onBlur={handleBlur} 
            className="max-w-[120px] mx-auto"
          />
        </div>
      );
    },
  },

  {
    id: "actions",
    header: () => <div className="text-center"></div>,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600"
            onClick={() => handleRemoveFormularRunning(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
