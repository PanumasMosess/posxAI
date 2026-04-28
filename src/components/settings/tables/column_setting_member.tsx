import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil } from "lucide-react";
import { useState, useEffect } from "react";

const memberStatuses = [
  { value: "ACTIVE", label: "ใช้งาน", color: "bg-emerald-500" },
  { value: "INACTIVE", label: "ปิดใช้งาน", color: "bg-zinc-400" },
  { value: "BANNED", label: "ระงับบัญชี", color: "bg-red-500" },
];

// ✅ อัปเกรด EditableCell ให้รองรับรูปแบบตัวเลข, สี, และ Prefix/Suffix
const EditableCell = ({
  getValue,
  row,
  column,
  table,
  onUpdate,
  fieldKey,
  type = "text",
  textClass = "font-medium text-sm", // Class สีและขนาดตัวอักษรตอนแสดงผล
  formatDisplay, // ฟังก์ชันสำหรับจัดรูปแบบตอนแสดงผล (เช่น ใส่ลูกน้ำ)
}: {
  getValue: () => any;
  row: any;
  column: any;
  table: any;
  onUpdate?: (id: number, field: string, newValue: string) => void;
  fieldKey: string;
  type?: string;
  textClass?: string;
  formatDisplay?: (val: string) => React.ReactNode;
}) => {
  const initialRawValue = getValue();
  const initialValueStr =
    initialRawValue !== undefined && initialRawValue !== null
      ? String(initialRawValue)
      : "";

  const [value, setValue] = useState(initialValueStr);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const newValStr =
      initialRawValue !== undefined && initialRawValue !== null
        ? String(initialRawValue)
        : "";
    setValue(newValStr);
  }, [initialRawValue]);

  const handleSave = () => {
    setIsEditing(false);
    if (value !== initialValueStr && onUpdate) {
      onUpdate(row.original.id, fieldKey, value);
    } else {
      setValue(initialValueStr);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setValue(initialValueStr);
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
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={onKeyDown}
        className="h-8 text-center font-bold text-sm"
      />
    );
  }

  // ใช้ formatDisplay ถ้ามีการส่งมา หรือใช้ค่า value ตรงๆ
  const displayValue = formatDisplay
    ? formatDisplay(value)
    : value !== ""
      ? value
      : "-";

  return (
    <div
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-1 flex items-center justify-center gap-2 group w-full"
      title="คลิกเพื่อแก้ไขข้อมูล"
    >
      <span className={textClass}>{displayValue}</span>
      <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
};

const column_setting_member = (
  onUpdateStatus: (id: number, newStatus: string) => void,
  onUpdateField: (id: number, field: string, newValue: string) => void,
  organizationId: number,
): ColumnDef<any>[] => [
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
    accessorKey: "phone",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          เบอร์โทรศัพท์
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    // ✅ เปลี่ยนเป็น EditableCell
    cell: (props) => (
      <EditableCell
        {...props}
        onUpdate={onUpdateField}
        fieldKey="phone"
        type="tel"
        textClass="font-bold text-zinc-700 dark:text-zinc-200 tracking-wider"
      />
    ),
  },
  {
    accessorKey: "firstName",
    header: () => <div className="text-center font-semibold">ชื่อจริง</div>,
    cell: (props) => (
      <EditableCell {...props} onUpdate={onUpdateField} fieldKey="firstName" />
    ),
  },
  {
    accessorKey: "lastName",
    header: () => <div className="text-center font-semibold">นามสกุล</div>,
    cell: (props) => (
      <EditableCell {...props} onUpdate={onUpdateField} fieldKey="lastName" />
    ),
  },
  {
    accessorKey: "points",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          แต้มสะสม
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    // ✅ เปลี่ยนเป็น EditableCell พร้อมคงสีและลูกน้ำไว้
    cell: (props) => (
      <EditableCell
        {...props}
        onUpdate={onUpdateField}
        fieldKey="points"
        type="number"
        textClass="font-bold text-emerald-600"
        formatDisplay={(val) => Number(val || 0).toLocaleString()}
      />
    ),
  },
  {
    accessorKey: "creditBalance",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          เครดิตคงเหลือ
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    // ✅ เปลี่ยนเป็น EditableCell พร้อมคงสีและสัญลักษณ์เงิน
    cell: (props) => (
      <EditableCell
        {...props}
        onUpdate={onUpdateField}
        fieldKey="creditBalance"
        type="number"
        textClass="font-bold text-blue-600"
        formatDisplay={(val) =>
          `${Number(val || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        }
      />
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center font-semibold">สถานะ</div>,
    cell: ({ row }) => {
      const currentStatus = row.getValue("status") as string;
      const memberId = row.original.id;

      const statusMeta = memberStatuses.find((s) => s.value === currentStatus);

      return (
        <div className="flex justify-center items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              statusMeta?.color || "bg-gray-300"
            }`}
          />
          <select
            className="border rounded-md px-2 py-1 text-xs font-medium bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={currentStatus || "ACTIVE"}
            onChange={(e) => {
              const newStatus = e.target.value;
              if (onUpdateStatus) {
                onUpdateStatus(memberId, newStatus);
              }
            }}
          >
            {memberStatuses.map((status) => (
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
    header: () => <div className="text-center font-semibold">อัปเดตล่าสุด</div>,
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
        <div className="text-center text-[11px] text-zinc-500">{formatted}</div>
      );
    },
  },
];

export default column_setting_member;
