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
import { Star, CalendarIcon, X, Clock, Printer } from "lucide-react";
import { useState, useMemo } from "react";

import { format, startOfDay, endOfDay } from "date-fns";
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
import { printPRRank } from "@/lib/printers/qz-pr-rank"; 

interface DataTablePRProps {
  columns: ColumnDef<RankedPRItem, any>[];
  data: any[];
  printerName: string;
}

export function DataTablePRRank({
  columns,
  data,
  printerName,
}: DataTablePRProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [selectedShiftSeq, setSelectedShiftSeq] = useState<string>("All");

  const ordersByDate = useMemo(() => {
    if (!dateRange?.from) return data;

    const filterStart = startOfDay(dateRange.from).getTime();
    const filterEnd = dateRange.to
      ? endOfDay(dateRange.to).getTime()
      : endOfDay(dateRange.from).getTime();

    return data.filter((item: any) => {
      if (!item.businessDate) return false;

      const itemTime = new Date(item.businessDate).getTime();
      return itemTime >= filterStart && itemTime <= filterEnd;
    });
  }, [data, dateRange]);

  const availableShifts = useMemo(() => {
    const seqSet = new Set<number>();

    ordersByDate.forEach((item) => {
      if (item.shiftSequence !== null && item.shiftSequence !== undefined) {
        seqSet.add(item.shiftSequence);
      }
    });

    return Array.from(seqSet).sort((a, b) => a - b);
  }, [ordersByDate]);

  const finalOrders = useMemo(() => {
    if (selectedShiftSeq === "All") return ordersByDate;
    return ordersByDate.filter(
      (item: any) => String(item.shiftSequence) === selectedShiftSeq,
    );
  }, [ordersByDate, selectedShiftSeq]);

  const rankedPR = useMemo(() => {
    const prMap = new Map();
    finalOrders.forEach((ent: any) => {
      const key = ent.id;
      if (!prMap.has(key)) {
        prMap.set(key, {
          id: key,
          name: ent.name,
          image: ent.image,
          quantity: 0,
          price_sum: 0,
          currencyLabel: ent.currencyLabel || "LAK", 
        });
      }
      prMap.get(key).quantity += ent.quantity;
      prMap.get(key).price_sum += ent.price_sum || 0; 
    });
    return Array.from(prMap.values()).sort((a, b) => b.quantity - a.quantity);
  }, [finalOrders]);

  const table = useReactTable({
    data: rankedPR,
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

  const handlePrint = async () => {
    if (!printerName) {
      alert("กรุณาเลือกเครื่องปริ้นก่อนทำรายการ");
      return;
    }

    try {
      await printPRRank({
        printerName,
        dateRange,
        selectedShiftSeq,
        rankedPR,
      });
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถปริ้นได้ โปรดตรวจสอบการเชื่อมต่อ QZ Tray");
    }
  };

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

        <div className="flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {/* Calendar UI */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal",
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
                      <span>เลือกวันที่...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      setSelectedShiftSeq("All");
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              {dateRange?.from && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setDateRange(undefined);
                    setSelectedShiftSeq("All");
                  }}
                  className="h-9 w-9 shrink-0 text-zinc-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* เลือกกะ */}
            {dateRange?.from && (
              <div className="relative w-full sm:w-[130px]">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <select
                  value={selectedShiftSeq}
                  onChange={(e) => setSelectedShiftSeq(e.target.value)}
                  disabled={availableShifts.length === 0}
                  className="h-10 w-full appearance-none rounded-md border border-zinc-200 bg-white pl-9 pr-8 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-900"
                >
                  <option value="All">
                    {availableShifts.length === 0 ? "ไม่มีกะ" : "รวมทุกกะ"}
                  </option>
                  {availableShifts.map((seq) => (
                    <option key={seq} value={String(seq)}>
                      กะที่ {seq}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Input
            placeholder="ค้นหาชื่อ PR..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full sm:w-[200px]"
          />

          <Button
            onClick={handlePrint}
            disabled={!dateRange?.from || rankedPR.length === 0 || !printerName}
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900"
          >
            <Printer className="mr-2 h-4 w-4" />
            พิมพ์สรุป
          </Button>
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
