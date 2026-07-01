"use client";

import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { BarChart3, TrendingUp, TrendingDown, Wallet, Target, Search, CreditCard, Receipt, FileText, Printer, Percent, X, Calendar, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAccountingReportData } from "@/lib/actions/actionAccountingReport";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

export default function AccountingReportPage({ organizationId, initialStartDate, initialEndDate, initialData }: any) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(initialData);
  const [drillDownCategory, setDrillDownCategory] = useState<string | null>(null);
  const [drillDownType, setDrillDownType] = useState<"SALES" | "AR_PAYMENT" | "INCOME" | "EXPENSE">("EXPENSE");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await getAccountingReportData({ startDate, endDate, organizationId });
    if (res.success) {
      setReportData(res.data);
    } else {
      toast.error("ดึงข้อมูลรายงานล้มเหลว");
    }
    setLoading(false);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  const pAndLStructure = useMemo(() => {
    if (!reportData) return { incomeItems: [], cogs: 0, grossProfit: 0, opex: 0, opexItems: [] };
    const { summary, expenseCategoryData, incomeCategoryData, transactions } = reportData;
    const incomeItems = [];
    if (transactions && transactions.length > 0) {
      const salesSum = transactions.filter((t: any) => t.type === "SALES").reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      const arSum = transactions.filter((t: any) => t.type === "AR_PAYMENT").reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      const manualIncomeSum = transactions.filter((t: any) => t.type === "INCOME").reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      if (salesSum > 0) incomeItems.push({ name: "ยอดขายหน้าร้านอัตโนมัติ (SALES)", value: salesSum, type: "SALES" });
      if (arSum > 0) incomeItems.push({ name: "รายรับชำระหนี้สมาชิก (AR_PAYMENT)", value: arSum, type: "AR_PAYMENT" });
      if (manualIncomeSum > 0) incomeItems.push({ name: "รายรับอื่นๆ กรอกมือ (INCOME)", value: manualIncomeSum, type: "INCOME" });
    } else {
      const arPayment = summary.totalARPayment || 0;
      const salesIncome = incomeCategoryData?.find((i: any) => i.name.includes("SALES") || i.name.includes("ขาย"))?.value || (summary.totalIncome - arPayment);
      incomeItems.push({ name: "ยอดขายหน้าร้านอัตโนมัติ (SALES)", value: salesIncome, type: "SALES" });
      if (arPayment > 0) {
        incomeItems.push({ name: "รายรับชำระหนี้สมาชิก (AR_PAYMENT)", value: arPayment, type: "AR_PAYMENT" });
      }
    }

    const cogsItem = expenseCategoryData?.find((e: any) => e.name.includes("วัตถุดิบ") || e.name.includes("ต้นทุน"));
    const cogs = cogsItem ? cogsItem.value : 0;
    const grossProfit = summary.totalIncome - cogs;
    const opex = summary.totalExpense - cogs;
    const opexItems = expenseCategoryData?.filter((e: any) => !(e.name.includes("วัตถุดิบ") || e.name.includes("ต้นทุน"))) || [];
    return { incomeItems, cogs, grossProfit, opex, opexItems };
  }, [reportData]);

  const netMarginPercent = useMemo(() => {
    if (!reportData || reportData.summary.totalIncome === 0) return "0.00";
    return ((reportData.summary.netProfit / reportData.summary.totalIncome) * 100).toFixed(2);
  }, [reportData]);

  const currentDrillDownTransactions = useMemo(() => {
    if (!drillDownCategory || !reportData) return [];
    const { transactions, expenseCategoryData } = reportData;
    if (transactions && transactions.length > 0) {
      const filteredTxs = transactions.filter((tx: any) => {
        if (drillDownType === "SALES") return tx.type === "SALES";
        if (drillDownType === "AR_PAYMENT") return tx.type === "AR_PAYMENT";
        if (drillDownType === "INCOME") return tx.type === "INCOME";

        return tx.type === "EXPENSE" && (tx.categoryName === drillDownCategory || (tx.categoryName && tx.categoryName.includes(drillDownCategory)));
      });

      if (filteredTxs.length > 0) {
        return filteredTxs.map((tx: any) => ({
          id: tx.id || `TX-${Math.floor(Math.random() * 90000) + 10000}`,
          date: tx.date || tx.createdAt || startDate,
          title: tx.title || tx.note || tx.categoryName || drillDownCategory,
          account: tx.accountName || tx.account || "ไม่ระบุบัญชี",
          amount: Math.abs(tx.amount || 0),
          isSummary: false
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    }

    if (drillDownType === "EXPENSE") {
      const targetValue = expenseCategoryData?.find((e: any) => e.name === drillDownCategory)?.value || 0;
      return [{
        id: "SUMMARY",
        date: endDate,
        title: `สรุปยอดรวม [${drillDownCategory}]`,
        account: "รวมทุกบัญชี (รอเชื่อมข้อมูลรายวัน)",
        amount: targetValue,
        isSummary: true
      }];
    } else {
      const targetValue = pAndLStructure.incomeItems?.find((i: any) => i.type === drillDownType)?.value || 0;
      return [{
        id: "SUMMARY",
        date: endDate,
        title: `สรุปยอดรวม [${drillDownType}]`,
        account: "รวมทุกบัญชี (รอเชื่อมข้อมูลรายวัน)",
        amount: targetValue,
        isSummary: true
      }];
    }
  }, [drillDownCategory, drillDownType, reportData, startDate, endDate, pAndLStructure]);

  const handleExportPDF = () => {
    if (!reportData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("กรุณาอนุญาตให้ระบบเปิด Pop-up เพื่อดูตัวอย่าง PDF");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>รายงานงบกำไรขาดทุน_${startDate}_ถึง_${endDate}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
            body { font-family: 'Sarabun', sans-serif; color: #18181b; margin: 0; padding: 0; background-color: #f4f4f5; }
            .action-bar { background: #18181b; padding: 15px 20px; display: flex; justify-content: flex-end; gap: 10px; position: sticky; top: 0; z-index: 100; }
            .btn { padding: 8px 16px; border-radius: 6px; border: none; font-family: 'Sarabun', sans-serif; font-weight: 600; cursor: pointer; font-size: 14px; }
            .btn-primary { background: #4f46e5; color: white; }
            .btn-secondary { background: #3f3f46; color: white; }
            .page-container { background: white; max-width: 210mm; margin: 30px auto; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 4px; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #e4e4e7; padding-bottom: 15px; }
            .header h2 { margin: 0 0 5px 0; font-size: 22px; color: #18181b; }
            .header p { margin: 0; font-size: 13px; color: #52525b; }
            
            .pl-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
            .pl-table td { padding: 12px 10px; border-bottom: 1px solid #e4e4e7; }
            .pl-group { font-weight: bold; color: #18181b; background-color: #fafafa; }
            .pl-indent { padding-left: 30px !important; color: #52525b; font-size: 13px; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            
            .bg-total { background-color: #4f46e5 !important; color: white !important; font-weight: bold; font-size: 15px; }
            .text-green { color: #16a34a; }
            .text-red { color: #dc2626; }
            
            @media print {
              body { background-color: white; }
              .page-container { margin: 0; padding: 0; box-shadow: none; max-width: 100%; }
              .action-bar { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="action-bar">
            <button class="btn btn-secondary" onclick="window.close()">ปิดหน้าต่าง</button>
            <button class="btn btn-primary" onclick="window.print()">🖨️ พิมพ์งบกำไรขาดทุน / บันทึก PDF</button>
          </div>
          
          <div class="page-container">
            <div class="header">
              <h2>งบกำไรขาดทุน (Profit & Loss Statement)</h2>
              <p><strong>สำหรับช่วงเวลา:</strong> ${new Date(startDate).toLocaleDateString("th-TH")} ถึง ${new Date(endDate).toLocaleDateString("th-TH")}</p>
              <p><strong>อัตรากำไรสุทธิ (Net Profit Margin):</strong> ${netMarginPercent}%</p>
            </div>
            
            <table class="pl-table">
              <tbody>
                <tr class="pl-group">
                  <td>1. รายได้จากการดำเนินงาน (Revenue)</td>
                  <td class="text-right text-green">${formatCurrency(reportData.summary.totalIncome)}</td>
                </tr>
                ${pAndLStructure.incomeItems.map((item: any) => `
                  <tr>
                    <td class="pl-indent">• ${item.name}</td>
                    <td class="text-right text-green">+${formatCurrency(item.value)}</td>
                  </tr>
                `).join('')}

                <tr class="pl-group">
                  <td>2. ต้นทุนขาย (Cost of Goods Sold - COGS)</td>
                  <td class="text-right text-red">-${formatCurrency(pAndLStructure.cogs)}</td>
                </tr>
                <tr>
                  <td class="pl-indent">• ต้นทุนวัตถุดิบอาหารและเครื่องดื่ม / บรรจุภัณฑ์</td>
                  <td class="text-right text-red">-${formatCurrency(pAndLStructure.cogs)}</td>
                </tr>

                <tr class="font-bold" style="background-color: #f0fdf4;">
                  <td style="color: #15803d; padding-left: 15px;">กำไรขั้นต้น (Gross Profit)</td>
                  <td class="text-right" style="color: #15803d;">${formatCurrency(pAndLStructure.grossProfit)}</td>
                </tr>

                <tr class="pl-group">
                  <td>3. ค่าใช้จ่ายในการดำเนินงาน (Operating Expenses - OPEX)</td>
                  <td class="text-right text-red">-${formatCurrency(pAndLStructure.opex)}</td>
                </tr>
                ${pAndLStructure.opexItems.map((item: any) => `
                  <tr>
                    <td class="pl-indent">• ค่า${item.name}</td>
                    <td class="text-right text-red">-${formatCurrency(item.value)}</td>
                  </tr>
                `).join('')}

                <tr class="bg-total">
                  <td style="padding: 15px 10px;">กำไรสุทธิบรรทัดสุดท้าย (Net Profit / Bottom Line)</td>
                  <td class="text-right" style="padding: 15px 10px;">${formatCurrency(reportData.summary.netProfit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!reportData) return <div>กำลังโหลดข้อมูล...</div>;

  const { summary, dailyChartData, expenseCategoryData, accounts } = reportData;

  return (
    <div className="w-full flex flex-col gap-6 relative">

      {/* 1. Header & Filter */}
      <div className="w-full rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
            <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">แดชบอร์ดกำไร-ขาดทุน (P&L Dashboard)</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">วิเคราะห์รายได้ ต้นทุน ค่าใช้จ่าย และสถิติการทำกำไรของร้าน</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500">ตั้งแต่</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} className="h-9 cursor-pointer w-[140px]" disabled={loading} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500">ถึง</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} className="h-9 cursor-pointer w-[140px]" disabled={loading} />
          </div>
          <Button type="submit" disabled={loading} className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white px-3">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-sm font-semibold whitespace-nowrap">รายรับรวม (Income)</span>
            <TrendingUp className="h-5 w-5 shrink-0 ml-2" />
          </div>
          <div className="mt-4 text-lg sm:text-xl xl:text-2xl font-bold text-zinc-800 dark:text-zinc-100 whitespace-nowrap truncate tracking-tight" title={formatCurrency(summary.totalIncome)}>
            {formatCurrency(summary.totalIncome)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-red-600 dark:text-red-400">
            <span className="text-sm font-semibold whitespace-nowrap">รายจ่ายรวม (Expense)</span>
            <TrendingDown className="h-5 w-5 shrink-0 ml-2" />
          </div>
          <div className="mt-4 text-lg sm:text-xl xl:text-2xl font-bold text-zinc-800 dark:text-zinc-100 whitespace-nowrap truncate tracking-tight" title={formatCurrency(summary.totalExpense)}>
            {formatCurrency(summary.totalExpense)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-indigo-600 dark:bg-indigo-600 shadow-md p-5 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Target className="h-16 w-16" /></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-sm font-semibold text-indigo-100 whitespace-nowrap">กำไรสุทธิ (Net Profit)</span>
          </div>
          <div className="mt-4 text-lg sm:text-xl xl:text-2xl font-bold relative z-10 whitespace-nowrap truncate tracking-tight" title={formatCurrency(summary.netProfit)}>
            {formatCurrency(summary.netProfit)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <span className="text-sm font-semibold whitespace-nowrap">อัตรากำไร (Net Margin)</span>
            <Percent className="h-5 w-5 shrink-0 ml-2" />
          </div>
          <div className="mt-4 text-lg sm:text-xl xl:text-2xl font-bold text-zinc-800 dark:text-zinc-100 whitespace-nowrap truncate tracking-tight" title={`${netMarginPercent}%`}>
            {netMarginPercent}%
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-sm font-semibold whitespace-nowrap">รับชำระหนี้ (AR Collect)</span>
            <CreditCard className="h-5 w-5 shrink-0 ml-2" />
          </div>
          <div className="mt-4 text-lg sm:text-xl xl:text-2xl font-bold text-zinc-800 dark:text-zinc-100 whitespace-nowrap truncate tracking-tight" title={formatCurrency(summary.totalARPayment)}>
            {formatCurrency(summary.totalARPayment)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
            <span className="text-sm font-semibold whitespace-nowrap">หนี้ค้างรับ (Unpaid AR)</span>
            <Receipt className="h-5 w-5 shrink-0 ml-2" />
          </div>
          <div className="mt-4 text-lg sm:text-xl xl:text-2xl font-bold text-zinc-800 dark:text-zinc-100 whitespace-nowrap truncate tracking-tight" title={formatCurrency(summary.totalOutstandingAR || 0)}>
            {formatCurrency(summary.totalOutstandingAR || 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-6 h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-6">เปรียบเทียบรายรับ-รายจ่าย รายวัน</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#71717a' }} tickMargin={10} />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(value) => formatCurrency(value)} width={80} />
                <RechartsTooltip cursor={{ fill: '#71717a', opacity: 0.1 }} formatter={(value: number) => formatCurrency(value)} labelStyle={{ color: '#18181b', fontWeight: 'bold' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="เงินเข้า" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="เงินออก" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-6 h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-2">สัดส่วนรายจ่ายตามหมวดหมู่</h3>
          {expenseCategoryData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-zinc-500">ไม่มีข้อมูลรายจ่ายในช่วงนี้</div>
          ) : (
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                    {expenseCategoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} itemStyle={{ color: '#18181b' }} />
                  <Legend layout="vertical" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="w-full rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">โครงสร้างงบกำไรขาดทุน (P&L Statement)</h3>
          </div>

          <Button
            onClick={handleExportPDF}
            className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs h-8 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> พิมพ์รายงาน P&L
          </Button>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">

          <div className="py-3 flex justify-between font-bold text-zinc-800 dark:text-zinc-200">
            <span>1. รายได้จากการดำเนินงาน (Revenue)</span>
            <span className="text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{formatCurrency(summary.totalIncome)}</span>
          </div>

          <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50 mb-2">
            {pAndLStructure.incomeItems.map((item: any, idx: number) => (
              <div
                key={`inc-${idx}`}
                onClick={() => { setDrillDownCategory(item.name); setDrillDownType(item.type); }}
                className="py-2.5 flex justify-between text-zinc-600 dark:text-zinc-400 text-xs pl-8 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/60 rounded-md transition-all cursor-pointer group"
                title="คลิกเพื่อเจาะลึกรายการ"
              >
                <span className="flex items-center gap-1.5 group-hover:text-indigo-500 transition-colors">
                  • {item.name} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span className="text-emerald-500 font-medium whitespace-nowrap">+{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>

          <div className="py-3 flex justify-between text-zinc-600 dark:text-zinc-400 pl-4">
            <span className="flex items-center gap-1.5 font-bold">2. ต้นทุนขาย (Cost of Goods Sold - COGS)</span>
            <span className="text-red-500 font-bold whitespace-nowrap">-{formatCurrency(pAndLStructure.cogs)}</span>
          </div>
          <div className="py-1.5 flex justify-between text-zinc-500 dark:text-zinc-400 text-xs pl-8 pb-3">
            <span>• ต้นทุนวัตถุดิบและบรรจุภัณฑ์</span>
            <span className="text-red-500 font-medium whitespace-nowrap">-{formatCurrency(pAndLStructure.cogs)}</span>
          </div>
          <div className="py-3.5 flex justify-between font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10 px-3 rounded-xl my-1">
            <span>กำไรขั้นต้น (Gross Profit)</span>
            <span className="whitespace-nowrap">{formatCurrency(pAndLStructure.grossProfit)}</span>
          </div>
          <div className="py-3 flex justify-between font-bold text-zinc-800 dark:text-zinc-200 mt-2">
            <span>3. ค่าใช้จ่ายในการดำเนินงาน (Operating Expenses - OPEX)</span>
            <span className="text-red-500 whitespace-nowrap">-{formatCurrency(pAndLStructure.opex)}</span>
          </div>

          <div className="pb-3">
            {pAndLStructure.opexItems.map((item: any, idx: number) => (
              <div
                key={idx}
                onClick={() => { setDrillDownCategory(item.name); setDrillDownType("EXPENSE"); }}
                className="py-2.5 flex justify-between text-zinc-500 dark:text-zinc-400 text-xs pl-8 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/60 rounded-md transition-all cursor-pointer group"
                title="คลิกเพื่อดูรายการย่อย"
              >
                <span className="flex items-center gap-1.5 group-hover:text-indigo-400 transition-colors">
                  • ค่า{item.name} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span className="text-red-400 font-medium whitespace-nowrap">-{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
          <div className="py-4 flex justify-between font-black text-base text-white bg-indigo-600 px-4 rounded-xl mt-4 shadow-sm">
            <span>กำไรสุทธิประจำงวด (Net Profit / Bottom Line)</span>
            <span className="whitespace-nowrap">{formatCurrency(summary.netProfit)}</span>
          </div>
        </div>
      </div>
      <div className="w-full rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-zinc-500" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">ยอดเงินคงเหลือปัจจุบันแยกตามบัญชี</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {accounts.map((acc: any, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex justify-between items-center overflow-hidden">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 truncate pr-2" title={acc.accountName}>{acc.accountName}</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0">{formatCurrency(Number(acc.balance))}</span>
            </div>
          ))}
        </div>
      </div>
      {drillDownCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setDrillDownCategory(null)}></div>
          <div className="relative w-full max-w-xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">

            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">เจาะลึกรายการ: {drillDownCategory}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">ประเภทระบบข้อมูล: [ {drillDownType} ]</p>
                </div>
              </div>
              <button onClick={() => setDrillDownCategory(null)} className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 max-h-[50vh]">
              {currentDrillDownTransactions.length > 0 ? (
                currentDrillDownTransactions.map((tx: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{tx.title}</p>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1 font-mono"><Calendar className="w-3 h-3" /> {new Date(tx.date).toLocaleDateString("th-TH")}</span>
                        <span>•</span>
                        <span>บัญชี: {tx.account}</span>
                      </div>
                    </div>
                    <span className={`font-mono text-sm font-bold shrink-0 ml-4 ${drillDownType === "EXPENSE" ? "text-red-500" : "text-emerald-500"}`}>
                      {drillDownType === "EXPENSE" ? "-" : "+"}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  ไม่พบรายละเอียดธุรกรรมแยกย่อยในหมวดหมู่นี้
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end">
              <Button size="sm" onClick={() => setDrillDownCategory(null)} className="bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 text-white text-xs px-4">
                ปิดหน้าต่าง
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}