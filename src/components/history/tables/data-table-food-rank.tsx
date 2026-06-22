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
import { UtensilsCrossed, CalendarIcon, X, Clock } from "lucide-react";
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

  // State สำหรับกะที่เลือก
  const [selectedShiftSeq, setSelectedShiftSeq] = useState<string>("All");

  // 🟢 1. แยกข้อมูลอาหาร (Flatten) ออกมาจากก้อน payment group
  const rawFoods = useMemo(() => {
    const foods: any[] = [];
    data.forEach((group: any) => {
      const bDate = group.businessDate;
      const sSeq = group.shiftSequence;

      if (group.foodList && Array.isArray(group.foodList)) {
        group.foodList.forEach((food: any) => {
          foods.push({
            name: food.name,
            image: food.image,
            quantity: food.quantity || 1,
            categoryName: food.categoryName || "ไม่มีหมวดหมู่",
            price: food.price || 0,
            businessDate: bDate,
            shiftSequence: sSeq,
          });
        });
      }
    });
    return foods;
  }, [data]);

  // 🟢 2. กรองข้อมูลจาก "อาหารเดี่ยว" ด้วยวันที่
  // (ใช้วิธีเปรียบเทียบแบบ Time Value เพื่อตัดปัญหา Timezone เพี้ยน 100%)
  const ordersByDate = useMemo(() => {
    if (!dateRange?.from) return rawFoods;

    const filterStart = startOfDay(dateRange.from).getTime();
    const filterEnd = dateRange.to
      ? endOfDay(dateRange.to).getTime()
      : endOfDay(dateRange.from).getTime();

    return rawFoods.filter((item: any) => {
      if (!item.businessDate) return false;
      const itemTime = new Date(item.businessDate).getTime();
      return itemTime >= filterStart && itemTime <= filterEnd;
    });
  }, [rawFoods, dateRange]);

  // 🟢 3. ดึงลำดับกะ (shiftSequence) เฉพาะของวันที่เลือกมาสร้างเป็น Dropdown
  const availableShifts = useMemo(() => {
    const seqSet = new Set<number>();

    ordersByDate.forEach((item: any) => {
      if (item.shiftSequence !== null && item.shiftSequence !== undefined) {
        seqSet.add(item.shiftSequence);
      }
    });

    return Array.from(seqSet).sort((a, b) => a - b);
  }, [ordersByDate]);

  // 🟢 4. กรองข้อมูลรอบสุดท้ายด้วยหมายเลขกะที่เลือก
  const finalOrdersByShift = useMemo(() => {
    if (selectedShiftSeq === "All") return ordersByDate;
    return ordersByDate.filter((item: any) => {
      return String(item.shiftSequence) === selectedShiftSeq;
    });
  }, [ordersByDate, selectedShiftSeq]);

  // 🟢 5. นำอาหารที่กรองวัน/กะเสร็จแล้ว มารวมยอด (Group By)
  const rankedFood = useMemo(() => {
    const foodMap = new Map();
    finalOrdersByShift.forEach((food: any) => {
      const key = `food_${food.name}`;
      if (!foodMap.has(key)) {
        foodMap.set(key, {
          id: key,
          name: food.name,
          image: food.image,
          quantity: 0,
          categoryName: food.categoryName,
        });
      }
      foodMap.get(key).quantity += food.quantity;
    });
    return Array.from(foodMap.values()).sort((a, b) => b.quantity - a.quantity);
  }, [finalOrdersByShift]);

  // 🟢 6. ดึงรายชื่อหมวดหมู่ทั้งหมด (ยกเว้น Entertainer)
  const categories = useMemo(() => {
    const cats = new Set(
      rankedFood
        .map((f: any) => f.categoryName)
        .filter((cat) => cat && cat !== "Entertainer"),
    );
    return ["All", ...Array.from(cats)];
  }, [rankedFood]);

  // 🟢 7. กรองหมวดหมู่อาหารขั้นสุดท้ายก่อนลงตาราง
  const finalRankedFood = useMemo(() => {
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

        <div className="flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
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
                      setSelectedShiftSeq("All"); // เคลียร์ตัวเลือกกะเมื่อเปลี่ยนวัน
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
                    setSelectedShiftSeq("All"); // เคลียร์ตัวเลือกกะเมื่อลบวันที่
                  }}
                  className="h-9 w-9 shrink-0 text-zinc-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* 🟢 ตัวเลือกกะ: โชว์เมื่อมีกะให้เลือกในวันนั้นๆ */}
            {availableShifts.length > 0 && (
              <div className="relative w-full sm:w-[130px]">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <select
                  value={selectedShiftSeq}
                  onChange={(e) => setSelectedShiftSeq(e.target.value)}
                  className="h-10 w-full appearance-none rounded-md border border-zinc-200 bg-white pl-9 pr-8 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-900"
                >
                  <option value="All">รวมทุกกะ</option>
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
