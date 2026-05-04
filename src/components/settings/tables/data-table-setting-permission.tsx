"use client";

import { DataTablePagination } from "@/components/TablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import SettingFormPermission from "@/components/forms/SettingFormPermission";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Shield, Plus, Search } from "lucide-react";
import { useState } from "react";
import { DataTableProps } from "@/lib/type";

export function Data_table_setting_permission<TData, TValue>({
  columns,
  data,
  userId,
  organizationId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [openSheetInsertPermission, setOpenSheetInsertPermission] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <>
      {/* 🔥 Header แบบเดียวกับ position */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
              จัดการสิทธิ
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              จัดการสิทธิ์การใช้งานทั้งหมดในระบบ
            </p>
          </div>
        </div>

        {/* 🔍 Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="ค้นหาสิทธิ..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 w-full sm:w-[250px]"
            />
          </div>

          {/* ➕ ปุ่มเพิ่ม (ไว้ทำทีหลังก็ได้) */}
          <Sheet
            open={openSheetInsertPermission}
            onOpenChange={setOpenSheetInsertPermission}
          >
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="border-zinc-200 text-zinc-700 
      hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100
      dark:border-zinc-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มสิทธิ
              </Button>
            </SheetTrigger>

            <SettingFormPermission
              type={"create"}
              organizationId={organizationId ?? 1}
              stateSheet={setOpenSheetInsertPermission}
              stateForm={openSheetInsertPermission}
            />
          </Sheet>
        </div>
      </div>

      {/* 🔥 Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  ไม่พบข้อมูลสิทธิ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* 🔥 Pagination */}
        <DataTablePagination table={table} />
      </div>
    </>
  );
}