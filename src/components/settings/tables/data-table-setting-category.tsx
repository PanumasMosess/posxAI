"use client";

import { DataTablePagination } from "@/components/TablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, SortingState, useReactTable,
} from "@tanstack/react-table";
import { Tags, Plus, Search, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createCategory } from "@/lib/actions/actionAccounting";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  userId: number;
  organizationId: number;
}

export function Data_table_setting_category<TData, TValue>({
  columns, data, userId, organizationId,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [openAddSheet, setOpenAddSheet] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  
  // State สำหรับฟอร์มเพิ่มหมวดหมู่
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("EXPENSE");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAddCategory = async () => {
    if (!newName.trim()) return toast.error("กรุณากรอกชื่อหมวดหมู่");
    setIsLoading(true);
    const res = await createCategory({ name: newName, type: newType, organizationId });
    if (res.success) {
      toast.success("เพิ่มหมวดหมู่สำเร็จ");
      setNewName("");
      setOpenAddSheet(false);
      router.refresh();
    } else {
      toast.error("เพิ่มหมวดหมู่ไม่สำเร็จ");
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
            <Tags className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">หมวดหมู่รายรับ-รายจ่าย</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">แสดงรายการหมวดหมู่รายรับและรายจ่ายทั้งหมดในระบบ</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input placeholder="ค้นหาหมวดหมู่..." value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9 w-full sm:w-[250px]" />
          </div>

          <Sheet open={openAddSheet} onOpenChange={setOpenAddSheet}>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:text-zinc-100">
                <Plus className="h-4 w-4 mr-2" /> เพิ่มหมวดหมู่
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
              <SheetHeader className="px-6 pt-6 pb-4"><SheetTitle>เพิ่มหมวดหมู่ใหม่</SheetTitle></SheetHeader>
              <div className="flex-1 px-6 py-4 space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">ประเภท</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    value={newType} onChange={(e) => setNewType(e.target.value)}
                  >
                    <option value="EXPENSE">รายจ่าย (Expense)</option>
                    <option value="INCOME">รายรับ (Income)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">ชื่อหมวดหมู่</label>
                  <Input placeholder="เช่น ค่าวัตถุดิบ, ค่าไฟ, รายได้อื่นๆ" value={newName} onChange={(e) => setNewName(e.target.value)} disabled={isLoading} />
                </div>
              </div>
              <SheetFooter className="p-6 border-t border-zinc-200 dark:border-zinc-800">
                <Button onClick={handleAddCategory} disabled={isLoading} className="w-full">
                  {isLoading ? "กำลังบันทึก..." : <><Save className="w-4 h-4 mr-2" /> บันทึก</>}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
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
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">ไม่พบข้อมูล</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination table={table} />
      </div>
    </>
  );
}