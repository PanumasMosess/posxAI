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
import { UtensilsCrossed, CalendarIcon, X } from "lucide-react";
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
import { RankedItem } from "./column_food_rank";

interface DataTableFoodProps {
  columns: ColumnDef<RankedItem, any>[];
  data: any[];
}

export function DataTableFoodRank({ columns, data }: DataTableFoodProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const filteredOrders = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return data;

    return data.filter((item: any) => {
      const shiftData = item.paymentInfo?.shift || {};
      const businessDateRaw =
        shiftData.createdAt ||
        shiftData.startTime ||
        item.updatedAt ||
        item.createdAt;
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
      if (dateRange.from && !dateRange.to) {
        return (
          itemDate.getTime() === new Date(dateRange.from).setHours(0, 0, 0, 0)
        );
      }
      return isAfterStart && isBeforeEnd;
    });
  }, [data, dateRange]);

  const rankedFood = useMemo(() => {
    const foodMap = new Map();
    filteredOrders.forEach((order: any) => {
      (order.foodList || []).forEach((food: any) => {
        const key = `food_${food.name}`;
        if (!foodMap.has(key)) {
          foodMap.set(key, {
            id: key,
            name: food.name,
            image: food.image,
            quantity: 0,
            categoryName: food.categoryName || "ไม่มีหมวดหมู่",
          });
        }
        foodMap.get(key).quantity += food.quantity || 1;
      });
    });
    return Array.from(foodMap.values()).sort((a, b) => b.quantity - a.quantity);
  }, [filteredOrders]);

  // 🟢 1. ดึงรายชื่อหมวดหมู่ทั้งหมด แต่ตัด "Entertainer" ออกไป
  const categories = useMemo(() => {
    const cats = new Set(
      rankedFood
        .map((f: any) => f.categoryName)
        .filter((cat) => cat && cat !== "Entertainer"), // 👈 ดักเอา Entertainer ออกตรงนี้
    );
    return ["All", ...Array.from(cats)];
  }, [rankedFood]);

  // 🟢 2. กรองข้อมูลไม่ให้แสดงรายการอาหารที่เป็นของ Entertainer ในตารางอาหารนี้
  const finalRankedFood = useMemo(() => {
    // กรองเอาตารางหลักที่ไม่ใช่ Entertainer ไว้ก่อนเสมอ
    const foodWithoutEntertainer = rankedFood.filter(
      (f: any) => f.categoryName !== "Entertainer",
    );

    if (categoryFilter === "All") return foodWithoutEntertainer;
    return foodWithoutEntertainer.filter(
      (f: any) => f.categoryName === categoryFilter,
    );
  }, [rankedFood, categoryFilter]);

  const table = useReactTable({
    data: finalRankedFood,
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
          <div className="p-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
              อันดับเมนูอาหารขายดี
            </h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 w-full sm:w-[150px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {categories.map((cat: any) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "ทุกหมวดหมู่" : cat}
              </option>
            ))}
          </select>

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
                className="h-9 w-9 shrink-0 text-zinc-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Input
            placeholder="ค้นหาเมนู..."
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
                  ไม่พบข้อมูลอาหาร
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
