"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
// เพิ่ม PlusCircle และ MinusCircle
import { ArrowUpDown, Pencil, ArrowRightLeft, PlusCircle, MinusCircle } from "lucide-react"; 
import { useState, useEffect } from "react";

// EditableCell (สำหรับชื่อบัญชี - คงไว้เหมือนเดิม)
const EditableCell = ({ getValue, row, onUpdate }: any) => {
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
        ref={(input) => input?.focus()} value={value}
        onChange={(e) => setValue(e.target.value)} onBlur={handleSave} onKeyDown={onKeyDown}
        className="h-8 text-center font-bold text-md border-blue-500"
      />
    );
  }

  return (
    <div
      onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
      className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-1 flex items-center justify-center gap-2 group"
    >
      <span className="font-bold text-md">{value}</span>
      <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

// EditableBalanceCell (สำหรับยอดเงิน)
const EditableBalanceCell = ({ getValue, row, onUpdateBalance }: any) => {
  const initialValue = parseFloat(getValue() || "0");
  const [value, setValue] = useState(initialValue.toString());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { setValue(initialValue.toString()); }, [initialValue]);

  const handleSave = () => {
    setIsEditing(false);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue !== initialValue && onUpdateBalance) {
      onUpdateBalance(row.original.id, numericValue);
    } else {
      setValue(initialValue.toString());
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    else if (e.key === "Escape") { setIsEditing(false); setValue(initialValue.toString()); }
  };

  if (isEditing) {
    return (
      <div className="flex justify-end pr-4">
        <Input
          type="number"
          ref={(input) => input?.focus()} value={value}
          onChange={(e) => setValue(e.target.value)} onBlur={handleSave} onKeyDown={onKeyDown}
          // 👇 เปลี่ยน text-lg เป็น text-sm ที่นี่
          className="h-8 w-28 text-right font-bold text-sm border-green-500 text-green-700"
        />
      </div>
    );
  }

  return (
    <div
      onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
      className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 rounded p-1 flex items-center justify-end gap-2 group pr-4"
      title="คลิกเพื่อแก้ไขยอดเงินสุทธิโดยตรง"
    >
      {/* 👇 เปลี่ยน text-lg เป็น text-sm ที่นี่เช่นกัน */}
      <span className="font-bold text-green-600 dark:text-green-400 text-sm">
        ฿{initialValue.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <Pencil className="w-3 h-3 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const column_setting_account = (
  onUpdateStatus: (id: number, newStatus: string) => void,
  onUpdateName: (id: number, newName: string) => void,
  onUpdateBalance: (id: number, newBalance: number) => void,
  onOpenTransfer: (account: any) => void,
  onOpenAddMoney: (account: any) => void,    // 🔥 เพิ่ม Handler รับเงินเข้า
  onOpenDeductMoney: (account: any) => void  // 🔥 เพิ่ม Handler จ่ายเงินออก
): ColumnDef<any>[] => [
  {
    id: "id",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        #<ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-left font-medium ml-4">{row.index + 1}</div>,
  },
  {
    accessorKey: "accountName",
    header: ({ column }) => (
      <div className="text-center">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          ชื่อบัญชี<ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: (props) => <EditableCell {...props} onUpdate={onUpdateName} />,
  },
  {
    accessorKey: "balance",
    header: () => <div className="text-right font-bold text-green-600 dark:text-green-400 pr-4">ยอดเงินคงเหลือ</div>,
    cell: (props) => <EditableBalanceCell {...props} onUpdateBalance={onUpdateBalance} />,
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">สถานะ</div>,
    cell: ({ row }) => {
      const currentStatus = row.getValue("status") as string;
      const accountId = row.original.id;

      return (
        <div className="flex justify-center items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${currentStatus === "ACTIVE" ? "bg-green-500" : "bg-gray-300"}`} />
          <select
            className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 focus:outline-none"
            value={currentStatus || "INACTIVE"}
            onChange={(e) => { if (onUpdateStatus) onUpdateStatus(accountId, e.target.value); }}
          >
            <option value="ACTIVE">ใช้งาน</option>
            <option value="INACTIVE">ไม่ใช้งาน</option>
          </select>
        </div>
      );
    },
  },
{
    id: "actions",
    header: () => <div className="text-center">จัดการเงิน</div>,
    cell: ({ row }) => {
      const account = row.original;
      return (
        <div className="flex justify-center gap-1.5">
          {/* 🔥 ปุ่มเพิ่มเงิน (เหลือแค่ไอคอน) */}
          <Button
            variant="outline" 
            size="icon" 
            onClick={() => onOpenAddMoney(account)}
            className="h-8 w-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
            title="เพิ่มเงินเข้าบัญชี"
          >
            <PlusCircle className="w-4 h-4" />
          </Button>

          {/* 🔥 ปุ่มลดเงิน (เหลือแค่ไอคอน) */}
          <Button
            variant="outline" 
            size="icon" 
            onClick={() => onOpenDeductMoney(account)}
            className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
            title="ลดเงินจากบัญชี"
          >
            <MinusCircle className="w-4 h-4" />
          </Button>

          {/* ปุ่มโอนเงิน (เหลือแค่ไอคอน) */}
          <Button
            variant="outline" 
            size="icon" 
            onClick={() => onOpenTransfer(account)}
            className="h-8 w-8 border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/30"
            title="โอนเงินระหว่างบัญชี"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </Button>
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
      const formatted = new Date(dateVal as string | Date).toLocaleDateString("th-TH", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
      return <div className="text-center text-sm text-gray-500">{formatted}</div>;
    },
  },
];

export default column_setting_account;