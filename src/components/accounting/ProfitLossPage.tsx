"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { Search, RefreshCw, ChevronDown, CheckSquare, Square, TrendingUp, TrendingDown, Sigma, Printer, Download, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProfitLossTransactions } from "@/lib/actions/actionProfitLoss";
import { Data_table_setting_txlog } from "../settings/tables/data-table-setting-txlog";
import column_setting_txlog from "../settings/tables/column_setting_txlog";

export default function ProfitLossPage({
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
  const colTxLogs = column_setting_txlog(true);

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
      group: "ยอดเงินเข้า (รายรับ)", items: [
        { id: "SALES", name: "ยอดขาย (SALES)" },
        { id: "INCOME", name: "รายรับอื่นๆ (INCOME)" },
        { id: "AR_PAYMENT", name: "รับชำระหนี้ (AR_PAYMENT)" },
      ]
    },
    {
      group: "ยอดเงินออก (รายจ่าย)", items: [
        { id: "EXPENSE", name: "ค่าใช้จ่าย (EXPENSE)" },
      ]
    },
  ];

  const toggleTypeSelection = (id: string) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await getProfitLossTransactions({
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

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;

    txLogs.forEach((log: any) => {
      const amt = Math.abs(Number(log.amount) || 0);

      if (["SALES", "INCOME", "AR_PAYMENT"].includes(log.type)) {
        income += amt;
      }
      else if (["EXPENSE"].includes(log.type)) {
        expense += amt;
      }
    });

    return { income, expense, net: income - expense };
  }, [txLogs]);

  const sortedTxLogs = useMemo(() => {
    if (!txLogs) return [];

    const allowedTypes = ["SALES", "INCOME", "AR_PAYMENT", "EXPENSE"];
    const filtered = txLogs.filter((log: any) => allowedTypes.includes(log.type));

    return [...filtered].sort((a: any, b: any) => {
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [txLogs]);

  const getActualDateStr = (log: any) => {
    const targetDate = log.date ? new Date(log.date) : new Date(log.createdAt);
    return targetDate.toLocaleDateString("th-TH");
  };

  let tableSubtitle = "ตรวจสอบรายละเอียดรายรับ-รายจ่าย และผลกำไรขาดทุนแยกตามรายการธุรกรรม";
  if (startDate && endDate) {
    tableSubtitle = `รายการกำไร - ขาดทุน ตั้งแต่วันที่ ${new Date(startDate).toLocaleDateString("th-TH")} ถึง ${new Date(endDate).toLocaleDateString("th-TH")}`;
  } else if (startDate) {
    tableSubtitle = `รายการกำไร - ขาดทุน ตั้งแต่วันที่ ${new Date(startDate).toLocaleDateString("th-TH")} เป็นต้นไป`;
  } else if (endDate) {
    tableSubtitle = `รายการกำไร - ขาดทุน ถึงวันที่ ${new Date(endDate).toLocaleDateString("th-TH")}`;
  }

  const handleExportCSV = () => {
    if (sortedTxLogs.length === 0) {
      toast.warning("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }
    const headers = ["วันที่เกิดรายการ", "วันที่บันทึกลงระบบ", "ชื่อรายการ", "ประเภท", "จำนวนเงิน", "หมายเหตุ"];
    const csvData = sortedTxLogs.map((log: any) => {
      const actualDate = getActualDateStr(log);
      const systemDate = new Date(log.createdAt).toLocaleString("th-TH");
      const title = log.title || "-";
      const type = log.type || "-";
      const amount = log.amount || 0;
      const note = log.note || "-";

      return [
        `"${actualDate}"`,
        `"${systemDate}"`,
        `"${title}"`,
        `"${type}"`,
        `"${amount}"`,
        `"${note}"`
      ].join(",");
    });

    const csvString = [headers.join(","), ...csvData].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvString], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `สรุปรายรับรายจ่าย_${startDate}_ถึง_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("ดาวน์โหลดไฟล์ CSV สำเร็จ");
  };

  const handleExportPDF = () => {
    if (sortedTxLogs.length === 0) {
      toast.warning("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("กรุณาอนุญาตให้ Pop-up ทำงานเพื่อพิมพ์ PDF");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>สรุปรายรับรายจ่าย_${startDate}_ถึง_${endDate}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
            body { font-family: 'Sarabun', sans-serif; color: #18181b; margin: 0; padding: 0; background-color: #f4f4f5; }
            .action-bar { background: #18181b; padding: 15px 20px; display: flex; justify-content: flex-end; gap: 10px; position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .btn { padding: 8px 16px; border-radius: 6px; border: none; font-family: 'Sarabun', sans-serif; font-weight: 600; cursor: pointer; font-size: 14px; transition: background-color 0.2s; }
            .btn-primary { background: #10b981; color: white; }
            .btn-secondary { background: #3f3f46; color: white; }
            .page-container { background: white; max-width: 210mm; margin: 30px auto; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 4px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #e4e4e7; padding-bottom: 15px; }
            .header h2 { margin: 0 0 5px 0; font-size: 24px; color: #18181b; }
            .header p { margin: 0; font-size: 14px; color: #52525b; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            th, td { border: 1px solid #d4d4d8; padding: 10px 8px; text-align: left; }
            th { background-color: #f4f4f5; font-weight: bold; color: #18181b; }
            .text-right { text-align: right; }
            .summary-box { display: flex; justify-content: flex-end; gap: 20px; margin-top: 20px; font-size: 14px; }
            .summary-item { background-color: #f4f4f5; padding: 10px 15px; border-radius: 6px; border: 1px solid #d4d4d8; font-weight: bold; }
            .text-green { color: #16a34a; }
            .text-red { color: #dc2626; }
            .text-blue { color: #4f46e5; }
            @media print {
              @page { size: A4; margin: 15mm; }
              body { background-color: white; }
              .page-container { margin: 0; padding: 0; box-shadow: none; max-width: 100%; }
              .action-bar { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="action-bar no-print">
            <button class="btn btn-secondary" onclick="window.close()">ยกเลิก / ปิดหน้าต่าง</button>
            <button class="btn btn-primary" onclick="window.print()">🖨️ สั่งพิมพ์ / บันทึกเป็น PDF</button>
          </div>
          <div class="page-container">
            <div class="header">
              <h2>รายงานสรุปรายรับ-รายจ่าย (Profit & Loss)</h2>
              <p><strong>รอบวันที่:</strong> ${new Date(startDate).toLocaleDateString("th-TH")} ถึง ${new Date(endDate).toLocaleDateString("th-TH")}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>วันที่จ่ายจริง</th>
                  <th>ชื่อรายการ</th>
                  <th>ประเภท</th>
                  <th class="text-right">จำนวนเงิน</th>
                  <th>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                ${sortedTxLogs.map((log: any) => `
                  <tr>
                    <td>${getActualDateStr(log)}<br/><span style="font-size:10px; color:#a1a1aa;">(บันทึก: ${new Date(log.createdAt).toLocaleDateString("th-TH")})</span></td>
                    <td>${log.title || "-"}</td>
                    <td>${log.type || "-"}</td>
                    <td class="text-right ${["EXPENSE", "TRANSFER_OUT", "ADJUSTMENT_DOWN"].includes(log.type) ? "text-red" : "text-green"}">
                      ${Number(log.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </td>
                    <td>${log.note || "-"}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="summary-box">
              <div class="summary-item">รวมรายรับ: <span class="text-green">${summary.income.toLocaleString("th-TH", { minimumFractionDigits: 2 })} </span></div>
              <div class="summary-item">รวมรายจ่าย: <span class="text-red">${summary.expense.toLocaleString("th-TH", { minimumFractionDigits: 2 })} </span></div>
              <div class="summary-item">กำไร/ขาดทุนสุทธิ: <span class="${summary.net >= 0 ? 'text-blue' : 'text-red'}">${summary.net >= 0 ? "" : "-"}${Math.abs(summary.net).toLocaleString("th-TH", { minimumFractionDigits: 2 })} </span></div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm relative z-10">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
            <LineChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">สรุปรายรับ-รายจ่าย (ตามวันที่เกิดรายการจริง)</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">ดูผลประกอบการ กำไร-ขาดทุน อิงตามวันที่จ่ายจริงบนบิลค่าน้ำ ค่าไฟ หรือเอกสารอื่นๆ</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="p-6 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">เลือกบัญชี</label>
              <select
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:border-zinc-800 cursor-pointer"
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
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">ตั้งแต่วันที่ (จ่ายจริง)</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                disabled={loading}
                className="h-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
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
                className="h-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                <Search className="w-4 h-4 mr-2" /> ค้นหา
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} disabled={loading} className="h-10 px-3 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800" title="ล้างค่าทั้งหมด">
                <RefreshCw className="w-4 h-4 text-zinc-500" />
              </Button>
            </div>
          </div>
        </form>
      </div>

      {sortedTxLogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">รวมรายรับ</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {summary.income.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">รวมรายจ่าย</p>
              <p className="text-2xl font-black text-rose-700 dark:text-rose-300">
                {summary.expense.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">กำไร / ขาดทุนสุทธิ</p>
              <p className={`text-2xl font-black ${summary.net >= 0 ? "text-indigo-700 dark:text-indigo-300" : "text-rose-600 dark:text-rose-400"}`}>
                {summary.net >= 0 ? "" : "-"}{Math.abs(summary.net).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
              <Sigma className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      )}

      <div className="w-full rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div>
            <h3 className="font-bold text-zinc-800 dark:text-zinc-100">รายการธุรกิจ</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">เรียงลำดับตามวันที่เกิดรายการจริงก่อน</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleExportCSV} disabled={sortedTxLogs.length === 0} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm h-9 px-4 rounded-lg flex items-center gap-2 transition-all">
              <Download className="w-4 h-4" /> ส่งออก CSV
            </Button>
            <Button onClick={handleExportPDF} disabled={sortedTxLogs.length === 0} className="bg-zinc-800 hover:bg-zinc-700 text-white shadow-sm h-9 px-4 rounded-lg flex items-center gap-2 transition-all">
              <Printer className="w-4 h-4" /> พิมพ์รายงาน / PDF
            </Button>
          </div>
        </div>

        <div className="p-4 flex-1">
          <Data_table_setting_txlog
            columns={colTxLogs}
            data={sortedTxLogs}
            title="ตารางแสดงรายการกำไร - ขาดทุน"
            subtitle={tableSubtitle}
          />
        </div>
      </div>
    </div>
  );
}