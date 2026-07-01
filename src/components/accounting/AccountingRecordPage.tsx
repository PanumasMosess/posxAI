"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUser } from "@/components/providers/UserContext";

import { recordTransaction } from "@/lib/actions/actionAccountingRecord";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText, Save, ArrowDownCircle, ArrowUpCircle,
  PlusCircle, ChevronsUpDown, Check, Calendar, RotateCcw,
  Printer, Download, Wallet
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

  // State สำหรับ Combobox (หมวดหมู่)
  const [categoryInput, setCategoryInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State วันที่ทำรายการ
  const [txDate, setTxDate] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // State สำหรับกรองวันที่
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const colTxLogs = column_setting_txlog(true);

  useEffect(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);
    setTxDate(localISOTime);
  }, []);

  const filteredCategories = categories.filter((c: any) =>
    c.type === recordType &&
    c.name.toLowerCase().includes(categoryInput.toLowerCase())
  );

  const isExactMatch = categories.some((c: any) =>
    c.type === recordType &&
    c.name.toLowerCase() === categoryInput.trim().toLowerCase()
  );

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
    if (!txDate) return toast.error("กรุณาเลือกวันที่ทำรายการ");
    if (!selectedAccountId) return toast.error("กรุณาเลือกบัญชี");
    if (!categoryInput.trim()) return toast.error("กรุณาระบุหมวดหมู่/รายการ");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return toast.error("กรุณาระบุจำนวนเงินที่มากกว่า 0");

    const matchedCategory = categories.find((c: any) =>
      c.type === recordType &&
      c.name.trim().toLowerCase() === categoryInput.trim().toLowerCase()
    );

    setLoading(true);
    const res = await recordTransaction({
      accountId: parseInt(selectedAccountId),
      categoryId: matchedCategory ? matchedCategory.id : undefined,
      categoryName: categoryInput.trim(),
      date: txDate,
      amount: numAmount,
      type: recordType,
      note: note || "-",
      userId: Number(employeeId || userId),
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

  const formatCurrency = (val: number) => new Intl.NumberFormat('th-TH').format(val);
  const filteredTxLogs = useMemo(() => {
    if (!txLogs) return [];
    
    const filtered = txLogs.filter((log: any) => {
      const finalDate = log.date || log.createdAt;
      const logDateStr = finalDate ? new Date(finalDate).toISOString().slice(0, 10) : "";

      let matchesDate = true;
      if (startDate && endDate) {
        matchesDate = logDateStr >= startDate && logDateStr <= endDate;
      } else if (startDate) {
        matchesDate = logDateStr >= startDate;
      } else if (endDate) {
        matchesDate = logDateStr <= endDate;
      }

      return matchesDate;
    });

    return filtered.sort((a: any, b: any) => {
      const dateA = a.date ? new Date(a.date).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.date ? new Date(b.date).getTime() : new Date(b.createdAt).getTime();

      if (dateB !== dateA) {
        return dateB - dateA;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
  }, [txLogs, startDate, endDate]);

  const summaryTotals = useMemo(() => {
    return filteredTxLogs.reduce((acc: any, tx: any) => {
      if (tx.type === "INCOME" || tx.type === "SALES" || tx.type === "AR_PAYMENT") {
        acc.income += Number(tx.amount);
      } else if (tx.type === "EXPENSE") {
        acc.expense += Math.abs(Number(tx.amount));
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTxLogs]);

  let tableSubtitle = "ประวัติรายการทั้งหมด";
  if (startDate && endDate) {
    tableSubtitle = `ตั้งแต่วันที่ ${new Date(startDate).toLocaleDateString("th-TH")} ถึง ${new Date(endDate).toLocaleDateString("th-TH")}`;
  } else if (startDate) {
    tableSubtitle = `ตั้งแต่วันที่ ${new Date(startDate).toLocaleDateString("th-TH")} เป็นต้นไป`;
  } else if (endDate) {
    tableSubtitle = `ถึงวันที่ ${new Date(endDate).toLocaleDateString("th-TH")}`;
  }

  const handleExportCSV = () => {
    if (filteredTxLogs.length === 0) return toast.error("ไม่มีข้อมูลสำหรับ Export");
    
    const headers = ["วันที่", "ประเภท", "หมวดหมู่/รายการ", "บัญชี", "จำนวนเงิน", "หมายเหตุ"];
    const csvData = filteredTxLogs.map((tx: any) => [
      new Date(tx.date || tx.createdAt).toLocaleDateString('th-TH'),
      tx.type === "EXPENSE" ? "รายจ่าย" : "รายรับ",
      `"${tx.title || "-"}"`,
      `"${tx.account?.accountName || tx.accountName || "-"}"`,
      Math.abs(tx.amount),
      `"${tx.note || "-"}"`
    ]);

    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); 
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `รายงานบัญชี_${new Date().toLocaleDateString('th-TH')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("ดาวน์โหลดไฟล์ CSV สำเร็จ");
  };

  const handlePrint = () => {
    if (filteredTxLogs.length === 0) return toast.error("ไม่มีข้อมูลสำหรับพิมพ์");

    const printWindow = window.open('', '_blank');
    if (!printWindow) return toast.error("กรุณาอนุญาต Pop-up เพื่อพิมพ์รายงาน");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>รายงานรายรับ-รายจ่าย</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
            
            body { 
              font-family: 'Sarabun', sans-serif; 
              color: #18181b; 
              margin: 0; 
              padding: 0;
              background-color: #f4f4f5; 
            }
            
            .action-bar {
              background: #18181b;
              padding: 15px 20px;
              display: flex;
              justify-content: flex-end;
              gap: 10px;
              position: sticky;
              top: 0;
              z-index: 100;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .btn {
              padding: 8px 16px;
              border-radius: 6px;
              border: none;
              font-family: 'Sarabun', sans-serif;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
              transition: background-color 0.2s;
            }
            .btn-primary { background: #4f46e5; color: white; }
            .btn-primary:hover { background: #4338ca; }
            .btn-secondary { background: #3f3f46; color: white; }
            .btn-secondary:hover { background: #27272a; }

            .page-container {
              background: white;
              max-width: 210mm;
              margin: 30px auto;
              padding: 40px;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
              border-radius: 4px;
            }

            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #e4e4e7; padding-bottom: 15px; }
            .header h2 { margin: 0 0 5px 0; font-size: 24px; color: #18181b; }
            .header p { margin: 0; font-size: 14px; color: #52525b; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { border: 1px solid #d4d4d8; padding: 10px 8px; text-align: left; }
            th { background-color: #f4f4f5; font-weight: bold; color: #18181b; }
            .text-right { text-align: right; }
            .text-green { color: #16a34a; }
            .text-red { color: #dc2626; }
            
            .summary-box { display: flex; justify-content: space-around; margin: 20px 0; padding: 15px; background: #f4f4f5; border-radius: 8px; font-size: 14px; font-weight: bold; }
            
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
              <h2>รายงานประวัติรายรับ-รายจ่าย</h2>
              <p>${tableSubtitle}</p>
            </div>
            
            <div class="summary-box">
              <span class="text-green">รายรับรวม: ${formatCurrency(summaryTotals.income)}</span>
              <span class="text-red">รายจ่ายรวม: ${formatCurrency(summaryTotals.expense)}</span>
              <span>ยอดสุทธิ: ${formatCurrency(summaryTotals.income - summaryTotals.expense)}</span>
            </div>

            <table>
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>รายการ</th>
                  <th>บัญชี</th>
                  <th class="text-right">จำนวนเงิน</th>
                  <th>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTxLogs.map((tx: any) => `
                  <tr>
                    <td>${new Date(tx.date || tx.createdAt).toLocaleDateString('th-TH')}</td>
                    <td>${tx.title || "-"}</td>
                    <td>${tx.account?.accountName || tx.accountName || "-"}</td>
                    <td class="text-right ${tx.type === "EXPENSE" ? "text-red" : "text-green"}">
                      ${tx.type === "EXPENSE" ? "-" : "+"}${formatCurrency(Math.abs(tx.amount))}
                    </td>
                    <td>${tx.note || "-"}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <p style="text-align: right; margin-top: 20px; font-weight: bold; font-size: 13px;">
              รวมจำนวนทั้งสิ้น ${filteredTxLogs.length} รายการ
            </p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-4 items-start">

      {/* ฟอร์มบันทึกรายการ (ฝั่งซ้าย) */}
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">วันที่ทำรายการ</label>
            <Input
              type="date"
              required
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              disabled={loading}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">กระเป๋าเงิน (บัญชี)</label>
            <select
              required
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:border-zinc-800 cursor-pointer"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              disabled={loading}
            >
              <option value="" disabled>-- เลือกบัญชี --</option>
              {accounts.map((acc: any) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountName} (คงเหลือ: {formatCurrency(Number(acc.balance))})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">หมวดหมู่ / รายการ</label>
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
                          className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none transition-colors ${isSelected
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
                        {`เพิ่มรายการ "${categoryInput}"`}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

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

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">หมายเหตุ / รายละเอียด (ถ้ามี)</label>
            <Input
              placeholder="คำอธิบายเพิ่มเติม..."
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

      {/* ฝั่งขวา: ตารางประวัติ & สรุปยอด */}
      <div className="flex-1 w-full flex flex-col gap-4">
        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm overflow-hidden p-5 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">สรุปรายรับ-รายจ่าย</h3>
              <p className="text-xs text-zinc-500">{tableSubtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 shadow-sm h-10">
                <div className="flex items-center px-2">
                  <Calendar className="h-4 w-4 text-zinc-400 mr-2" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 w-[120px] border-0 bg-transparent p-0 text-sm focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
                <div className="flex items-center px-2">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-8 w-[120px] border-0 bg-transparent p-0 text-sm focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setStartDate(""); setEndDate(""); }}
                title="ล้างวันที่"
                className="h-10 w-10 p-0 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg shrink-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>
              <Button 
                onClick={handleExportCSV} 
                disabled={filteredTxLogs.length === 0} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm h-10 px-4 rounded-lg flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" /> ส่งออก CSV
              </Button>
              <Button 
                onClick={handlePrint} 
                disabled={filteredTxLogs.length === 0} 
                className="bg-zinc-800 hover:bg-zinc-700 text-white shadow-sm h-10 px-4 rounded-lg flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" /> พิมพ์ / PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-500 mb-1">รายรับรวมที่ค้นหา</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(summaryTotals.income)}</p>
                </div>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <ArrowDownCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/40 dark:to-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-800/30">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-red-600 dark:text-red-500 mb-1">รายจ่ายรวมที่ค้นหา</p>
                  <p className="text-2xl font-black text-red-700 dark:text-red-400">{formatCurrency(summaryTotals.expense)}</p>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-600 dark:text-red-400">
                  <ArrowUpCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 mb-1">ยอดสุทธิ (Net)</p>
                  <p className={`text-2xl font-black ${summaryTotals.income - summaryTotals.expense >= 0 ? "text-indigo-700 dark:text-indigo-400" : "text-red-600 dark:text-red-400"}`}>
                    {formatCurrency(summaryTotals.income - summaryTotals.expense)}
                  </p>
                </div>
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col mt-2">
          <div className="p-5 flex-1 min-h-[400px]">
            <Data_table_setting_txlog
              columns={colTxLogs}
              data={filteredTxLogs}
              title="รายการประวัติการทำธุรกรรม"
              subtitle={`พบข้อมูลทั้งหมด ${filteredTxLogs.length} รายการ ตามเงื่อนไขที่คุณเลือก`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}