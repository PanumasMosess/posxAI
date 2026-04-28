import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingPositions } from "@/lib/type";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Lock } from "lucide-react";
import status from "@/lib/data_temp";
import { useState, useEffect, useRef } from "react";

const positionStatuses = status.positionStatuses;

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

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

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
        ref={(input) => {
          if (input) {
            input.focus();
          }
        }}
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
      // เปลี่ยนจาก onClick ธรรมดา เป็น onPointerDown เพื่อดัก Event ก่อนมันจะกลายเป็น Click
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-1 flex items-center justify-center gap-2 group"
      title="คลิกเพื่อแก้ไขชื่อตำแหน่ง"
    >
      <span className="font-bold text-lg">{value}</span>
      <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const EditablePinCell = ({
  row,
  onUpdate,
}: {
  row: any;
  onUpdate?: (id: number, newPin: string) => void;
}) => {
  const hasPin = !!row.original.pin;
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");

  const handleSave = () => {
    setIsEditing(false);
    if (value.length > 0 && onUpdate) {
      onUpdate(row.original.id, value);
    }
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setValue("");
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={(input) => {
          if (input) {
            input.focus();
          }
        }}
        type="password"
        maxLength={4}
        placeholder="รหัส 4 หลัก"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={handleSave}
        onKeyDown={onKeyDown}
        autoComplete="off" 
        className="h-8 text-center font-bold text-sm tracking-[0.3em] w-32"
      />
    );
  }

  return (
    <div
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-1 flex items-center justify-start gap-2 group w-fit"
      title="คลิกเพื่อเปลี่ยน/ตั้งค่ารหัส PIN"
    >
      {hasPin ? (
        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
          <Lock className="w-3 h-3" /> ตั้งค่าแล้ว
        </span>
      ) : (
        <span className="text-zinc-400">ยังไม่ตั้งค่า</span>
      )}
      <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const column_setting_position = (
  onUpdateStatus: (id: number, newStatus: string) => void,
  onUpdateName: (id: number, newName: string) => void,
  organizationId: number,
  onUpdatePin?: (id: number, newPin: string) => void,
): ColumnDef<SettingPositions>[] => [
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
    accessorKey: "position_name",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ชื่อตำแหน่ง
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
      const positionId = row.original.id;

      const statusMeta = positionStatuses.find(
        (s) => s.value === currentStatus,
      );

      return (
        <div className="flex justify-center items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              statusMeta?.color || "bg-gray-300"
            }`}
          />
          <select
            className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={currentStatus || "INACTIVE"}
            onChange={(e) => {
              const newStatus = e.target.value;
              if (onUpdateStatus) {
                onUpdateStatus(positionId, newStatus);
              }
            }}
          >
            {positionStatuses.map((status) => (
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
    accessorKey: "pin",
    header: "รหัส PIN",
    // ✅ เรียกใช้ EditablePinCell ที่เพิ่งสร้างใหม่
    cell: ({ row }) => <EditablePinCell row={row} onUpdate={onUpdatePin} />,
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

export default column_setting_position;
