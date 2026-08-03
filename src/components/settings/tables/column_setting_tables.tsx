import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingTable } from "@/lib/type";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil } from "lucide-react";
import status from "@/lib/data_temp";
import { useState, useEffect, useRef } from "react";
import { TableQRAction } from "../QRCode/TableQRCode";

const tableStatuses = status.tableStatuses;

// Component สำหรับแก้ชื่อโต๊ะ
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

const EditableNumberCell = ({
  getValue,
  row,
  onUpdate,
}: {
  getValue: () => any;
  row: any;
  onUpdate?: (id: number, newSeatCount: number) => void;
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
    const numValue = Number(value);
    if (numValue !== initialValue && onUpdate && !isNaN(numValue)) {
      onUpdate(row.original.id, numValue);
    } else {
      setValue(initialValue);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        min={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") {
            setIsEditing(false);
            setValue(initialValue);
          }
        }}
        className="h-8 w-20 mx-auto text-center text-lg font-bold text-blue-600 dark:text-blue-400 border-blue-400 focus-visible:ring-blue-500"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-md p-1.5 flex items-center justify-center gap-2 group transition-colors"
      title="คลิกเพื่อแก้ไขจำนวนที่นั่ง"
    >
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
          {value}
        </span>
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          ที่นั่ง
        </span>
      </div>
      <Pencil className="w-3.5 h-3.5 text-blue-400/50 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const column_setting_tables = (
  onUpdateStatus: (id: number, newStatus: string) => void,
  onUpdateName: (id: number, newName: string) => void,
  onUpdateSeatCount: (id: number, newSeatCount: number) => void, // 🟢 เพิ่ม Handler จำนวนที่นั่ง
  onUpdateReservable: (id: number, isReservable: boolean) => void, // 🟢 เพิ่ม Handler สถานะการจอง
  organizationId: number,
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
    accessorKey: "seatCount",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          จำนวนที่นั่ง
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: (props) => (
      <EditableNumberCell {...props} onUpdate={onUpdateSeatCount} />
    ),
  },
  {
    accessorKey: "isReservable",
    header: () => <div className="text-center">เปิดให้จองออนไลน์</div>,
    cell: ({ row }) => {
      const isReservable = row.getValue("isReservable") as boolean;
      const tableId = row.original.id;

      return (
        <div className="flex items-center justify-center gap-2.5">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!isReservable}
              onChange={(e) => onUpdateReservable(tableId, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500"></div>
          </label>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition-colors border ${
              isReservable
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50"
            }`}
          >
            {isReservable ? "เปิดจอง" : "ปิดจอง"}
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
    id: "qrCode",
    header: () => <div className="text-center">QR Code</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center py-2">
          <TableQRAction
            tableId={row.original.id}
            tableName={row.original.tableName}
            organizationId={organizationId}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: () => <div className="text-center">อัปเดตล่าสุด</div>,
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
