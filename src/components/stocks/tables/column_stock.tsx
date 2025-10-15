import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export type Stocks = {
  id: number;
  productName: string;
  quantity: number;
  img: string;
};

export const StockColumns = ({}: {}): ColumnDef<Stocks>[] => [
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
    header: () => <div className="text-center">ยอดคงเหลือ</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("quantity")}</div>;
    },
  },
];
