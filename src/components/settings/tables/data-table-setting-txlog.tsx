"use client";

import { DataTablePagination } from "@/components/TablePagination";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, SortingState, useReactTable,
} from "@tanstack/react-table";
import { ScrollText, Search } from "lucide-react";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;       // 🔥 เพิ่มบรรทัดนี้
  subtitle?: string;    // 🔥 เพิ่มบรรทัดนี้
}

export function Data_table_setting_txlog<TData, TValue>({
columns, data, title, subtitle
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

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

  return (
    <>
      
<div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* ... */}
          <div className="flex flex-col">
            {/* 2. นำ title และ subtitle มาแสดงผล (ถ้าไม่ส่งมา ให้ใช้คำเดิม) */}
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
              {title || "ประวัติจัดการเงินในบัญชี"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {subtitle || "ประวัติการปรับเพิ่ม ลด และโอนเงินจากเมนูตั้งค่า"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="ค้นหารายการ, ชื่อบัญชี..." 
              value={globalFilter ?? ""} 
              onChange={(e) => setGlobalFilter(e.target.value)} 
              className="pl-9 w-full sm:w-[300px]" 
            />
          </div>
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
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">ไม่พบประวัติการทำรายการ</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination table={table} />
      </div>
    </>
  );
}