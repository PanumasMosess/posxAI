"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { History, Search, RefreshCw, ChevronDown, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getFilteredTransactions } from "@/lib/actions/actionAccountingHistory";
import { Data_table_setting_txlog } from "../settings/tables/data-table-setting-txlog";
import column_setting_txlog from "../settings/tables/column_setting_txlog";

export default function AccountingHistoryPage({
  accounts,
  defaultTxLogs,
  organizationId,
  initialStartDate,
  initialEndDate
}: any) {

  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [txLogs, setTxLogs] = useState(defaultTxLogs);
  const [loading, setLoading] = useState(false);
  const colTxLogs = column_setting_txlog();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const transactionTypeGroups = [
    {
      group: "ยอดเงินเข้า", items: [
        { id: "SALES", name: "ยอดขาย (SALES)" },
        { id: "INCOME", name: "รายรับ (INCOME)" },
        { id: "AR_PAYMENT", name: "รับชำระหนี้ (AR_PAYMENT)" },
      ]
    },
    {
      group: "ยอดเงินออก", items: [
        { id: "EXPENSE", name: "รายจ่าย (EXPENSE)" },
      ]
    },
    {
      group: "การโอนเงิน", items: [
        { id: "TRANSFER_IN", name: "รับโอน (TRANSFER_IN)" },
        { id: "TRANSFER_OUT", name: "โอนออก (TRANSFER_OUT)" },
      ]
    },
    {
      group: "การปรับแก้ระบบ", items: [
        { id: "ADJUSTMENT_UP", name: "ปรับยอดเพิ่ม (ADJUSTMENT_UP)" },
        { id: "ADJUSTMENT_DOWN", name: "ปรับยอดลด (ADJUSTMENT_DOWN)" },
        { id: "OVERRIDE_BALANCE", name: "แก้ไขยอดสุทธิ (OVERRIDE_BALANCE)" },
      ]
    }
  ];

  const toggleTypeSelection = (id: string) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await getFilteredTransactions({
      accountId: selectedAccountId,
      types: selectedTypes,
      startDate: startDate,
      endDate: endDate,
      organizationId,
    });

    if (res.success) {
      setTxLogs(res.data);
      if (res.data.length === 0) {
        toast.info("ไม่พบรายการในช่วงเวลาที่เลือก");
      }
    } else {
      toast.error(res.message || "ไม่สามารถดึงข้อมูลได้");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setSelectedAccountId("all");
    setSelectedTypes([]);
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setTxLogs(defaultTxLogs);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm relative z-10">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
            <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">รายการเดินบัญชี (Statement)</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">ตรวจสอบประวัติธุรกรรมและยอดเงินไหลเข้า-ออกโดยละเอียด</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="p-6 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">เลือกบัญชี</label>
              <select
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:border-zinc-800"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                disabled={loading}
              >
                <option value="all">ทั้งหมดทุกบัญชี</option>
                {accounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>{acc.accountName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2" ref={typeDropdownRef}>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">ประเภทรายการ</label>
              <div className="relative">
                <div
                  className={`flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm cursor-pointer select-none transition-colors dark:bg-zinc-950 ${isTypeDropdownOpen ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-zinc-200 dark:border-zinc-800"}`}
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                >
                  <span className={`truncate ${selectedTypes.length === 0 ? "text-zinc-500" : "text-zinc-900 dark:text-zinc-100 font-medium"}`}>
                    {selectedTypes.length === 0 ? "ทุกประเภทรายการ" : `เลือกไว้ ${selectedTypes.length} รายการ`}
                  </span>
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                </div>
                {isTypeDropdownOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 z-[100] w-full min-w-[260px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-xl max-h-[300px] overflow-y-auto">
                    <div className="sticky top-0 z-10 flex items-center justify-between p-2 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs font-semibold text-zinc-500 ml-1">เลือกประเภทที่ต้องการค้นหา</span>
                      {selectedTypes.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedTypes([]); }}
                          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 rounded"
                        >
                          ล้างทั้งหมด
                        </button>
                      )}
                    </div>
                    <div className="p-1.5 pb-2">
                      {transactionTypeGroups.map((group, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                          <div className="px-2 py-1.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900/50 rounded-sm mb-1">
                            {group.group}
                          </div>
                          <div className="space-y-0.5">
                            {group.items.map(item => {
                              const isSelected = selectedTypes.includes(item.id);
                              return (
                                <div
                                  key={item.id}
                                  className={`flex items-center gap-3 px-2 py-2 text-sm cursor-pointer rounded-sm transition-colors ${isSelected ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                                  onClick={(e) => { e.stopPropagation(); toggleTypeSelection(item.id); }}
                                >
                                  {isSelected ? (
                                    <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                                  ) : (
                                    <Square className="h-4 w-4 text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
                                  )}
                                  <span className={isSelected ? "text-indigo-900 dark:text-indigo-300 font-medium" : "text-zinc-700 dark:text-zinc-300"}>
                                    {item.name}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">ตั้งแต่วันที่</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                disabled={loading}
                className="h-10 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">ถึงวันที่</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                disabled={loading}
                className="h-10 cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                <Search className="w-4 h-4 mr-2" /> ค้นหา
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} disabled={loading} className="h-10 px-3 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <RefreshCw className="w-4 h-4 text-zinc-500" />
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="w-full rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm overflow-hidden">
        <div className="p-4">
          <Data_table_setting_txlog
            columns={colTxLogs}
            data={txLogs}
            title="รายการเดินบัญชี"
            subtitle={`พบข้อมูลทั้งหมด ${txLogs.length} รายการ ตามเงื่อนไขที่เลือก`}
          />
        </div>
      </div>

    </div>
  );
}