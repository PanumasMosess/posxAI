"use client";

import { DataTablePagination } from "@/components/TablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, SortingState, useReactTable,
} from "@tanstack/react-table";
import { Wallet, Plus, Search, Save, ArrowRightLeft, PlusCircle, MinusCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// เรียกใช้ Action
import { createAccount, adjustAccountBalance, transferMoney, setAccPosPayment } from "@/lib/actions/actionAccounting";
import column_setting_account from "./column_setting_account";

interface DataTableProps {
  data: any[];
  userId: number;
  organizationId: number;
  onUpdateStatus: (id: number, status: string) => void;
  onUpdateName: (id: number, name: string) => void;
}

export function Data_table_setting_account({
  data, userId, organizationId, onUpdateStatus, onUpdateName
}: DataTableProps) {
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // Modal เพิ่มบัญชี
  const [openAdd, setOpenAdd] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountBalance, setNewAccountBalance] = useState("0");

  // Modal โอนเงิน
  const [openTransfer, setOpenTransfer] = useState(false);
  const [targetAccountId, setTargetAccountId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferNote, setTransferNote] = useState("");

  // Modal เพิ่ม/ลดเงิน
  const [openAdjust, setOpenAdjust] = useState(false);
  const [adjustType, setAdjustType] = useState<"IN" | "OUT">("IN");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  const handleOpenTransfer = (account: any) => {
    setSelectedAccount(account);
    setTargetAccountId("");
    setTransferAmount("");
    setTransferNote("");
    setOpenTransfer(true);
  };

  const handleOpenAddMoney = (account: any) => {
    setSelectedAccount(account);
    setAdjustType("IN");
    setAdjustAmount("");
    setAdjustNote("");
    setOpenAdjust(true);
  };

  const handleOpenDeductMoney = (account: any) => {
    setSelectedAccount(account);
    setAdjustType("OUT");
    setAdjustAmount("");
    setAdjustNote("");
    setOpenAdjust(true);
  };

  const handleInlineUpdateBalance = async (accountId: number, newBalance: number) => {
    const res = await adjustAccountBalance(
      accountId,
      newBalance,
      "OVERRIDE",
      "แก้ไขยอดเงินโดยตรงจากตาราง",
      userId,
      organizationId
    );
    if (res.success) {
      toast.success("อัปเดตยอดเงินสำเร็จ");
      router.refresh();
    } else {
      toast.error(res.message || "อัปเดตยอดเงินไม่สำเร็จ");
    }
  };

  const handleAdjustSubmit = async () => {
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) return toast.error("กรุณาระบุจำนวนเงินที่มากกว่า 0");
    if (!selectedAccount) return;

    setIsLoading(true);

    const mode = adjustType === "IN" ? "ADD" : "REDUCE";

    const res = await adjustAccountBalance(
      selectedAccount.id,
      amount,
      mode, 
      adjustNote || (adjustType === "IN" ? "เพิ่มเงินในบัญชี" : "ลดเงินในบัญชี"),
      userId,
      organizationId
    );

    if (res.success) {
      toast.success(adjustType === "IN" ? "เพิ่มเงินสำเร็จ" : "ลดเงินสำเร็จ");
      setOpenAdjust(false);
      router.refresh();
    } else {
      toast.error(res.message || "ทำรายการไม่สำเร็จ");
    }
    setIsLoading(false);
  };

  // 🔥 1. ย้ายฟังก์ชันนี้ขึ้นมาอยู่เหนือตัวแปร columns
  const handleSetAccPosPayment = async (accountId: number) => {
    setIsLoading(true);
    const res = await setAccPosPayment(accountId, organizationId);
    if (res.success) {
      toast.success("เปลี่ยนช่องทางรับเงินหน้าร้านเรียบร้อยแล้ว");
      router.refresh();
    } else {
      toast.error(res.message);
    }
    setIsLoading(false);
  };

  // 🔥 2. สร้าง Columns หลังจากที่ฟังก์ชันทั้งหมดถูกประกาศแล้ว
  const columns = useMemo(() => column_setting_account(
    onUpdateStatus,
    onUpdateName,
    handleInlineUpdateBalance,
    handleOpenTransfer,
    handleOpenAddMoney,    
    handleOpenDeductMoney, 
    handleSetAccPosPayment
  ), [onUpdateStatus, onUpdateName, organizationId, data]);

  // 3. กำหนดค่าลง Table
  const table = useReactTable({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
  });
  
  const handleAddAccount = async () => {
    if (!newAccountName.trim()) return toast.error("กรุณากรอกชื่อบัญชี");
    const initBalance = parseFloat(newAccountBalance) || 0;

    setIsLoading(true);
    const res = await createAccount({
      accountName: newAccountName,
      initialBalance: initBalance,
      organizationId,
      createdById: userId
    });

    if (res.success) {
      toast.success("เพิ่มบัญชีสำเร็จ");
      setNewAccountName("");
      setNewAccountBalance("0");
      setOpenAdd(false);
      router.refresh();
    } else toast.error(res.message || "เพิ่มบัญชีไม่สำเร็จ");
    setIsLoading(false);
  };

  const handleTransferSubmit = async () => {
    const amount = parseFloat(transferAmount);
    const toId = parseInt(targetAccountId);
    if (isNaN(amount) || amount <= 0) return toast.error("กรุณาระบุจำนวนเงินที่มากกว่า 0");
    if (isNaN(toId)) return toast.error("กรุณาเลือกบัญชีปลายทาง");
    if (!selectedAccount) return;

    setIsLoading(true);
    const res = await transferMoney(selectedAccount.id, toId, amount, transferNote, userId, organizationId);
    if (res.success) {
      toast.success(res.message);
      setOpenTransfer(false);
      router.refresh();
    } else toast.error(res.message);
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50">
            <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">จัดการบัญชีการเงิน</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">คลิกที่ ยอดเงินคงเหลือ เพื่อแก้ไขตัวเลขโดยตรง</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input placeholder="ค้นหาบัญชี..." value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9 w-full sm:w-[250px]" />
          </div>

          <Button variant="outline" onClick={() => setOpenAdd(true)} className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:text-zinc-100">
            <Plus className="h-4 w-4 mr-2" /> เพิ่มบัญชี
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((h) => <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">ไม่พบข้อมูลบัญชี</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination table={table} />
      </div>

      {/* ============================================================== */}
      {/* MODAL: เพิ่มบัญชีใหม่ */}
      {/* ============================================================== */}
      <Sheet open={openAdd} onOpenChange={setOpenAdd}>
        <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4"><SheetTitle>เพิ่มบัญชีใหม่</SheetTitle></SheetHeader>
          <div className="flex-1 px-6 py-4 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">ชื่อบัญชี / ช่องทางรับเงิน</label>
              <Input placeholder="เช่น ลิ้นชักหน้าร้าน, ธนาคารกสิกรไทย" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} disabled={isLoading} />
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <label className="text-sm font-medium text-green-600">ยอดยกมา / เงินตั้งต้น (ถ้ามี)</label>
              <Input type="number" placeholder="0.00" value={newAccountBalance} onChange={(e) => setNewAccountBalance(e.target.value)} disabled={isLoading} className="text-lg font-bold text-green-700 border-green-200" />
            </div>
          </div>
          <SheetFooter className="p-6 border-t border-zinc-200 dark:border-zinc-800">
            <Button onClick={handleAddAccount} disabled={isLoading} className="w-full">
              {isLoading ? "กำลังบันทึก..." : <><Save className="w-4 h-4 mr-2" /> บันทึกบัญชี</>}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ============================================================== */}
      {/* MODAL: โอนเงินระหว่างบัญชี */}
      {/* ============================================================== */}
      <Sheet open={openTransfer} onOpenChange={setOpenTransfer}>
        <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-orange-600" />
              โอนเงินระหว่างบัญชี
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
            {selectedAccount && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="text-sm text-orange-600/80">โอนเงินออกจากบัญชี</div>
                <div className="text-lg font-bold text-orange-700">{selectedAccount.accountName}</div>
                <div className="mt-2 text-sm text-orange-600/80">ยอดเงินที่สามารถโอนได้: <span className="font-bold">฿{parseFloat(selectedAccount.balance).toLocaleString("th-TH")}</span></div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">เลือกบัญชีปลายทาง (โอนเข้า)</label>
              <select
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white text-zinc-900 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
                value={targetAccountId} onChange={(e) => setTargetAccountId(e.target.value)} disabled={isLoading}
              >
                <option value="" disabled>-- เลือกบัญชี --</option>
                {data.filter(acc => acc.id !== selectedAccount?.id && acc.status === "ACTIVE").map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.accountName}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">จำนวนเงินที่ต้องการโอน</label>
              <Input type="number" placeholder="0.00" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} disabled={isLoading} className="text-lg font-bold" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">หมายเหตุ</label>
              <Input placeholder="เช่น นำเงินสดเข้าธนาคาร" value={transferNote} onChange={(e) => setTransferNote(e.target.value)} disabled={isLoading} />
            </div>
          </div>
          <SheetFooter className="p-6 border-t border-zinc-200">
            <Button onClick={handleTransferSubmit} disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700">
              {isLoading ? "กำลังประมวลผล..." : "ยืนยันการโอนเงิน"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ============================================================== */}
      {/* 🔥 MODAL: เพิ่ม/ลดเงินในบัญชี (อันใหม่) */}
      {/* ============================================================== */}
      <Sheet open={openAdjust} onOpenChange={setOpenAdjust}>
        <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              {adjustType === "IN" ? (
                <><PlusCircle className="w-5 h-5 text-emerald-600" /> เพิ่มเงินเข้าบัญชี</>
              ) : (
                <><MinusCircle className="w-5 h-5 text-red-600" /> ลดเงินจากบัญชี</>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
            {selectedAccount && (
              <div className={`p-4 rounded-lg border ${adjustType === "IN" ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                <div className={`text-sm ${adjustType === "IN" ? "text-emerald-600/80" : "text-red-600/80"}`}>
                  ทำรายการสำหรับบัญชี
                </div>
                <div className={`text-lg font-bold ${adjustType === "IN" ? "text-emerald-700" : "text-red-700"}`}>
                  {selectedAccount.accountName}
                </div>
                <div className={`mt-2 text-sm ${adjustType === "IN" ? "text-emerald-600/80" : "text-red-600/80"}`}>
                  ยอดเงินปัจจุบัน: <span className="font-bold">฿{parseFloat(selectedAccount.balance).toLocaleString("th-TH")}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">จำนวนเงิน</label>
              <Input
                type="number"
                placeholder="0.00"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                disabled={isLoading}
                className={`text-lg font-bold ${adjustType === "IN" ? "border-emerald-200 text-emerald-700 focus-visible:ring-emerald-500" : "border-red-200 text-red-700 focus-visible:ring-red-500"}`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">หมายเหตุ (สาเหตุการ{adjustType === "IN" ? "เพิ่ม" : "ลด"}เงิน)</label>
              <Input
                placeholder={adjustType === "IN" ? "เช่น เงินทอนตั้งต้นประจำวัน" : "เช่น ถอนเงินไปใช้จ่ายอื่นๆ"}
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <SheetFooter className="p-6 border-t border-zinc-200">
            <Button
              onClick={handleAdjustSubmit}
              disabled={isLoading}
              className={`w-full ${adjustType === "IN" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
            >
              {isLoading ? "กำลังประมวลผล..." : (adjustType === "IN" ? "ยืนยันการเพิ่มเงิน" : "ยืนยันการลดเงิน")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}