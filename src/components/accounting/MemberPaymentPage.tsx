"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUser } from "@/components/providers/UserContext";
import { Search, Phone, AlertTriangle, Landmark, Save, Receipt, X, CheckCircle2, ChevronLeft, ChevronRight, Wallet, History, FileText, Download, Printer, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { executeMemberPayment } from "@/lib/actions/actionMemberPayment";

type SortField = "name" | "bucket30" | "bucket60" | "bucket90" | "bucketOver90" | "currentDebt";
type SortOrder = "asc" | "desc";

export default function MemberPaymentPage({ initialMembers, shopAccounts, userId, organizationId }: any) {
  const router = useRouter();
  const { employeeId } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const [selectedShopAccountId, setSelectedShopAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const [paymentDate, setPaymentDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [activeTab, setActiveTab] = useState<"DEBT" | "PAID" | "HISTORY">("DEBT");
  const [selectedBillsToPay, setSelectedBillsToPay] = useState<any[]>([]);

  const [sortField, setSortField] = useState<SortField>("currentDebt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);
    setPaymentDate(localISOTime);
  }, []);

  const membersWithDebtInfo = useMemo(() => {
    const now = new Date().getTime();

    return initialMembers.map((member: any) => {
      const spends = [...(member.transactions?.filter((t: any) => t.type === "SPEND") || [])]
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      const allTopups = member.transactions?.filter((t: any) => t.type === "TOPUP") || [];

      const totalSpent = spends.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
      const totalPaid = allTopups.reduce((sum: number, t: any) => sum + t.amount, 0);
      const currentDebt = totalSpent - totalPaid > 0 ? totalSpent - totalPaid : 0;

      let aging = { bucket30: 0, bucket60: 0, bucket90: 0, bucketOver90: 0 };

      if (currentDebt > 0) {
        let unreferencedMoney = allTopups
          .filter((t: any) => t.referenceTxId == null)
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        for (const bill of spends) {
          const billAmount = Math.abs(bill.amount);
          const explicitlyPaid = allTopups
            .filter((t: any) => t.referenceTxId === bill.id)
            .reduce((sum: number, t: any) => sum + t.amount, 0);

          let remainingForThisBill = billAmount - explicitlyPaid;

          if (remainingForThisBill > 0 && unreferencedMoney > 0) {
            const fifoPaid = Math.min(remainingForThisBill, unreferencedMoney);
            unreferencedMoney -= fifoPaid;
            remainingForThisBill -= fifoPaid;
          }

          if (remainingForThisBill > 0) {
            const billDate = new Date(bill.createdAt).getTime();
            const diffDays = Math.floor((now - billDate) / (1000 * 60 * 60 * 24));

            if (diffDays <= 30) aging.bucket30 += remainingForThisBill;
            else if (diffDays <= 60) aging.bucket60 += remainingForThisBill;
            else if (diffDays <= 90) aging.bucket90 += remainingForThisBill;
            else aging.bucketOver90 += remainingForThisBill;
          }
        }
      }

      return { ...member, currentDebt, aging };
    });
  }, [initialMembers]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const dashboardSummary = useMemo(() => {
    let totalDebtSum = 0;
    let normalDebtSum = 0;
    let overdueDebtSum = 0;

    membersWithDebtInfo.forEach((m: any) => {
      totalDebtSum += m.currentDebt;
      normalDebtSum += m.aging.bucket30;
      overdueDebtSum += (m.aging.bucket60 + m.aging.bucket90 + m.aging.bucketOver90);
    });

    return { totalDebtSum, normalDebtSum, overdueDebtSum };
  }, [membersWithDebtInfo]);

  const filteredAndSortedDebtors = useMemo(() => {
    let debtors = membersWithDebtInfo.filter((m: any) => m.currentDebt > 0);
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      debtors = debtors.filter((m: any) =>
        m.phone.includes(query) ||
        m.firstName.toLowerCase().includes(query) ||
        (m.lastName && m.lastName.toLowerCase().includes(query))
      );
    }

    debtors.sort((a: any, b: any) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortField === "name") {
        valA = a.firstName.toLowerCase();
        valB = b.firstName.toLowerCase();
      } else if (sortField === "currentDebt") {
        valA = a.currentDebt;
        valB = b.currentDebt;
      } else {
        const bucketKey = sortField as keyof typeof a.aging;
        valA = a.aging[bucketKey];
        valB = b.aging[bucketKey];
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return debtors;
  }, [membersWithDebtInfo, searchQuery, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedDebtors.length / itemsPerPage) || 1;
  const currentDebtors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedDebtors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedDebtors, currentPage, itemsPerPage]);

  const handleExportCSV = () => {
    if (filteredAndSortedDebtors.length === 0) {
      toast.warning("ไม่มีข้อมูลลูกหนี้ค้างชำระที่จะส่งออก");
      return;
    }

    const headers = ["ชื่อลูกค้า", "เบอร์โทรศัพท์", "ค้างชำระ <= 30 วัน", "ค้างชำระ 31-60 วัน", "ค้างชำระ 61-90 วัน", "ค้างชำระ > 90 วัน", "ยอดหนี้รวมทั้งหมด"];
    const csvRows = filteredAndSortedDebtors.map((m: any) => [
      `"${m.firstName} ${m.lastName || ""}"`,
      `"${m.phone}"`,
      m.aging.bucket30,
      m.aging.bucket60,
      m.aging.bucket90,
      m.aging.bucketOver90,
      m.currentDebt
    ].join(","));

    const csvString = [headers.join(","), ...csvRows].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `รายงานวิเคราะห์อายุลูกหนี้_${new Date().toLocaleDateString("th-TH")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("ส่งออกข้อมูลไฟล์ CSV สำเร็จ");
  };

  const handleExportPDF = () => {
    if (filteredAndSortedDebtors.length === 0) {
      toast.warning("ไม่มีข้อมูลลูกหนี้ค้างชำระที่จะส่งออก");
      return;
    }

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
          <title>รายงานวิเคราะห์อายุหนี้ประจำวันที่_${new Date().toLocaleDateString("th-TH")}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
            body { font-family: 'Sarabun', sans-serif; color: #18181b; margin: 0; padding: 0; background-color: #f4f4f5; }
            .action-bar { background: #18181b; padding: 15px 20px; display: flex; justify-content: flex-end; gap: 10px; position: sticky; top: 0; z-index: 100; }
            .btn { padding: 8px 16px; border-radius: 6px; border: none; font-family: 'Sarabun', sans-serif; font-weight: 600; cursor: pointer; font-size: 14px; }
            .btn-primary { background: #10b981; color: white; }
            .btn-secondary { background: #3f3f46; color: white; }
            .page-container { background: white; max-width: 210mm; margin: 30px auto; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 4px; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #e4e4e7; padding-bottom: 15px; }
            .header h2 { margin: 0 0 5px 0; font-size: 22px; color: #18181b; }
            .header p { margin: 0; font-size: 13px; color: #52525b; }
            .summary-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
            .sum-box { border: 1px solid #e4e4e7; padding: 12px; border-radius: 6px; background: #fafafa; text-align: center; }
            .sum-title { font-size: 11px; font-weight: bold; color: #71717a; text-transform: uppercase; margin-bottom: 4px; }
            .sum-val { font-size: 18px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            th, td { border: 1px solid #d4d4d8; padding: 8px 6px; text-align: left; }
            th { background-color: #f4f4f5; font-weight: bold; }
            .text-right { text-align: right; }
            .text-red { color: #dc2626; font-weight: bold; }
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
            <button class="btn btn-primary" onclick="window.print()">🖨️ สั่งพิมพ์รายงาน / บันทึก PDF</button>
          </div>
          <div class="page-container">
            <div class="header">
              <h2>รายงานวิเคราะห์อายุลูกหนี้ค้างชำระ (AR Aging Report)</h2>
              <p>ข้อมูล ณ วันที่พิมพ์: ${new Date().toLocaleString("th-TH")} น.</p>
            </div>
            <div class="summary-summary">
              <div class="sum-box">
                <div class="sum-title">ยอดลูกหนี้ค้างชำระทั้งหมด</div>
                <div class="sum-val" style="color: #ef4444;">${dashboardSummary.totalDebtSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div class="sum-box">
                <div class="sum-title">หนี้ปกติ (&le; 30 วัน)</div>
                <div class="sum-val" style="color: #10b981;">${dashboardSummary.normalDebtSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div class="sum-box">
                <div class="sum-title">หนี้ค้างนาน (&gt; 30 วัน)</div>
                <div class="sum-val" style="color: #f59e0b;">${dashboardSummary.overdueDebtSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ชื่อลูกค้า - เบอร์โทรศัพท์</th>
                  <th class="text-right">&le; 30 วัน</th>
                  <th class="text-right">31-60 วัน</th>
                  <th class="text-right">61-90 วัน</th>
                  <th class="text-right">&gt; 90 วัน</th>
                  <th class="text-right">หนี้รวมทั้งหมด</th>
                </tr>
              </thead>
              <tbody>
                ${filteredAndSortedDebtors.map((m: any) => `
                  <tr>
                    <td><strong>${m.firstName} ${m.lastName || ""}</strong><br><span style="font-size: 10px; color:#71717a;">${m.phone}</span></td>
                    <td class="text-right">${m.aging.bucket30 > 0 ? m.aging.bucket30.toLocaleString() : "-"}</td>
                    <td class="text-right" style="color: #b45309;">${m.aging.bucket60 > 0 ? m.aging.bucket60.toLocaleString() : "-"}</td>
                    <td class="text-right" style="color: #ea580c;">${m.aging.bucket90 > 0 ? m.aging.bucket90.toLocaleString() : "-"}</td>
                    <td class="text-right text-red">${m.aging.bucketOver90 > 0 ? m.aging.bucketOver90.toLocaleString() : "-"}</td>
                    <td class="text-right" style="font-weight: bold; background: #fff5f5;">${m.currentDebt.toLocaleString()} </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // 🟢 ปรับปรุงลอจิกคำนวณแยกกลุ่มบิล และสร้างระบบจับคู่ ID บิลพร้อมยอดเงินเพื่อแสดงในประวัติ
  const { activeBills, settledBills, groupedHistory, billsLookupMap } = useMemo(() => {
    if (!selectedMember) return { activeBills: [], settledBills: [], groupedHistory: [], billsLookupMap: new Map() };

    const spends = [...(selectedMember.transactions?.filter((t: any) => t.type === "SPEND") || [])]
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const allTopups = selectedMember.transactions?.filter((t: any) => t.type === "TOPUP") || [];

    let unreferencedMoney = allTopups
      .filter((t: any) => t.referenceTxId == null)
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const calculatedActiveBills = [];
    const calculatedSettledBills = [];
    const internalLookupMap = new Map();

    for (const bill of spends) {
      const billAmount = Math.abs(bill.amount);
      const explicitlyPaid = allTopups
        .filter((t: any) => t.referenceTxId === bill.id)
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      let remainingForThisBill = billAmount - explicitlyPaid;
      let totalPaidForThisBill = explicitlyPaid;

      if (remainingForThisBill > 0 && unreferencedMoney > 0) {
        const fifoPaid = Math.min(remainingForThisBill, unreferencedMoney);
        unreferencedMoney -= fifoPaid;
        remainingForThisBill -= fifoPaid;
        totalPaidForThisBill += fifoPaid;
      }

      const billData = {
        ...bill,
        originalAmount: billAmount,
        paidAmount: totalPaidForThisBill,
        remainingAmount: remainingForThisBill
      };

      internalLookupMap.set(bill.id, billData);

      if (remainingForThisBill > 0) {
        calculatedActiveBills.push(billData);
      }
      if (totalPaidForThisBill > 0) {
        calculatedSettledBills.push(billData);
      }
    }

    calculatedActiveBills.reverse();
    calculatedSettledBills.reverse();

    const historyMap = new Map();
    const sortedTopups = [...allTopups].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    sortedTopups.forEach((tx: any) => {
      const key = tx.paymentGroupId || tx.id;
      if (historyMap.has(key)) {
        const existing = historyMap.get(key);
        existing.amount += tx.amount;
        existing.isGrouped = true;
        if (tx.referenceTxId) {
          existing.clearedBills = existing.clearedBills || [];
          existing.clearedBills.push({ id: tx.referenceTxId, amountPaid: tx.amount });
        }
      } else {
        historyMap.set(key, {
          ...tx,
          isGrouped: false,
          clearedBills: tx.referenceTxId ? [{ id: tx.referenceTxId, amountPaid: tx.amount }] : []
        });
      }
    });

    const finalHistory = Array.from(historyMap.values());

    return {
      activeBills: calculatedActiveBills,
      settledBills: calculatedSettledBills,
      groupedHistory: finalHistory,
      billsLookupMap: internalLookupMap
    };
  }, [selectedMember]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSelectMember = (member: any) => {
    setSelectedMember(member);
    setSelectedBillsToPay([]);
    setAmount("");
    setActiveTab("DEBT");
  };

  const handleToggleSelectBill = (bill: any) => {
    setSelectedBillsToPay((prev) => {
      const isAlreadySelected = prev.some((b) => b.id === bill.id);
      let newSelected = isAlreadySelected
        ? prev.filter((b) => b.id !== bill.id)
        : [...prev, bill];

      const totalSelectedAmount = newSelected.reduce((sum, b) => sum + b.remainingAmount, 0);
      setAmount(totalSelectedAmount > 0 ? totalSelectedAmount.toString() : "");

      return newSelected;
    });
  };

  const closeModal = () => {
    setSelectedMember(null);
    setSelectedBillsToPay([]);
    setAmount("");
    setNote("");
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return toast.error("กรุณาเลือกสมาชิกก่อนทำรายการ");
    if (!selectedShopAccountId) return toast.error("กรุณาเลือกช่องทางรับเงินเข้าร้าน");
    if (!paymentDate) return toast.error("กรุณาเลือกวันที่ชำระเงิน");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return toast.error("กรุณาระบุจำนวนเงินให้ถูกต้อง");

    setLoading(true);
    const targetTransactionIds = selectedBillsToPay.map(b => b.id);

    const res = await executeMemberPayment({
      memberId: selectedMember.id,
      companyAccountId: parseInt(selectedShopAccountId),
      paymentType: "CLEAR_DEBT",
      amount: numAmount,
      note: note || (targetTransactionIds.length > 0 ? `รับชำระบิลค้าง (${targetTransactionIds.length} รายการ)` : "รับชำระบิลค้าง (ตัดยอดอัตโนมัติ)"),
      userId: Number(employeeId || userId),
      organizationId,
      clearingTransactionIds: targetTransactionIds,
      paymentDate: paymentDate
    });

    if (res.success) {
      toast.success(res.message);
      closeModal();
      setSearchQuery("");
      router.refresh();
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen text-zinc-100 font-sans relative selection:bg-indigo-500/30">

      <style dangerouslySetInnerHTML={{__html: `
        .fancy-scrollbar::-webkit-scrollbar { width: 6px; }
        .fancy-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .fancy-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .fancy-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}} />

      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-400" /> รับชำระหนี้ / คืนยอดเครดิต
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">ตรวจสอบอายุหนี้ และรับชำระเงินจากลูกค้า</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-[380px]">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input
                placeholder="ค้นหาด้วยเบอร์โทร หรือชื่อ..."
                className="pl-10 h-10 bg-[#0A0A0B] border-zinc-800 text-zinc-200 focus-visible:ring-1 focus-visible:ring-indigo-500 rounded-lg text-sm"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <Button type="submit" className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-5 text-sm font-medium">ค้นหา</Button>
          </form>
        </div>

        {/* DASHBOARD SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111113] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between shadow-md">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">ยอดเงินจม / หนี้ค้างรวมทั้งหมด</p>
              <p className="text-2xl font-black text-red-400">{dashboardSummary.totalDebtSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">ยอดเครดิตสะสมคงค้างของสมาชิกร้านค้าทุกคน</p>
          </div>

          <div className="bg-[#111113] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between shadow-md">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">หนี้ก้อนปกติ (&le; 30 วัน)</p>
              <p className="text-2xl font-black text-emerald-400">{dashboardSummary.normalDebtSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <p className="text-[11px] text-emerald-500/80 mt-2">ยอดหนี้อายุสั้น หมุนเวียนปกติ ความเสี่ยงต่ำ</p>
          </div>

          <div className="bg-[#111113] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between shadow-md">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">หนี้ค้างนาน / หนี้เสี่ยง (&gt; 30 วัน)</p>
              <p className="text-2xl font-black text-amber-500">{dashboardSummary.overdueDebtSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <p className="text-[11px] text-amber-500/80 mt-2">หนี้ค้างนานเกิน 1 เดือนขึ้นไป ควรเริ่มติดตามทวงถาม</p>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-[#111113] border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-zinc-800/80 bg-[#161618] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-bold text-zinc-200 tracking-wide">รายงานอายุลูกหนี้ค้างชำระ ({filteredAndSortedDebtors.length} รายการ)</h3>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button onClick={handleExportCSV} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 h-8 text-xs rounded-lg flex items-center gap-1.5 px-3 transition-colors">
                <Download className="w-3.5 h-3.5" /> ส่งออก CSV
              </Button>
              <Button onClick={handleExportPDF} className="bg-indigo-600 hover:bg-indigo-500 text-white h-8 text-xs rounded-lg flex items-center gap-1.5 px-3 transition-all shadow-sm">
                <Printer className="w-3.5 h-3.5" /> ตรวจสอบ / พิมพ์ PDF
              </Button>
            </div>
          </div>

          {filteredAndSortedDebtors.length > 0 ? (
            <div className="flex flex-col">
              <div className="overflow-x-auto fancy-scrollbar pb-2">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead className="bg-[#0A0A0B] border-b border-zinc-800">
                    <tr className="text-zinc-400 text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap select-none">
                      <th onClick={() => handleSort("name")} className="px-5 py-3.5 w-[220px] hover:bg-zinc-800/50 cursor-pointer group transition-colors">
                        <div className="flex items-center gap-1">ข้อมูลลูกค้า <ArrowUpDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" /></div>
                      </th>
                      <th onClick={() => handleSort("bucket30")} className="px-3 py-3.5 text-right w-[100px] text-zinc-400 hover:bg-zinc-800/50 cursor-pointer group transition-colors">
                        <div className="flex items-center justify-end gap-1">&le; 30 วัน <ArrowUpDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" /></div>
                      </th>
                      <th onClick={() => handleSort("bucket60")} className="px-3 py-3.5 text-right w-[100px] text-yellow-500/80 hover:bg-zinc-800/50 cursor-pointer group transition-colors">
                        <div className="flex items-center justify-end gap-1">31-60 วัน <ArrowUpDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" /></div>
                      </th>
                      <th onClick={() => handleSort("bucket90")} className="px-3 py-3.5 text-right w-[100px] text-orange-500/80 hover:bg-zinc-800/50 cursor-pointer group transition-colors">
                        <div className="flex items-center justify-end gap-1">61-90 วัน <ArrowUpDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" /></div>
                      </th>
                      <th onClick={() => handleSort("bucketOver90")} className="px-3 py-3.5 text-right w-[110px] text-red-500/80 hover:bg-zinc-800/50 cursor-pointer group transition-colors">
                        <div className="flex items-center justify-end gap-1">&gt; 90 วัน <ArrowUpDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" /></div>
                      </th>
                      <th onClick={() => handleSort("currentDebt")} className="px-5 py-3.5 text-right w-[130px] text-zinc-300 hover:bg-zinc-800/50 cursor-pointer group transition-colors">
                        <div className="flex items-center justify-end gap-1">หนี้รวมทั้งหมด <ArrowUpDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" /></div>
                      </th>
                      <th className="px-5 py-3.5 text-center w-[100px]">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40 text-sm">
                    {currentDebtors.map((debtor: any, index: number) => (
                      <tr
                        key={debtor.id}
                        className={`hover:bg-zinc-800/40 transition-colors cursor-pointer group ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#161618]/30'}`}
                        onClick={() => handleSelectMember(debtor)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                              {debtor.firstName[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors line-clamp-1">{debtor.firstName} {debtor.lastName || ""}</span>
                              <span className="text-[11px] text-zinc-500 font-mono">{debtor.phone}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3.5 text-right font-mono text-xs text-zinc-300">
                          {debtor.aging.bucket30 > 0 ? debtor.aging.bucket30.toLocaleString() : "-"}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-xs text-yellow-500">
                          {debtor.aging.bucket60 > 0 ? debtor.aging.bucket60.toLocaleString() : "-"}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-xs text-orange-500 font-medium">
                          {debtor.aging.bucket90 > 0 ? debtor.aging.bucket90.toLocaleString() : "-"}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-xs">
                          {debtor.aging.bucketOver90 > 0 ? (
                            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold">
                              {debtor.aging.bucketOver90.toLocaleString()}
                            </span>
                          ) : "-"}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <span className="font-bold text-red-400 bg-red-500/5 px-2.5 py-1 rounded-lg">
                            {debtor.currentDebt.toLocaleString()}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <Button variant="secondary" size="sm" className="h-8 bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white border border-zinc-700/50 hover:border-indigo-500 transition-all rounded-md font-medium text-xs px-4">
                            รับชำระ
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-zinc-800/80 bg-[#161618] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <p className="text-xs text-zinc-500 font-medium hidden sm:block">
                    แสดงแถวที่ {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedDebtors.length)} จากทั้งหมด {filteredAndSortedDebtors.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-medium">แสดงหน้าละ:</span>
                    <select
                      className="h-8 bg-[#0A0A0B] border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-xs rounded-lg px-2 outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                      value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    >
                      <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                      <option value={filteredAndSortedDebtors.length > 0 ? filteredAndSortedDebtors.length : 100}>ทั้งหมด</option>
                    </select>
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="h-8 w-8 p-0 bg-transparent border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-semibold text-zinc-300 px-3">หน้า {currentPage} / {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="h-8 w-8 p-0 bg-transparent border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-20 text-center text-zinc-500 flex flex-col items-center bg-[#0A0A0B]">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="h-8 w-8 text-emerald-500" /></div>
              <p className="text-lg font-bold text-zinc-200">ไม่มีลูกหนี้ค้างชำระ</p>
              <p className="text-sm mt-1">{searchQuery ? "ไม่พบข้อมูลที่ตรงกับการค้นหา" : "เยี่ยมมาก! ตอนนี้ไม่มีลูกค้าค้างชำระในระบบ"}</p>
            </div>
          )}
        </div>
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={closeModal}></div>
          <div className="relative w-full max-w-[900px] h-[85vh] max-h-[650px] bg-[#111113] border border-zinc-700/50 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200">
            <button onClick={closeModal} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="w-full md:w-1/2 bg-[#0A0A0B] p-8 border-r border-zinc-800/80 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {selectedMember.firstName[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{selectedMember.firstName} {selectedMember.lastName || ""}</h3>
                  <p className="text-zinc-500 font-mono text-sm mt-0.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {selectedMember.phone}</p>
                </div>
              </div>

              <div className="px-6 py-5 rounded-xl bg-gradient-to-r from-red-950/40 to-[#111113] border border-red-900/30 mb-6">
                <p className="text-xs font-semibold text-red-500 mb-1.5 uppercase tracking-wider">ยอดหนี้ที่ต้องชำระทั้งหมด</p>
                <p className="text-3xl font-black text-white tracking-tight">{selectedMember.currentDebt.toLocaleString()} <span className="text-xl text-red-500"></span></p>
              </div>

              <div className="flex items-center gap-1 mb-4 bg-[#161618] p-1 rounded-lg border border-zinc-800/50">
                <button onClick={() => setActiveTab("DEBT")} className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-bold rounded-md transition-all ${activeTab === "DEBT" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>
                  <FileText className="w-3.5 h-3.5 shrink-0" /> ค้างชำระ ({activeBills.length})
                </button>
                <button onClick={() => setActiveTab("PAID")} className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-bold rounded-md transition-all ${activeTab === "PAID" ? "bg-zinc-800 text-emerald-400 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> ชำระแล้ว ({settledBills.length})
                </button>
                <button onClick={() => setActiveTab("HISTORY")} className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-bold rounded-md transition-all ${activeTab === "HISTORY" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>
                  <History className="w-3.5 h-3.5 shrink-0" /> ประวัติจ่ายเงิน
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                {activeTab === "DEBT" && (
                  <div className="flex-1 overflow-y-auto pr-3 space-y-2.5 fancy-scrollbar pb-4">
                    {activeBills.map((tx: any, idx: number) => {
                      const isSelected = selectedBillsToPay.some((b) => b.id === tx.id);
                      return (
                        <div key={`debt-${idx}`} onClick={() => handleToggleSelectBill(tx)} className={`p-3.5 rounded-lg border flex flex-col gap-2 group transition-all cursor-pointer relative overflow-hidden ${isSelected ? "bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.15)]" : "bg-[#161618] border-zinc-800/50 hover:border-zinc-600"}`}>
                          <div className={`absolute top-3.5 right-3.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-zinc-600"}`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="flex justify-between items-start pr-8">
                            <div className="space-y-1.5">
                              <p className={`font-semibold text-sm flex items-center gap-2 ${isSelected ? "text-indigo-300" : "text-zinc-200"}`}>
                                <Receipt className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-400" : "text-zinc-500"}`} />
                                {tx.orderId ? `บิล #${tx.orderId}` : "เซ็นยืมหน้าร้าน"}
                              </p>

                              {/* 🟢 แสดง 2 วันที่คู่กัน */}
                              <div className="flex flex-col gap-0.5">
                                {tx.date && (
                                  <span className={`text-[11px] font-mono flex items-center gap-1.5 ${isSelected ? "text-indigo-300/80" : "text-zinc-400"}`}>
                                    <Calendar className="w-3 h-3 opacity-70" />
                                    วันที่บิล: {new Date(tx.date).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })}
                                  </span>
                                )}
                                <span className={`text-[10px] font-mono flex items-center gap-1.5 ${isSelected ? "text-indigo-400/60" : "text-zinc-500"}`}>
                                  <History className="w-3 h-3 opacity-70" />
                                  บันทึกระบบ: {new Date(tx.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })} น.
                                </span>
                              </div>
                            </div>
                            {tx.paidAmount > 0 && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">จ่ายบางส่วนแล้ว</span>}
                          </div>
                          <div className={`flex items-center justify-between mt-1 pt-2 border-t ${isSelected ? "border-indigo-500/20" : "border-zinc-800/50"}`}>
                            <div className="flex gap-3 text-xs">
                              <span className="text-zinc-500">ยอดเดิม: {tx.originalAmount.toLocaleString()}</span>
                              {tx.paidAmount > 0 && <span className="text-emerald-500/80">- จ่ายแล้ว: {tx.paidAmount.toLocaleString()}</span>}
                            </div>
                            <span className={`font-bold text-sm ${isSelected ? "text-indigo-400" : "text-red-400"}`}>ค้าง {tx.remainingAmount.toLocaleString()} </span>
                          </div>
                        </div>
                      );
                    })}
                    {activeBills.length === 0 && <div className="p-6 text-center text-zinc-500 text-sm bg-[#161618] rounded-lg border border-zinc-800/50">ไม่มีบิลค้างชำระ</div>}
                  </div>
                )}

                {activeTab === "PAID" && (
                  <div className="flex-1 overflow-y-auto pr-3 space-y-2.5 fancy-scrollbar pb-4">
                    {settledBills.map((tx: any, idx: number) => {
                      const isPartial = tx.remainingAmount > 0;
                      return (
                        <div key={`settled-${idx}`} className={`p-3.5 rounded-lg border flex flex-col gap-2 relative overflow-hidden ${isPartial ? "bg-amber-950/10 border-amber-900/30" : "bg-zinc-900/20 border-emerald-900/30"}`}>
                          <div className={`absolute top-3.5 right-3.5 ${isPartial ? "text-amber-500" : "text-emerald-500"}`}>
                            {isPartial ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </div>

                          <div className="space-y-1.5 pr-8">
                            <p className="font-semibold text-sm flex items-center gap-2 text-zinc-200">
                              <Receipt className={`w-3.5 h-3.5 ${isPartial ? "text-amber-500" : "text-emerald-500"}`} />
                              {tx.orderId ? `บิล #${tx.orderId}` : "เซ็นยืมหน้าร้าน"}
                            </p>

                            {/* 🟢 แสดง 2 วันที่คู่กัน */}
                            <div className="flex flex-col gap-0.5">
                              {tx.date && (
                                <span className="text-[11px] text-zinc-300 font-mono flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3 text-zinc-400" />
                                  วันที่บิล: {new Date(tx.date).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })}
                                </span>
                              )}
                              <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
                                <History className="w-3 h-3 text-zinc-600" />
                                บันทึกระบบ: {new Date(tx.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })} น.
                              </span>
                            </div>
                          </div>

                          <div className={`flex items-end justify-between mt-1 pt-2 border-t ${isPartial ? "border-amber-900/20" : "border-zinc-800/40"}`}>
                            {isPartial ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] font-medium text-amber-500">ชำระแล้วบางส่วน</span>
                                <div className="flex gap-2 text-[10px]">
                                  <span className="text-zinc-500">ยอดบิล: {tx.originalAmount.toLocaleString()}</span>
                                  <span className="text-red-400/80">ค้าง: {tx.remainingAmount.toLocaleString()}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] font-medium text-emerald-500">ชำระครบเต็มจำนวนเรียบร้อย</span>
                            )}
                            <span className={`font-bold text-sm ${isPartial ? "text-amber-400" : "text-emerald-400"}`}>
                              {isPartial ? `จ่ายแล้ว ${tx.paidAmount.toLocaleString()} ` : `${tx.originalAmount.toLocaleString()} `}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {settledBills.length === 0 && <div className="p-6 text-center text-zinc-500 text-sm bg-[#161618] rounded-lg border border-zinc-800/50">ยังไม่มีประวัติบิลที่ชำระเรียบร้อย</div>}
                  </div>
                )}

                {activeTab === "HISTORY" && (
                  <div className="flex-1 overflow-y-auto pr-3 space-y-2.5 fancy-scrollbar pb-4">
                    {groupedHistory.map((tx: any, idx: number) => {
                      const relatedBills = tx.clearedBills
                        ? tx.clearedBills.map((cb: any) => {
                          const b = billsLookupMap.get(cb.id);
                          return b ? { ...b, paidInThisTx: cb.amountPaid } : null;
                        }).filter(Boolean)
                        : [];

                      return (
                        <div key={`hist-${idx}`} className="p-3.5 rounded-lg bg-emerald-950/10 border border-emerald-900/20 flex flex-col gap-2 group">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1.5">
                              <p className="font-semibold text-emerald-400 text-sm flex items-center gap-2">
                                <Landmark className="w-3.5 h-3.5 text-emerald-500" />
                                {tx.note || "รับชำระเงิน"}
                              </p>

                              <div className="flex flex-col gap-0.5">
                                {tx.date && (
                                  <span className="text-[11px] text-zinc-300 font-mono flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3 text-zinc-400" />
                                    ชำระเมื่อ: {new Date(tx.date).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })}
                                  </span>
                                )}
                                <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
                                  <History className="w-3 h-3 text-zinc-600" />
                                  บันทึกระบบ: {new Date(tx.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })} น.
                                </span>
                              </div>
                            </div>
                            <span className="font-bold text-emerald-400 text-sm">+{tx.amount.toLocaleString()} </span>
                          </div>

                          {relatedBills.length > 0 && (
                            <div className="pt-2 border-t border-emerald-900/20 flex flex-col gap-1.5 mt-1">
                              {relatedBills.map((b: any, bIdx: number) => (
                                <div key={`${b.id}-${bIdx}`} className="flex justify-between items-center bg-emerald-900/30 px-3 py-2 rounded border border-emerald-500/10">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] font-medium text-emerald-300 flex items-center gap-1.5">
                                      <Receipt className="w-3 h-3 opacity-70" />
                                      {b.orderId ? `บิล #${b.orderId}` : "เซ็นยืมหน้าร้าน"}
                                    </span>
                                    {/* วันที่ของบิลต้นทาง (ปล่อยเป็น createdAt ตามเดิม) */}
                                    <span className="text-[9px] text-emerald-500/60 ml-4 font-mono flex items-center gap-1">
                                      <History className="w-2.5 h-2.5 opacity-50" />
                                      สร้างบิลเมื่อ: {new Date(b.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })} น.
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-bold text-emerald-400">
                                    {b.paidInThisTx.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {groupedHistory.length === 0 && <div className="p-6 text-center text-zinc-500 text-sm bg-[#161618] rounded-lg border border-zinc-800/50">ยังไม่มีประวัติการชำระเงิน</div>}
                  </div>
                )}
              </div>
            </div>

            {/* ฝั่งขวา */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-between h-full bg-[#111113]">
              <div>
                <div className="mb-6 pb-4 border-b border-zinc-800/80">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2.5"><Landmark className="w-5 h-5 text-indigo-500" /> บันทึกรับชำระเงิน</h3>
                  <p className="text-zinc-500 mt-1 text-xs">{selectedBillsToPay.length > 0 ? `เลือกจ่ายแล้ว ${selectedBillsToPay.length} บิล (ยอดรวมอัปเดตอัตโนมัติ)` : "กรอกจำนวนเงิน หรือกดเลือกบิลจากด้านซ้าย"}</p>
                </div>

                <form id="paymentForm" onSubmit={handleSubmitPayment} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">วันที่ชำระเงิน <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                      <Input
                        type="date"
                        required
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                        disabled={loading}
                        className="pl-9 h-12 w-full bg-[#0A0A0B] border-zinc-800 text-sm text-zinc-200 focus-visible:ring-indigo-500 rounded-lg cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">ช่องทางรับเงินเข้าร้าน <span className="text-red-500">*</span></label>
                    <select required className="w-full h-12 rounded-lg bg-[#0A0A0B] border border-zinc-800 px-3 text-sm text-zinc-200 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer" value={selectedShopAccountId} onChange={(e) => setSelectedShopAccountId(e.target.value)} disabled={loading}>
                      <option value="" disabled>-- เลือกบัญชีธนาคาร หรือ เงินสด --</option>
                      {shopAccounts.map((acc: any) => (<option key={acc.id} value={acc.id}>{acc.accountName}</option>))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">จำนวนเงินที่ลูกค้านำมาจ่าย <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Input type="number" step="0.01" required placeholder="0.00" className={`h-16 text-3xl font-black text-white bg-[#0A0A0B] border-zinc-700 focus-visible:ring-2 focus-visible:ring-indigo-500 pl-4 pr-12 rounded-xl shadow-inner transition-all ${selectedBillsToPay.length > 0 ? "border-indigo-500 ring-1 ring-indigo-500" : ""}`} value={amount} onChange={(e) => setAmount(e.target.value)} disabled={loading} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-600"></span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500">หมายเหตุช่วยจำ (ถ้ามี)</label>
                    <Input placeholder={selectedBillsToPay.length > 0 ? `จ่ายบิลค้างชำระ จำนวน ${selectedBillsToPay.length} รายการ` : "เช่น ลูกค้าโอนเข้าบัญชีร้าน..."} className="h-10 bg-[#0A0A0B] border-zinc-800 text-sm text-zinc-300 focus-visible:ring-indigo-500 rounded-lg" value={note} onChange={(e) => setNote(e.target.value)} disabled={loading} />
                  </div>
                </form>
              </div>

              <div className="mt-8 pt-4">
                <Button type="submit" form="paymentForm" disabled={loading || selectedMember.currentDebt <= 0} className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base rounded-xl transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] disabled:opacity-50">
                  <Save className="w-5 h-5 mr-2" /> {loading ? "กำลังบันทึกข้อมูล..." : "ยืนยันรับชำระเงิน"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}