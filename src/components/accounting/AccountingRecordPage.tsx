"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUser } from "@/components/providers/UserContext";

// นำเข้า Action
import { recordTransaction } from "@/lib/actions/actionAccountingRecord";

// นำเข้า UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, Save, ArrowDownCircle, ArrowUpCircle, 
  PlusCircle, ChevronsUpDown, Check 
} from "lucide-react";

// เรียกใช้ตาราง
import { Data_table_setting_txlog } from "../settings/tables/data-table-setting-txlog";
import column_setting_txlog from "../settings/tables/column_setting_txlog";

export default function AccountingRecordPage({ accounts, categories, txLogs, userId, organizationId }: any) {
  const router = useRouter();
  const { employeeId } = useUser();

  // สถานะของฟอร์ม
  const [loading, setLoading] = useState(false);
  const [recordType, setRecordType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  
  // State สำหรับ Combobox
  const [categoryInput, setCategoryInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const colTxLogs = column_setting_txlog();

  // กรองหมวดหมู่ตามประเภทและคำค้นหา
  const filteredCategories = categories.filter((c: any) => 
    c.type === recordType && 
    c.name.toLowerCase().includes(categoryInput.toLowerCase())
  );

  const isExactMatch = categories.some((c: any) => 
    c.type === recordType && 
    c.name.toLowerCase() === categoryInput.trim().toLowerCase()
  );

  // ปิด Dropdown เมื่อคลิกที่อื่น
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) return toast.error("กรุณาเลือกบัญชี");
    if (!categoryInput.trim()) return toast.error("กรุณาระบุหมวดหมู่");
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return toast.error("กรุณาระบุจำนวนเงินที่มากกว่า 0");

    // 🔥 ค้นหาว่าชื่อหมวดหมู่ที่ระบุ ตรงกับที่มีอยู่แล้วในระบบหรือไม่
    const matchedCategory = categories.find((c: any) => 
      c.type === recordType && 
      c.name.trim().toLowerCase() === categoryInput.trim().toLowerCase()
    );

    setLoading(true);
    const res = await recordTransaction({
      accountId: parseInt(selectedAccountId),
      categoryId: matchedCategory ? matchedCategory.id : undefined, // 🔥 ส่ง ID ไปถ้าจับคู่เจอ
      categoryName: categoryInput.trim(), // ส่งชื่อไปเผื่อกรณีสร้างใหม่
      amount: numAmount,
      type: recordType,
      note: note || "-",
      userId: Number(employeeId),
      organizationId,
    });

    if (res.success) {
      toast.success(res.message);
      setAmount("");
      setNote("");
      setCategoryInput(""); 
      router.refresh();
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-4 items-start">
      
      {/* ฝั่งซ้าย: ฟอร์มบันทึกรายการ */}
      <div className="w-full xl:w-[400px] shrink-0 rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm overflow-visible sticky top-4">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">บันทึกรายรับ-รายจ่าย</h2>
            <p className="text-xs text-zinc-500">ลงข้อมูลการใช้จ่ายประจำวัน</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. เลือกประเภท */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <button
              type="button"
              onClick={() => { setRecordType("INCOME"); setCategoryInput(""); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${recordType === "INCOME" ? "bg-white dark:bg-zinc-900 shadow-sm text-emerald-600" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              <ArrowDownCircle className="w-4 h-4" /> รายรับ
            </button>
            <button
              type="button"
              onClick={() => { setRecordType("EXPENSE"); setCategoryInput(""); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${recordType === "EXPENSE" ? "bg-white dark:bg-zinc-900 shadow-sm text-red-600" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              <ArrowUpCircle className="w-4 h-4" /> รายจ่าย
            </button>
          </div>

          {/* 2. เลือกบัญชี */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">กระเป๋าเงิน (บัญชี)</label>
            <select
              required
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:border-zinc-800"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              disabled={loading}
            >
              <option value="" disabled>-- เลือกบัญชี --</option>
              {accounts.map((acc: any) => (
                <option key={acc.id} value={acc.id}>{acc.accountName}</option>
              ))}
            </select>
          </div>

          {/* 3. หมวดหมู่ (Professional Combobox) */}
          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">หมวดหมู่</label>
            <div className="relative">
              <Input
                required
                placeholder="เลือก หรือพิมพ์เพื่อค้นหา/เพิ่มใหม่..."
                value={categoryInput}
                onChange={(e) => {
                  setCategoryInput(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                disabled={loading}
                autoComplete="off"
                className={`pr-10 ${recordType === "INCOME" ? "focus-visible:ring-emerald-500" : "focus-visible:ring-red-500"}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10 text-zinc-400 hover:bg-transparent"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </div>
            
            {isDropdownOpen && (
              <div 
                className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg max-h-[220px] overflow-y-auto"
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="p-1">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat: any) => {
                      const isSelected = categoryInput.trim().toLowerCase() === cat.name.toLowerCase();
                      return (
                        <div
                          key={cat.id}
                          className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none transition-colors ${
                            isSelected 
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium" 
                              : "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                          }`}
                          onClick={() => {
                            setCategoryInput(cat.name);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {isSelected && (
                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                          {cat.name}
                        </div>
                      )
                    })
                  ) : (
                    categoryInput.trim() !== "" && (
                      <div className="py-6 text-center text-sm text-zinc-500">
                        ไม่พบหมวดหมู่ที่ค้นหา
                      </div>
                    )
                  )}

                  {categoryInput.trim() !== "" && !isExactMatch && (
                    <>
                      {filteredCategories.length > 0 && <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />}
                      <div 
                        className="flex items-center gap-2 w-full cursor-pointer rounded-sm py-2 px-3 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
                        onClick={() => {
                          setIsDropdownOpen(false);
                        }}
                      >
                        <PlusCircle className="h-4 w-4" />
                        {`เพิ่มหมวดหมู่ "${categoryInput}"`}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. จำนวนเงิน */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">จำนวนเงิน</label>
            <Input 
              type="number" 
              required 
              placeholder="0.00" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              disabled={loading}
              className={`text-lg font-bold ${recordType === "INCOME" ? "text-emerald-700 border-emerald-200 focus-visible:ring-emerald-500" : "text-red-700 border-red-200 focus-visible:ring-red-500"}`} 
            />
          </div>

          {/* 5. หมายเหตุ */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">หมายเหตุ / รายละเอียด</label>
            <Input 
              placeholder={recordType === "INCOME" ? "เช่น ทิป, รายได้พิเศษ" : "เช่น ค่าไฟเดือนนี้, ค่าของใช้"} 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              disabled={loading} 
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className={`w-full text-white ${recordType === "INCOME" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
          >
            {loading ? "กำลังบันทึก..." : (
              <><Save className="w-4 h-4 mr-2" /> บันทึก {recordType === "INCOME" ? "รายรับ" : "รายจ่าย"}</>
            )}
          </Button>
        </form>
      </div>

      {/* ฝั่งขวา: ตารางประวัติ */}
      <div className="flex-1 w-full rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-0 overflow-hidden">
        <div className="p-4">
          <Data_table_setting_txlog
            columns={colTxLogs}
            data={txLogs}
            title="รายการรายรับ-รายจ่ายล่าสุด"
            subtitle="ประวัติการบันทึกเงินเข้าและเงินออกประจำวัน"
          />
        </div>
      </div>

    </div>
  );
}