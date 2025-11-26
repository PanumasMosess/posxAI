import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // ใช้ Input ของ Shadcn หรือ html ธรรมดาก็ได้
import { SettingTable } from "@/lib/type";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil } from "lucide-react";
import status from "@/lib/data_temp";
import { useState, useEffect, useRef } from "react";

const tableStatuses = status.tableStatuses;

const EditableCell = ({
  getValue,
  row,
  column,
  table,
  onUpdate,
}: {
  getValue: () => any;
  row: any;
  column: any;
  table: any;
  onUpdate?: (id: number, newName: string) => void;
}) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (value !== initialValue && onUpdate) {
      onUpdate(row.original.id, value);
    } else {
      setValue(initialValue); 
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setValue(initialValue); 
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave} 
        onKeyDown={onKeyDown}
        className="h-8 text-center font-bold text-lg"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-1 flex items-center justify-center gap-2 group"
      title="คลิกเพื่อแก้ไขชื่อโต๊ะ"
    >
      <span className="font-bold text-lg">{value}</span>
      <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const column_setting_tables = (
  onUpdateStatus: (id: number, newStatus: string) => void,
  onUpdateName: (id: number, newName: string) => void 
): ColumnDef<SettingTable>[] => [
  {
    id: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        #
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return <div className="text-left font-medium ml-4">{row.index + 1}</div>;
    },
  },
  {
    accessorKey: "tableName",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ชื่อโต๊ะ
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: (props) => <EditableCell {...props} onUpdate={onUpdateName} />,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <div className="text-center">สถานะ</div>,
    cell: ({ row }) => {
      const currentStatus = row.getValue("status") as string;
      const tableId = row.original.id;

      const statusMeta = tableStatuses.find((s) => s.value === currentStatus);

      return (
        <div className="flex justify-center items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              statusMeta?.color || "bg-gray-300"
            }`}
          />
          <select
            className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={currentStatus}
            onChange={(e) => {
              const newStatus = e.target.value;
              if (onUpdateStatus) {
                onUpdateStatus(tableId, newStatus);
              }
            }}
          >
            {tableStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <div className="text-center">อัปเดตล่าสุด</div>,
    cell: ({ row }) => {
      const dateVal = row.getValue("updatedAt");
      if (!dateVal) return <div className="text-center">-</div>;
      const amount = new Date(dateVal as string | Date);
      const formatted = amount.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Bangkok",
      });

      return (
        <div className="text-center text-sm text-gray-500">{formatted}</div>
      );
    },
  },
];

export default column_setting_tables;