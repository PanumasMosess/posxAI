"use client";

import { useState } from "react";
import { toast } from "react-toastify";
// 1. เพิ่มไอคอน Receipt เข้ามาสำหรับยอดหนี้ค้างรับ
import { BarChart3, TrendingUp, TrendingDown, Wallet, Target, Search, CreditCard, Receipt } from "lucide-react";
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

  const formatCurrency = (val: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);

  if (!reportData) return <div>กำลังโหลดข้อมูล...</div>;

  const { summary, dailyChartData, expenseCategoryData, accounts } = reportData;

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* 1. Header & Filter */}
      <div className="w-full rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
            <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">รายงานสรุปบัญชี (Dashboard)</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">ภาพรวมรายรับ-รายจ่าย และสถิติทางการเงินของร้าน</p>
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

      {/* 2. Summary Cards */}
      {/* 2. ปรับ Grid เป็น lg:grid-cols-3 xl:grid-cols-5 เพื่อรองรับ 5 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* รายรับรวม */}
        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-sm font-semibold">รายรับรวม (Income)</span>
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="mt-4 text-2xl font-bold text-zinc-800 dark:text-zinc-100">{formatCurrency(summary.totalIncome)}</div>
        </div>

        {/* รายจ่ายรวม */}
        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-600 dark:text-red-400">
            <span className="text-sm font-semibold">รายจ่ายรวม (Expense)</span>
            <TrendingDown className="h-5 w-5" />
          </div>
          <div className="mt-4 text-2xl font-bold text-zinc-800 dark:text-zinc-100">{formatCurrency(summary.totalExpense)}</div>
        </div>

        {/* กำไรสุทธิ */}
        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-indigo-600 dark:bg-indigo-600 shadow-md p-5 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Target className="h-16 w-16" /></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-sm font-semibold text-indigo-100">กำไรสุทธิ (Net Profit)</span>
          </div>
          <div className="mt-4 text-2xl font-bold relative z-10">{formatCurrency(summary.netProfit)}</div>
        </div>

        {/* ยอดรับชำระหนี้ */}
        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-sm font-semibold">รับชำระหนี้ (AR Collected)</span>
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="mt-4 text-2xl font-bold text-zinc-800 dark:text-zinc-100">{formatCurrency(summary.totalARPayment)}</div>
        </div>

        {/* 3. เพิ่ม Card ใหม่: ยอดหนี้ค้างรับรวม (Outstanding AR) */}
        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
            <span className="text-sm font-semibold">หนี้ค้างรับ (Outstanding AR)</span>
            <Receipt className="h-5 w-5" />
          </div>
          {/* ใส่ || 0 ไว้กันเหนียวกรณีที่ backend ยังไม่ได้พ่นค่านี้มา */}
          <div className="mt-4 text-2xl font-bold text-zinc-800 dark:text-zinc-100">{formatCurrency(summary.totalOutstandingAR || 0)}</div>
        </div>
      </div>

      {/* 3. Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* กราฟแท่ง รายรับ-รายจ่ายรายวัน */}
        <div className="lg:col-span-2 rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-6 h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-6">เปรียบเทียบรายรับ-รายจ่าย รายวัน</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#71717a' }} tickMargin={10} />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(value) => `฿${value}`} width={60} />
                <RechartsTooltip cursor={{ fill: '#71717a', opacity: 0.1 }} formatter={(value: number) => formatCurrency(value)} labelStyle={{ color: '#18181b', fontWeight: 'bold' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="เงินเข้า" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="เงินออก" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* กราฟโดนัท สัดส่วนรายจ่าย */}
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

      {/* 4. Account Balances List */}
      <div className="w-full rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-zinc-500" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">ยอดเงินคงเหลือปัจจุบันแยกตามบัญชี</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {accounts.map((acc: any, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 truncate pr-2">{acc.accountName}</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(Number(acc.balance))}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}