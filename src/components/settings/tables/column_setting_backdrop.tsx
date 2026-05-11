import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const EditableCell = ({
  getValue,
  row,
  onUpdate,
}: {
  getValue: () => any;
  row: any;
  onUpdate?: (id: number, newValue: string) => void;
}) => {
  const initialValue = getValue() || "";
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (value !== initialValue && onUpdate) {
      onUpdate(row.original.id, value);
    } else {
      setValue(initialValue);
    }
  };

  return isEditing ? (
    <Input
      ref={inputRef}
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
      className="h-8 text-sm w-full"
    />
  ) : (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-1.5 flex items-center gap-2 group w-full"
      title="คลิกเพื่อแก้ไข"
    >
      <span className="font-medium text-sm truncate flex-1">
        {value || <span className="text-zinc-400 italic">ไม่มีชื่อ</span>}
      </span>
      <Pencil className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
};

const EditableNumberCell = ({
  getValue,
  row,
  onUpdate,
  suffix = "",
}: {
  getValue: () => any;
  row: any;
  onUpdate?: (id: number, newValue: number) => void;
  suffix?: string;
}) => {
  const initialValue = getValue() || 0;
  const [value, setValue] = useState<string>(String(initialValue));
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(String(initialValue));
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue !== initialValue && onUpdate) {
      onUpdate(row.original.id, numValue);
    } else {
      setValue(String(initialValue));
    }
  };

  return isEditing ? (
    <Input
      ref={inputRef}
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") {
          setIsEditing(false);
          setValue(String(initialValue));
        }
      }}
      className="h-8 text-center text-sm w-20 mx-auto"
    />
  ) : (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-1.5 flex items-center justify-center gap-2 group w-20 mx-auto"
    >
      <span className="font-medium text-sm">
        {value} {suffix}
      </span>
      <Pencil className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const column_setting_backdrop = (
  onUpdateTitle: (id: number, title: string) => void,
  onUpdateSequence: (id: number, sequence: number) => void,
  onUpdateDuration: (id: number, duration: number) => void,
  onUpdateStatus: (id: number, isActive: boolean) => void,
  onDelete: (id: number) => void,
  onOpenForm: (id: number) => void,
): ColumnDef<any>[] => [
  {
    id: "index",
    header: () => <div className="text-center w-10">#</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium text-zinc-500">
        {row.index + 1}
      </div>
    ),
  },
  {
    accessorKey: "imageUrl",
    header: () => <div className="text-center">สื่อ (รูป/วิดีโอ)</div>,
    cell: ({ row }) => {
      const imgUrl = row.original.imageUrl;
      const id = row.original.id;
      // เช็คว่าเป็นวิดีโอหรือไม่ เพื่อให้พรีวิวรูปเล็กในตารางได้ถูกต้อง
      const isVideo = imgUrl?.match(/\.(mp4|webm|mov)$/i);

      return (
        <div className="flex justify-center">
          <div
            onClick={() => onOpenForm(id)} // ✅ คลิกแล้วส่ง ID ไปเปิด Form
            className="relative w-24 h-14 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-black cursor-pointer group"
          >
            {imgUrl ? (
              isVideo ? (
                <video
                  src={imgUrl}
                  muted
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 opacity-90"
                />
              ) : (
                <Image
                  src={imgUrl}
                  alt="Backdrop"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              )
            ) : (
              <span className="text-[10px] text-zinc-400 flex h-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                No Media
              </span>
            )}

            {/* ✅ Overlay สีดำบางๆ พร้อมข้อความ "แก้ไข" ตอนเอาเมาส์ชี้ */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-wider">
                แก้ไขสื่อ
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-2"
      >
        ชื่อโปรโมชั่น
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (props) => <EditableCell {...props} onUpdate={onUpdateTitle} />,
  },
  {
    accessorKey: "sequence",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          ลำดับ
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: (props) => (
      <EditableNumberCell {...props} onUpdate={onUpdateSequence} />
    ),
  },
  {
    accessorKey: "duration",
    header: () => <div className="text-center">เวลาโชว์</div>,
    cell: (props) => (
      <EditableNumberCell {...props} onUpdate={onUpdateDuration} suffix="วิ" />
    ),
  },
  {
    accessorKey: "isActive",
    header: () => <div className="text-center">สถานะ</div>,
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      const id = row.original.id;

      return (
        <div className="flex justify-center items-center">
          <select
            className={`border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium ${
              isActive
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
            }`}
            value={isActive ? "true" : "false"}
            onChange={(e) => {
              if (onUpdateStatus) onUpdateStatus(id, e.target.value === "true");
            }}
          >
            <option value="true">แสดงผล</option>
            <option value="false">ปิดซ่อน</option>
          </select>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">จัดการ</div>,
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete && onDelete(id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 h-8 w-8 p-0 rounded-full"
            title="ลบรูปภาพ"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    },
  },
];

export default column_setting_backdrop;
