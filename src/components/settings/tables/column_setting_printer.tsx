import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, Station } from "@/lib/type";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
  onUpdate?: (id: number, newValue: string) => void;
}) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue || ""); // Handle null
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue || "");
  }, [initialValue]);

  // Focus input เมื่อเริ่มแก้ไข
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (onUpdate && value !== initialValue) {
      onUpdate(row.original.id, value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setValue(initialValue || "");
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-8 w-full"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-1 flex items-center justify-center gap-2 group min-h-[30px]"
      title="คลิกเพื่อแก้ไข"
    >
      <span className="font-medium text-base">{value || "-"}</span>
      <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const StationSelectCell = ({
  getValue,
  row,
  onUpdate,
  options,
}: {
  getValue: () => any;
  row: any;
  onUpdate?: (id: number, newValue: string) => void;
  options: Station[];
}) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue || "");
  const [isEditing, setIsEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setValue(initialValue || "");
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setIsEditing(false);
    if (onUpdate && newValue !== initialValue) {
      onUpdate(row.original.id, newValue);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  if (isEditing) {
   return (
      <select
        ref={selectRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="">เลือกจุดใช้งาน</option>
        {options.map((station) => (
          <option 
            key={station.id} 
            value={station.stationName || ""} 
          >
            {station.stationName || "ไม่มีชื่อ"} 
          </option>
        ))}
        
      </select>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-1 flex items-center justify-center gap-2 group min-h-[30px]"
      title="คลิกเพื่อเปลี่ยน"
    >
      <span className="font-medium text-base">{value || "เลือกจุดใช้งาน"}</span>
      <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const column_setting_printers = (
  onUpdatePrinterName: (id: number, newName: string) => void,
  onUpdateStationUse: (id: number, newStation: string) => void,
  organizationId: number,
  stationsData: Station[]
): ColumnDef<Printer>[] => [
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
    accessorKey: "printerName",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ชื่อเครื่องปริ้น
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: (props) => <EditableCell {...props} onUpdate={onUpdatePrinterName} />,
  },
  {
    accessorKey: "stationUse",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          จุดใช้งาน (Station)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: (props) => (
      <StationSelectCell
        {...props}
        onUpdate={onUpdateStationUse}
        options={stationsData}
      />
    ),
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

export default column_setting_printers;
