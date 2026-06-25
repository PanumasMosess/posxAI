"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, ArrowRightLeft, Plus, Minus, CheckCircle2, Store } from "lucide-react";
import { useState, useEffect } from "react";

// EditableCell (สำหรับชื่อบัญชี)
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
        className="h-9 text-center font-bold text-sm bg-zinc-900 border-[#5B4EFA] focus-visible:ring-[#5B4EFA] text-white rounded-lg"
      />
    );
  }

  return (
    <div
      onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
      className="cursor-pointer hover:bg-white/[0.05] rounded-lg p-2 flex items-center justify-center gap-2 group transition-all"
    >
      <span className="font-bold text-[14px] text-zinc-200 group-hover:text-white">{value}</span>
      <Pencil className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:text-indigo-400 transition-all" />
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
      <div className="flex justify-end pr-2">
        <Input
          type="number"
          ref={(input) => input?.focus()} value={value}
          onChange={(e) => setValue(e.target.value)} onBlur={handleSave} onKeyDown={onKeyDown}
          className="h-9 w-32 text-right font-black text-[15px] bg-emerald-500/10 border-emerald-500 text-emerald-400 focus-visible:ring-emerald-500 rounded-lg"
        />
      </div>
    );
  }

  return (
    <div
      onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
      className="cursor-pointer hover:bg-emerald-500/10 rounded-lg p-2 flex items-center justify-end gap-2 group transition-all pr-4"
      title="คลิกเพื่อแก้ไขยอดเงินสุทธิ"
    >
      <span className="font-black text-emerald-400 text-[15px] group-hover:text-emerald-300">
        ฿{initialValue.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <Pencil className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 group-hover:text-emerald-400 transition-all" />
    </div>
  );
};

const column_setting_account = (
  onUpdateStatus: (id: number, newStatus: string) => void,
  onUpdateName: (id: number, newName: string) => void,
  onUpdateBalance: (id: number, newBalance: number) => void,
  onOpenTransfer: (account: any) => void,
  onOpenAddMoney: (account: any) => void,
  onOpenDeductMoney: (account: any) => void,
  onSetAccPosPayment: (id: number) => void
): ColumnDef<any>[] => [
  {
    id: "id",
    header: ({ column }) => (
      <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        #<ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-left font-medium ml-4 text-zinc-500">{row.index + 1}</div>,
  },
  {
    accessorKey: "accountName",
    header: ({ column }) => (
      <div className="text-center">
        <Button variant="ghost" className="text-zinc-400 hover:text-white font-semibold tracking-wide" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          ชื่อบัญชี<ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      </div>
    ),
    cell: (props) => <EditableCell {...props} onUpdate={onUpdateName} />,
  },
  
{
    accessorKey: "accPosPayment",
    // 💡 เปลี่ยน Header เป็นคำที่สื่อถึงการ "รับเงินเข้า"
    header: () => (
      <div className="text-center font-bold text-[#5B4EFA] text-[11px] uppercase tracking-wider">
        บัญชีรับเงินหน้าร้าน
      </div>
    ),
    cell: ({ row }) => {
      const isPos = row.original.accPosPayment as boolean;
      const accountId = row.original.id;
      const accountStatus = row.original.status;
      const isActiveAccount = accountStatus === "ACTIVE";

      return (
        <div className="flex justify-center items-center gap-3">
          <button
            // 💡 เพิ่ม Tooltip อธิบายเมื่อเอาเมาส์ไปชี้ที่ปุ่ม
            title={isPos ? "ยอดขายจากหน้าร้านจะเข้าบัญชีนี้อัตโนมัติ" : "คลิกเพื่อตั้งให้ยอดขายหน้าร้านวิ่งเข้าบัญชีนี้"}
            disabled={!isActiveAccount || isPos}
            onClick={() => { if (onSetAccPosPayment && isActiveAccount) onSetAccPosPayment(accountId); }}
            className={`
              relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none
              ${!isActiveAccount 
                ? "cursor-not-allowed bg-zinc-800/50" 
                : isPos 
                ? "bg-[#5B4EFA] shadow-[0_0_10px_rgba(91,78,250,0.4)]" 
                : "bg-zinc-700 hover:bg-zinc-600"}
            `}
          >
            {/* ลูกกลิ้งด้านใน Switch */}
            <span
              className={`
                pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-300 ease-in-out
                ${isPos ? "translate-x-4 bg-white" : "translate-x-0"}
                ${!isActiveAccount ? "bg-zinc-600" : !isPos ? "bg-zinc-300" : ""}
              `}
            />
          </button>
        </div>
      );
    },
  },
  {
    accessorKey: "balance",
    header: () => <div className="text-right font-bold text-emerald-500/80 text-[11px] uppercase tracking-wider pr-4">ยอดเงินคงเหลือ</div>,
    cell: (props) => <EditableBalanceCell {...props} onUpdateBalance={onUpdateBalance} />,
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center font-bold text-zinc-400 text-[11px] uppercase tracking-wider">สถานะ</div>,
    cell: ({ row }) => {
      const currentStatus = row.getValue("status") as string;
      const accountId = row.original.id;

      return (
        <div className="flex justify-center items-center gap-2">
          <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${currentStatus === "ACTIVE" ? "bg-emerald-400 text-emerald-400" : "bg-zinc-600 text-zinc-600"}`} />
          <select
            className="border-none bg-[#18181b] hover:bg-[#27272a] text-zinc-300 rounded-lg px-2 py-1.5 text-[13px] font-medium focus:ring-1 focus:ring-zinc-600 transition-colors outline-none cursor-pointer"
            value={currentStatus || "INACTIVE"}
            onChange={(e) => { if (onUpdateStatus) onUpdateStatus(accountId, e.target.value); }}
          >
            <option value="ACTIVE">ใช้งาน</option>
            <option value="INACTIVE">ปิดใช้งาน</option>
          </select>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center font-bold text-zinc-400 text-[11px] uppercase tracking-wider">จัดการเงิน</div>,
    cell: ({ row }) => {
      const account = row.original;
      return (
        <div className="flex justify-center gap-2">
          {/* ปุ่มเพิ่มเงิน */}
          <button
            onClick={() => onOpenAddMoney(account)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
            title="เพิ่มเงินเข้าบัญชี"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* ปุ่มลดเงิน */}
          <button
            onClick={() => onOpenDeductMoney(account)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            title="ลดเงินจากบัญชี"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* ปุ่มโอนเงิน */}
          <button
            onClick={() => onOpenTransfer(account)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
            title="โอนเงินระหว่างบัญชี"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: () => <div className="text-center font-bold text-zinc-400 text-[11px] uppercase tracking-wider">อัปเดตล่าสุด</div>,
    cell: ({ row }) => {
      const dateVal = row.getValue("updatedAt");
      if (!dateVal) return <div className="text-center">-</div>;
      const formatted = new Date(dateVal as string | Date).toLocaleDateString("th-TH", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
      return <div className="text-center text-xs text-zinc-500">{formatted}</div>;
    },
  },
];

export default column_setting_account;