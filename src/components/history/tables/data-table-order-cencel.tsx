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
import { Ban, CalendarIcon, X } from "lucide-react";
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function Data_table_order_cancel<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredData = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return data;

    return data.filter((item: any) => {
      if (!item.updatedAt) return false;
      
      const itemDate = new Date(item.updatedAt);
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
        return itemDate.getTime() === new Date(dateRange.from).setHours(0, 0, 0, 0);
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
        pageSize: 10,
      },
    },
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50">
            <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>

          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
              รายการที่ถูกยกเลิก
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ประวัติออเดอร์ที่ถูกยกเลิกทั้งหมด
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* 🟢 ตัวเลือกช่วงวันที่แบบ Popover ปฏิทินตัวเดียว */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[260px] justify-start text-left font-normal bg-white dark:bg-zinc-950",
                    !dateRange && "text-zinc-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd MMM yyyy", { locale: th })} -{" "}
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

            {/* ปุ่มเคลียร์วันที่ (จะโผล่มาเมื่อมีการเลือกวันที่เท่านั้น) */}
            {dateRange?.from && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setDateRange(undefined)}
                className="h-9 w-9 text-zinc-400 hover:text-red-500"
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
                            header.getContext()
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
                        cell.getContext()
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
        </Table>
        <DataTablePagination table={table} />
      </div>
    </>
  );
}