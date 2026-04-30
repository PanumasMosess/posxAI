"use client";

// ✅ เปลี่ยนมานำเข้าฟอร์มของ Employee Pin แทน
import SettingFormEmployeePin from "@/components/forms/SettingFormEmployeePin";
import { DataTablePagination } from "@/components/TablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
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
import {  Plus, Search, ShieldCheck } from "lucide-react"; 
import { useState } from "react";
import { PositionType } from "@/lib/type"; 

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  userId: number;
  organizationId: number;
  positions?: PositionType[]; 
}

export function Data_table_setting_employee_pin<TData, TValue>({
  columns,
  data,
  userId,
  organizationId,
  positions = [],
}: DataTableProps<TData, TValue>) {
  const [openSheetInsertEmployee, setOpenSheetInsertEmployee] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

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
    autoResetPageIndex: false,
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
      <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
              จัดการพนักงาน (ระบบ PIN)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              เพิ่ม แก้ไข และตรวจสอบข้อมูลพนักงานและรหัสเข้าใช้งาน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="ค้นหา (ชื่อ, Username)..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9 w-full sm:w-[250px]"
              autoComplete="off"
            />
          </div>
          <Sheet
            open={openSheetInsertEmployee}
            onOpenChange={setOpenSheetInsertEmployee}
          >
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="border-zinc-200 text-zinc-700 
                        hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100
                        dark:border-zinc-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มพนักงาน
              </Button>
            </SheetTrigger>

            <SettingFormEmployeePin
              type={"create"}
              currentUserId={userId}
              organizationId={organizationId ?? 1}
              stateSheet={setOpenSheetInsertEmployee}
              stateForm={false}
              positions={positions} 
            />
          </Sheet>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  ไม่พบข้อมูลพนักงาน
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination table={table} />
      </div>
    </>
  );
}