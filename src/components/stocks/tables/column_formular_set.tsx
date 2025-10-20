import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash2 } from "lucide-react";

export type StocksFormular = {
  id: number;
  productName: string;
  quantity: number;
  img: string;
  pcs_formular: number;
};

export const FormularColumns = ({
  handleUpdatePCS,
  handleRemoveItem,
}: {
  handleUpdatePCS: (id: number, pcs: number) => void;
  handleRemoveItem: (stocksFormular: StocksFormular) => void;
}): ColumnDef<StocksFormular>[] => [
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
    id: "img",
    header: () => <div className="text-center">รูปภาพ</div>,
    cell: ({ row }) => {
      const imageUrl = row.original.img;
      return (
        <div className="flex justify-center">
          <img
            src={imageUrl || "/default-image-url.png"}
            alt={row.original.productName}
            className="h-12 w-12 object-cover rounded-md"
          />
        </div>
      );
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
          ชื่อ
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("productName")}</div>;
    },
  },
  {
    accessorKey: "description",
    header: () => <div className="text-center">รายละเอียด</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("description")}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-center">จำนวนคงเหลือ</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("quantity")}</div>;
    },
  },
  {
    accessorKey: "pcs_formular",
    header: () => <div className="text-center">จำนวนที่ต้องการตัด</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <Input
            type="number"
            value={row.getValue("pcs_formular")}
            onChange={(e) =>
              handleUpdatePCS(row.original.id, parseInt(e.target.value) || 0)
            }
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
            onClick={() => handleRemoveItem(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
