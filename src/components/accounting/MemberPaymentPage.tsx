"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUser } from "@/components/providers/UserContext";
import { Search, Phone, AlertTriangle, Landmark, Save, Receipt, X, CheckCircle2, ChevronLeft, ChevronRight, Wallet, History, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { executeMemberPayment } from "@/lib/actions/actionMemberPayment";

export default function MemberPaymentPage({ initialMembers, shopAccounts, userId, organizationId }: any) {
  const router = useRouter();
  const { employeeId } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  
  const [selectedShopAccountId, setSelectedShopAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 

  const [activeTab, setActiveTab] = useState<"DEBT" | "HISTORY">("DEBT");

  // State เก็บรายการบิลที่พนักงานเลือกว่าจะจ่าย
  const [selectedBillsToPay, setSelectedBillsToPay] = useState<any[]>([]);

  // 1. คำนวณยอดหนี้รวมลูกค้า
  const membersWithDebtInfo = useMemo(() => {
    return initialMembers.map((member: any) => {
      const totalSpent = member.transactions
        ?.filter((t: any) => t.type === "SPEND" && t.walletType === "CREDIT")
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0;

      const totalPaid = member.transactions
        ?.filter((t: any) => t.type === "TOPUP" && t.walletType === "CREDIT")
        .reduce((sum: number, t: any) => sum + t.amount, 0) || 0;

      const currentDebt = totalSpent - totalPaid;
      return { ...member, currentDebt: currentDebt > 0 ? currentDebt : 0 };
    });
  }, [initialMembers]);

  const filteredDebtors = useMemo(() => {
    let debtors = membersWithDebtInfo.filter((m: any) => m.currentDebt > 0);
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      debtors = debtors.filter((m: any) => 
        m.phone.includes(query) || 
        m.firstName.toLowerCase().includes(query) ||
        (m.lastName && m.lastName.toLowerCase().includes(query))
      );
    }
    return debtors;
  }, [membersWithDebtInfo, searchQuery]);

  const totalPages = Math.ceil(filteredDebtors.length / itemsPerPage) || 1;
  const currentDebtors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDebtors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDebtors, currentPage, itemsPerPage]);

  // 2. 🟢 โลจิกคำนวณบิลคงเหลือแบบ Hybrid (เจาะจงบิล + FIFO)
  const { activeBills, groupedHistory } = useMemo(() => {
    if (!selectedMember) return { activeBills: [], groupedHistory: [] };

    // SPEND ทั้งหมด (เรียงเก่าไปใหม่)
    const spends = [...(selectedMember.transactions?.filter((t: any) => t.type === "SPEND") || [])]
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // TOPUP ทั้งหมด
    const allTopups = selectedMember.transactions?.filter((t: any) => t.type === "TOPUP") || [];
    
    // เงินก้อนที่ไม่มีการอ้างอิงบิล (จ่ายรวมๆ แบบเก่า)
    let unreferencedMoney = allTopups
      .filter((t: any) => t.referenceTxId == null)
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const calculatedBills = [];

    // ลูปคำนวณหนี้แต่ละบิล
    for (const bill of spends) {
      const billAmount = Math.abs(bill.amount);
      
      // 2.1 เงินที่ตั้งใจจ่ายให้บิลนี้โดยเฉพาะ (อิงจาก referenceTxId)
      const explicitlyPaid = allTopups
        .filter((t: any) => t.referenceTxId === bill.id)
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      let remainingForThisBill = billAmount - explicitlyPaid;
      let totalPaidForThisBill = explicitlyPaid;

      // 2.2 ถ้าหนี้ยังเหลือ ให้เอาเงินก้อนรวม (FIFO) มาหักด้วย (รองรับข้อมูลเก่าในอดีต)
      if (remainingForThisBill > 0 && unreferencedMoney > 0) {
        const fifoPaid = Math.min(remainingForThisBill, unreferencedMoney);
        unreferencedMoney -= fifoPaid;
        remainingForThisBill -= fifoPaid;
        totalPaidForThisBill += fifoPaid;
      }

      // ถ้ายังจ่ายไม่ครบ เก็บเข้า Array เพื่อแสดงบนหน้าจอ
      if (remainingForThisBill > 0) {
        calculatedBills.push({
          ...bill,
          originalAmount: billAmount,
          paidAmount: totalPaidForThisBill,
          remainingAmount: remainingForThisBill
        });
      }
    }

    // เรียงบิลที่เหลือให้ใหม่สุดอยู่บน
    calculatedBills.reverse();

    // 3. 🟢 โลจิกยุบรวมประวัติการจ่าย (Grouping History)
    // ถ้ารายการไหนมี paymentGroupId เหมือนกัน จะถูกจับมาบวกยอดรวมกันเป็น 1 บรรทัด
    const historyMap = new Map();
    const sortedTopups = [...allTopups].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    sortedTopups.forEach((tx: any) => {
      const key = tx.paymentGroupId || tx.id; // ถ้าไม่มีกลุ่ม ให้ใช้ ID ตัวเองเลย
      if (historyMap.has(key)) {
        const existing = historyMap.get(key);
        existing.amount += tx.amount;
        existing.isGrouped = true;
      } else {
        historyMap.set(key, { ...tx, isGrouped: false });
      }
    });

    const finalHistory = Array.from(historyMap.values());

    return { activeBills: calculatedBills, groupedHistory: finalHistory };
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

  // 🟢 ฟังก์ชันเลือก/ยกเลิกเลือกบิล และรวมยอดให้อัตโนมัติ
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
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return toast.error("กรุณาระบุจำนวนเงินให้ถูกต้อง");

    setLoading(true);

    // ส่ง Array ของ ID (SPEND.id) ไปให้ Backend
    const targetTransactionIds = selectedBillsToPay.map(b => b.id);

    const res = await executeMemberPayment({
      memberId: selectedMember.id,
      companyAccountId: parseInt(selectedShopAccountId),
      paymentType: "CLEAR_DEBT",
      amount: numAmount, // แม้จะใส่ยอดไม่เต็ม Backend ก็จะหักน้ำตกให้
      note: note || (targetTransactionIds.length > 0 ? `รับชำระบิลค้าง (${targetTransactionIds.length} รายการ)` : "-"),
      userId: Number(employeeId || userId),
      organizationId,
      clearingTransactionIds: targetTransactionIds 
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
            <p className="text-sm text-zinc-500 mt-0.5">ค้นหาเบอร์โทรศัพท์ หรือเลือกลูกค้าจากตารางด้านล่าง</p>
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

        {/* DATA TABLE */}
        <div className="bg-[#111113] border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-zinc-800/80 bg-[#161618] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-bold text-zinc-200 tracking-wide">รายชื่อลูกค้าที่มียอดค้างชำระ ({filteredDebtors.length})</h3>
            </div>
          </div>

          {filteredDebtors.length > 0 ? (
            <div className="flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#0A0A0B] border-b border-zinc-800">
                    <tr className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                      <th className="px-6 py-3.5 w-1/3">ข้อมูลลูกค้า</th>
                      <th className="px-6 py-3.5 w-1/4">เบอร์ติดต่อ</th>
                      <th className="px-6 py-3.5 text-right w-1/4">ยอดหนี้ค้างชำระ</th>
                      <th className="px-6 py-3.5 text-center w-[120px]">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40 text-sm">
                    {currentDebtors.map((debtor: any, index: number) => (
                      <tr 
                        key={debtor.id} 
                        className={`hover:bg-zinc-800/40 transition-colors cursor-pointer group ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#161618]/30'}`}
                        onClick={() => handleSelectMember(debtor)}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              {debtor.firstName[0]}
                            </div>
                            <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors">{debtor.firstName} {debtor.lastName || ""}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-zinc-400 font-mono">{debtor.phone}</td>
                        <td className="px-6 py-3.5 text-right"><span className="font-bold text-red-400">{debtor.currentDebt.toLocaleString()} ฿</span></td>
                        <td className="px-6 py-3.5 text-center">
                          <Button variant="secondary" size="sm" className="h-8 bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white border border-zinc-700/50 hover:border-indigo-500 transition-all rounded-md font-medium text-xs px-4">
                            รับชำระ
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3 border-t border-zinc-800/80 bg-[#161618] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <p className="text-xs text-zinc-500 font-medium hidden sm:block">
                    แสดงแถวที่ {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredDebtors.length)} จากทั้งหมด {filteredDebtors.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-medium">แสดงหน้าละ:</span>
                    <select
                      className="h-8 bg-[#0A0A0B] border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-xs rounded-lg px-2 outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                      value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    >
                      <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                      <option value={filteredDebtors.length > 0 ? filteredDebtors.length : 100}>ทั้งหมด</option>
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

      {/* ENTERPRISE MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={closeModal}></div>
          <div className="relative w-full max-w-[900px] h-[85vh] max-h-[650px] bg-[#111113] border border-zinc-700/50 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200">
            <button onClick={closeModal} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>

            {/* ฝั่งซ้าย */}
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
                <p className="text-3xl font-black text-white tracking-tight">{selectedMember.currentDebt.toLocaleString()} <span className="text-xl text-red-500">฿</span></p>
              </div>

              <div className="flex items-center gap-2 mb-4 bg-[#161618] p-1 rounded-lg border border-zinc-800/50">
                <button onClick={() => setActiveTab("DEBT")} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "DEBT" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>
                  <FileText className="w-3.5 h-3.5" /> บิลค้างชำระ ({activeBills.length})
                </button>
                <button onClick={() => setActiveTab("HISTORY")} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "HISTORY" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>
                  <History className="w-3.5 h-3.5" /> ประวัติจ่ายคืน
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
                            <div className="space-y-0.5">
                              <p className={`font-semibold text-sm flex items-center gap-2 ${isSelected ? "text-indigo-300" : "text-zinc-200"}`}><Receipt className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-400" : "text-zinc-500"}`} /> {tx.orderId ? `บิล #${tx.orderId}` : "เซ็นยืมหน้าร้าน"}</p>
                              <p className="text-[11px] text-zinc-500 font-mono">{new Date(tx.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })} น.</p>
                            </div>
                            {tx.paidAmount > 0 && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">จ่ายบางส่วนแล้ว</span>}
                          </div>
                          <div className={`flex items-center justify-between mt-1 pt-2 border-t ${isSelected ? "border-indigo-500/20" : "border-zinc-800/50"}`}>
                            <div className="flex gap-3 text-xs">
                              <span className="text-zinc-500">ยอดเดิม: {tx.originalAmount.toLocaleString()}</span>
                              {tx.paidAmount > 0 && <span className="text-emerald-500/80">- จ่ายแล้ว: {tx.paidAmount.toLocaleString()}</span>}
                            </div>
                            <span className={`font-bold text-sm ${isSelected ? "text-indigo-400" : "text-red-400"}`}>ค้าง {tx.remainingAmount.toLocaleString()} ฿</span>
                          </div>
                        </div>
                      );
                    })}
                    {activeBills.length === 0 && <div className="p-6 text-center text-zinc-500 text-sm bg-[#161618] rounded-lg border border-zinc-800/50">ไม่มีบิลค้างชำระ</div>}
                  </div>
                )}

                {/* ประวัติที่ถูกยุบรวม Group เรียบร้อยแล้ว */}
                {activeTab === "HISTORY" && (
                  <div className="flex-1 overflow-y-auto pr-3 space-y-2.5 fancy-scrollbar pb-4">
                    {groupedHistory.map((tx: any, idx: number) => (
                      <div key={`hist-${idx}`} className="p-3.5 rounded-lg bg-emerald-950/10 border border-emerald-900/20 flex justify-between items-center group">
                        <div className="space-y-1">
                          <p className="font-semibold text-emerald-400 text-sm flex items-center gap-2">
                            <Landmark className="w-3.5 h-3.5 text-emerald-500" />
                            {tx.note || "รับชำระเงิน"} {tx.isGrouped && <span className="text-[10px] bg-emerald-500/20 px-1.5 rounded text-emerald-400 ml-1">รวมบิล</span>}
                          </p>
                          <p className="text-[11px] text-zinc-500 font-mono">{new Date(tx.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })} น.</p>
                        </div>
                        <span className="font-bold text-emerald-400 text-sm">+{tx.amount.toLocaleString()} ฿</span>
                      </div>
                    ))}
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
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-600">฿</span>
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