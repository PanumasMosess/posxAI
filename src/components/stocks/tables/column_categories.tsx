import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ChefHat, Check, X, Printer } from "lucide-react";

export type Categories = {
  id: number;
  categoryCode?: string | null;
  categoryName: string;
  requiresKitchen: boolean;
  printerName?: string | null;
};

// 🟢 สร้าง Component ย่อยเพื่อจัดการ State ภายใน Cell
const PrinterSelectCell = ({
  category,
  printers,
  handleUpdatePrinter,
}: {
  category: Categories;
  printers: string[];
  handleUpdatePrinter: (cat: Categories, val: string | null) => void;
}) => {
  // ดึงค่าจาก DB มาตรวจสอบ ถ้าเป็นช่องว่าง/null ให้ใช้ "NONE"
  const dbPrinter =
    category.printerName && category.printerName.trim() !== ""
      ? category.printerName
      : "NONE";

  const [localValue, setLocalValue] = useState(dbPrinter);

  useEffect(() => {
    const currentDbPrinter =
      category.printerName && category.printerName.trim() !== ""
        ? category.printerName
        : "NONE";
    setLocalValue(currentDbPrinter);
  }, [category.printerName]);

  // 🟢 เช็คว่าชื่อเครื่องปริ้นใน DB มีอยู่ใน List ที่ QZ Tray ดึงมาได้หรือไม่
  const hasValidPrinter = localValue !== "NONE";
  const isPrinterInList = printers.includes(localValue);

  return (
    <div className="flex justify-center w-[180px] mx-auto">
      <Select
        value={localValue}
        onValueChange={(val) => {
          setLocalValue(val);
          handleUpdatePrinter(category, val === "NONE" ? null : val);
        }}
      >
        <SelectTrigger className="h-8 text-xs bg-white dark:bg-zinc-950">
          <SelectValue placeholder="ไม่ได้ตั้งค่า" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="NONE" className="text-xs text-zinc-500">
            -- ไม่ระบุ (ไม่พิมพ์) --
          </SelectItem>

          {/* 🟢 ถ้ามีชื่อใน DB แต่เครื่องพิมพ์นั้นหาไม่เจอ (ออฟไลน์/โหลดไม่เสร็จ) ให้โชว์ค้างไว้ก่อน */}
          {hasValidPrinter && !isPrinterInList && (
            <SelectItem
              value={localValue}
              className="text-xs font-medium text-amber-600"
            >
              {localValue} (ออฟไลน์)
            </SelectItem>
          )}

          {printers.map((printer) => (
            <SelectItem
              key={printer}
              value={printer}
              className="text-xs font-medium"
            >
              {printer}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const CategoriesColumns = ({
  handleEditCat,
  handleDeleteCat,
  handleToggleKitchen,
  handleUpdatePrinter,
  printers = [],
}: {
  handleEditCat: (category: Categories) => void;
  handleDeleteCat: (category: Categories) => void;
  handleToggleKitchen: (category: Categories, newStatus: boolean) => void;
  handleUpdatePrinter: (
    category: Categories,
    printerName: string | null,
  ) => void;
  printers: string[];
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
    accessorKey: "categoryCode",
    header: () => <div className="text-center">รหัส</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-bold text-primary">
          {row.getValue("categoryCode") || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "categoryName",
    header: () => <div className="text-center">ชื่อหมวดหมู่</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.getValue("categoryName")}
        </div>
      );
    },
  },
  {
    accessorKey: "requiresKitchen",
    header: () => (
      <div className="flex items-center justify-center gap-1">
        <ChefHat className="w-4 h-4" />
        <span>ส่งเข้าครัว</span>
      </div>
    ),
    cell: ({ row }) => {
      const category = row.original;

      return (
        <div className="flex justify-center items-center">
          <button
            onClick={() =>
              handleToggleKitchen(category, !category.requiresKitchen)
            }
            title={
              category.requiresKitchen
                ? "คลิกเพื่อปิดการส่งเข้าครัว"
                : "คลิกเพื่อเปิดการส่งเข้าครัว"
            }
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold 
              transition-all duration-300 ease-in-out border
              hover:shadow-sm active:scale-95 cursor-pointer select-none
              ${
                category.requiresKitchen
                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30 dark:hover:bg-green-500/20"
                  : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }
            `}
          >
            {category.requiresKitchen ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>เข้าครัว</span>
              </>
            ) : (
              <>
                <X className="w-3.5 h-3.5" />
                <span>ไม่เข้าครัว</span>
              </>
            )}
          </button>
        </div>
      );
    },
  },
  {
    accessorKey: "printerName",
    header: () => (
      <div className="flex items-center justify-center gap-1">
        <Printer className="w-4 h-4" />
        <span>เครื่องพิมพ์ปลายทาง</span>
      </div>
    ),
    cell: ({ row }) => {
      const category = row.original;

      return (
        <PrinterSelectCell
          category={category}
          printers={printers}
          handleUpdatePrinter={handleUpdatePrinter}
        />
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">เครื่องมือ</div>,
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
            <DropdownMenuContent align="end" className="w-[120px]">
              <DropdownMenuItem onClick={() => handleEditCat(category)}>
                แก้ไข
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                onClick={() => handleDeleteCat(category)}
              >
                ลบข้อมูล
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
