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
import { Star, CalendarIcon, X } from "lucide-react";
import { useState, useMemo } from "react";

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
import { RankedPRItem } from "./column_pr_rank";

interface DataTablePRProps {
  columns: ColumnDef<RankedPRItem, any>[];
  data: RankedPRItem[];
}

export function DataTablePRRank({ columns, data }: DataTablePRProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  // หมายเหตุ: หากต้องการกรองวันที่ในฝั่ง Client จริงๆ ข้อมูล 'data' จาก page.tsx
  // จะต้องส่งวันที่ของแต่ละ order มาด้วย แต่ตอนนี้เราสรุปรวมเป็นรายคนไปแล้ว
  // การกรองวันที่ในฝั่ง Client ด้วยข้อมูลที่สรุปแล้วจะไม่สามารถทำได้แบบเป๊ะๆ
  // แนะนำให้ส่ง Filter วันที่ไปกรองที่ Database ใน page.tsx แทนครับ
  // แต่ผมจะคง UI ส่วน Calendar ไว้ให้เหมือนเดิมครับ
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // 🟢 ใช้ data ที่รับเข้ามาตรงๆ ได้เลย เพราะมันถูกสรุปยอดมาจาก page.tsx แล้ว
  const table = useReactTable({
    data: data,
    columns: columns,
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
    <div className="rounded-2xl border bg-white dark:bg-zinc-950 p-4 shadow-sm flex flex-col gap-4">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-50 text-pink-600 border border-pink-200">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
              อันดับ Entertainer (PR)
            </h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          {/* Calendar UI */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !dateRange && "text-zinc-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, "dd MMM yy", { locale: th })} - ${format(dateRange.to, "dd MMM yy", { locale: th })}`
                    ) : (
                      format(dateRange.from, "dd MMM yy", { locale: th })
                    )
                  ) : (
                    <span>ช่วงวันที่...</span>
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
            {dateRange?.from && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDateRange(undefined)}
                className="h-9 w-9 text-zinc-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Input
            placeholder="ค้นหาชื่อ PR..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full sm:w-[200px]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-zinc-50 dark:bg-zinc-900">
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
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
                  ไม่พบข้อมูล PR
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
