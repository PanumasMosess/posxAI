"use client";

import { DataTablePagination } from "@/components/TablePagination";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
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
import { FileCheck, CalendarIcon, X } from "lucide-react";
import { useState, useMemo } from "react";

// 🟢 นำเข้า UI สำหรับทำ Date Range Picker
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function Data_table_order_comple<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // 🟢 State สำหรับเก็บช่วงวันที่
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredData = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return data;

    return data.filter((item: any) => {
      const shiftData = item.paymentInfo?.shift || {};
      const businessDateRaw =
        shiftData.createdAt || shiftData.startTime || item.updatedAt;

      if (!businessDateRaw) return false;

      const itemDate = new Date(businessDateRaw);
      itemDate.setHours(0, 0, 0, 0);

      let isAfterStart = true;
      let isBeforeEnd = true;

      if (dateRange.from) {
        const start = new Date(dateRange.from);
        start.setHours(0, 0, 0, 0);
        isAfterStart = itemDate >= start;
      }

      if (dateRange.to) {
        const end = new Date(dateRange.to);
        end.setHours(0, 0, 0, 0);
        isBeforeEnd = itemDate <= end;
      }

      // ถ้าระบุแค่วันเริ่มต้น ให้หาเฉพาะวันนั้น
      if (dateRange.from && !dateRange.to) {
        return (
          itemDate.getTime() === new Date(dateRange.from).setHours(0, 0, 0, 0)
        );
      }

      return isAfterStart && isBeforeEnd;
    });
  }, [data, dateRange]);

  const table = useReactTable({
    data: filteredData,
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
        pageSize: 30,
      },
    },
  });

  const totalSum = useMemo(() => {
    return table.getFilteredRowModel().rows.reduce((sum, row) => {
      return sum + (Number((row.original as any).price_sum) || 0);
    }, 0);
  }, [table.getFilteredRowModel().rows]);

  const todayTotal = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    return data.reduce((sum, item: any) => {
      const shiftData = item.paymentInfo?.shift || {};
      const businessDateRaw =
        shiftData.createdAt || shiftData.startTime || item.updatedAt;

      if (!businessDateRaw) return sum;

      const itemDate = new Date(businessDateRaw);
      const itemDateStr = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}-${String(itemDate.getDate()).padStart(2, "0")}`;

      if (itemDateStr === todayStr) {
        return sum + (Number(item.price_sum) || 0);
      }
      return sum;
    }, 0);
  }, [data]);

  const currencyLabel = useMemo(() => {
    const firstRow = table.getFilteredRowModel().rows[0]?.original as any;
    return firstRow?.currencyLabel || "บาท";
  }, [table.getFilteredRowModel().rows]);

  return (
    <>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between py-6 gap-4">
        {/* หัวข้อ */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50">
            <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
              ประวัติรายการที่ขายแล้ว
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              รายการออเดอร์ที่เสร็จสมบูรณ์ทั้งหมด
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-wrap justify-end">
          {/* กล่องแสดงยอดขาย */}
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 w-full sm:w-auto justify-center">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              ยอดขายวันนี้:
            </span>
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400">
              {todayTotal.toLocaleString()}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-normal">
              {currencyLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 w-full sm:w-auto justify-center">
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              ยอดตามการค้นหา:
            </span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {totalSum.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-normal">
              {currencyLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* 🟢 ตัวเลือกช่วงวันที่แบบ Popover ปฏิทินตัวเดียว */}
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[260px] justify-start text-left font-normal bg-white dark:bg-zinc-950",
                      !dateRange && "text-zinc-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM yyyy", {
                            locale: th,
                          })}{" "}
                          -{" "}
                          {format(dateRange.to, "dd MMM yyyy", { locale: th })}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM yyyy", { locale: th })
                      )
                    ) : (
                      <span>เลือกช่วงวันที่...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {/* ปุ่มเคลียร์วันที่ */}
              {dateRange?.from && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDateRange(undefined)}
                  className="h-9 w-9 text-zinc-400 hover:text-red-500 shrink-0"
                  title="ล้างการค้นหาวันที่"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Input
              placeholder="ค้นหา..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-full sm:w-[200px]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-zinc-950">
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
                  className="h-24 text-center text-zinc-500"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {table.getRowModel().rows?.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-right py-4 bg-zinc-50/50 dark:bg-zinc-900/50"
                >
                  <span className="text-base font-medium text-zinc-600 dark:text-zinc-400">
                    ยอดสุทธิรวม (ที่แสดงอยู่):{" "}
                  </span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 ml-2">
                    {totalSum.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal ml-1">
                    {currencyLabel}
                  </span>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
        <DataTablePagination table={table} />
      </div>
    </>
  );
}
