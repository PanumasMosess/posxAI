"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil } from "lucide-react";
import { useState, useEffect } from "react";

const EditableCell = ({
  getValue,
  row,
  onUpdate,
}: {
  getValue: () => any;
  row: any;
  onUpdate?: (id: number, newName: string) => void;
}) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { setValue(initialValue); }, [initialValue]);

  const handleSave = () => {
    setIsEditing(false);
    if (value !== initialValue && onUpdate) onUpdate(row.original.id, value);
    else setValue(initialValue);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    else if (e.key === "Escape") { setIsEditing(false); setValue(initialValue); }
  };

  if (isEditing) {
    return (
      <Input
        ref={(input) => input?.focus()}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={onKeyDown}
        className="h-8 text-center text-sm border-blue-500"
      />
    );
  }

  return (
    <div
      onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
      className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-1 flex items-center justify-center gap-2 group"
    >
      <span className="font-medium text-sm">{value}</span>
      <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const column_setting_category = (
  onUpdateStatus: (id: number, newStatus: string) => void,
  onUpdateName: (id: number, newName: string) => void
): ColumnDef<any>[] => [
  {
    id: "id",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        #
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-left font-medium ml-4">{row.index + 1}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="text-center">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          ชื่อหมวดหมู่
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: (props) => <EditableCell {...props} onUpdate={onUpdateName} />,
  },
  {
    accessorKey: "type",
    header: () => <div className="text-center">ประเภท</div>,
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const isIncome = type === "INCOME";
      return (
        <div className="flex justify-center">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${isIncome ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
            {isIncome ? "รายรับ" : "รายจ่าย"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">สถานะ</div>,
    cell: ({ row }) => {
      const currentStatus = row.getValue("status") as string;
      const id = row.original.id;
      return (
        <div className="flex justify-center items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${currentStatus === "ACTIVE" ? "bg-green-500" : "bg-gray-300"}`} />
          <select
            className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            value={currentStatus || "INACTIVE"}
            onChange={(e) => { if (onUpdateStatus) onUpdateStatus(id, e.target.value); }}
          >
            <option value="ACTIVE">ใช้งาน</option>
            <option value="INACTIVE">ไม่ใช้งาน</option>
          </select>
        </div>
      );
    },
  },
];

export default column_setting_category;