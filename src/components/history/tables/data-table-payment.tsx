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
import { Receipt, CalendarIcon, X, Printer } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generatePrintSummaryHTML } from "@/lib/printers/summary-shift";
import { useUser } from "@/components/providers/UserContext";
import qz from "qz-tray";
import {
  getCertContentFromS3,
  signDataWithS3Key,
} from "@/lib/actions/actionIndex";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  organizationId: number;
}

const PRINTER_STORAGE_KEY = "pos_selected_printer";

export function Data_table_payment<TData, TValue>({
  columns,
  data,
  organizationId,
}: DataTableProps<TData, TValue>) {
  const { employeeName } = useUser();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedShift, setSelectedShift] = useState<string>("all");

  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");

  useEffect(() => {
    setSelectedShift("all");
  }, [dateRange]);

  const initQZSecurity = useCallback(() => {
    qz.security.setCertificatePromise((resolve: any, reject: any) => {
      getCertContentFromS3(`digital-certificate_${organizationId}.txt`)
        .then((res: any) => {
          if (res.success && res.data) resolve(res.data);
          else reject("Load Cert Failed");
        })
        .catch(reject);
    });

    qz.security.setSignaturePromise((toSign: string) => {
      return function (resolve: any, reject: any) {
        signDataWithS3Key(toSign, organizationId.toString())
          .then((res: any) => {
            if (res.success && res.data) resolve(res.data);
            else reject("Sign Failed");
          })
          .catch(reject);
      };
    });
  }, [organizationId]);

  // ฟังก์ชันสำหรับเซฟการตั้งค่าเมื่อพนักงานเปลี่ยนเครื่องปริ้น
  const handlePrinterChange = (printerName: string) => {
    setSelectedPrinter(printerName);
    localStorage.setItem(PRINTER_STORAGE_KEY, printerName);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchPrinters = async () => {
      try {
        if (!qz.websocket.isActive()) {
          initQZSecurity();
          await qz.websocket.connect();
        }
        const list = await qz.printers.find();
        if (isMounted) {
          setPrinters(list);

          if (list.length > 0) {
            const savedPrinter = localStorage.getItem(PRINTER_STORAGE_KEY);

            if (savedPrinter && list.includes(savedPrinter)) {
              setSelectedPrinter(savedPrinter);
            } else {
              setSelectedPrinter(list[0]);
              localStorage.setItem(PRINTER_STORAGE_KEY, list[0]);
            }
          }
        }
      } catch (err) {
        console.error("QZ Error fetching printers:", err);
      }
    };

    fetchPrinters();

    return () => {
      isMounted = false;
    };
  }, [initQZSecurity]);

  const dateFilteredData = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return data;

    return data.filter((item: any) => {
      const shiftData = item.shift || {};
      const businessDateRaw =
        shiftData.createdAt || shiftData.startTime || item.createdAt;

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

  const availableShifts = useMemo(() => {
    const shifts = new Set(
      dateFilteredData
        .map((item: any) => item.shift?.shiftSequence)
        .filter(Boolean),
    );
    return Array.from(shifts).sort((a: any, b: any) => Number(a) - Number(b));
  }, [dateFilteredData]);

  const filteredData = useMemo(() => {
    if (selectedShift === "all") return dateFilteredData;
    return dateFilteredData.filter(
      (item: any) => String(item.shift?.shiftSequence) === selectedShift,
    );
  }, [dateFilteredData, selectedShift]);

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

  const { totalSum, filteredBreakdown } = useMemo(() => {
    let total = 0;
    const breakdown = { CASH: 0, QR: 0, MEMBER: 0 };

    table.getFilteredRowModel().rows.forEach((row) => {
      const item = row.original as any;
      const amount = Number(item.totalAmount) || 0;
      total += amount;

      const method = item.paymentMethod?.toUpperCase();
      if (method === "CASH") breakdown.CASH += amount;
      else if (method === "QR") breakdown.QR += amount;
      else if (method === "MEMBER") breakdown.MEMBER += amount;
    });

    return { totalSum: total, filteredBreakdown: breakdown };
  }, [table.getFilteredRowModel().rows]);

  const { todayTotal, todayBreakdown } = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    let total = 0;
    const breakdown = { CASH: 0, QR: 0, MEMBER: 0 };

    data.forEach((item: any) => {
      const shiftData = item.shift || {};
      const businessDateRaw =
        shiftData.createdAt || shiftData.startTime || item.createdAt;

      if (!businessDateRaw) return;

      const itemDate = new Date(businessDateRaw);
      const itemDateStr = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}-${String(itemDate.getDate()).padStart(2, "0")}`;

      if (itemDateStr === todayStr) {
        const amount = Number(item.totalAmount) || 0;
        total += amount;

        const method = item.paymentMethod?.toUpperCase();
        if (method === "CASH") breakdown.CASH += amount;
        else if (method === "QR") breakdown.QR += amount;
        else if (method === "MEMBER") breakdown.MEMBER += amount;
      }
    });

    return { todayTotal: total, todayBreakdown: breakdown };
  }, [data]);

  const currencyLabel = useMemo(() => {
    const firstRow = table.getFilteredRowModel().rows[0]?.original as any;
    return firstRow?.runningRef?.order?.[0]?.menu?.unitPrice?.label || "บาท";
  }, [table.getFilteredRowModel().rows]);

  const handlePrintSummary = async () => {
    if (!selectedPrinter) {
      alert("กรุณาเลือกเครื่องพิมพ์ก่อนครับ");
      return;
    }

    let dateText = "ทั้งหมด";
    if (dateRange?.from) {
      dateText = format(dateRange.from, "dd MMM yyyy", { locale: th });
      if (dateRange.to) {
        dateText += " - " + format(dateRange.to, "dd MMM yyyy", { locale: th });
      }
    }

    const shiftText =
      selectedShift === "all" ? "ทุกกะ" : `กะที่ ${selectedShift}`;
    const printTime = format(new Date(), "dd/MM/yyyy HH:mm");
    const currentPrinterName = employeeName || "-";

    const printContent = generatePrintSummaryHTML({
      dateText,
      shiftText,
      printTime,
      printerName: currentPrinterName,
      totalSum,
      currencyLabel,
      filteredBreakdown,
    });

    try {
      if (!qz.websocket.isActive()) {
        initQZSecurity();
        await qz.websocket.connect();
      }

      const config = qz.configs.create(selectedPrinter, {
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const printData = [
        {
          type: "pixel",
          format: "html",
          flavor: "plain",
          data: printContent,
          options: {
            pageWidth: 3.15,
          },
        },
      ];

      await qz.print(config, printData);
    } catch (error) {
      console.error("QZ Print Error:", error);
      alert("เกิดข้อผิดพลาดในการสั่งพิมพ์ เช็คการเชื่อมต่อเครื่องพิมพ์ครับ");
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between py-6 gap-4">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50">
            <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
              ประวัติรายการที่จ่ายเงินแล้ว
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              รายการออเดอร์ที่เสร็จสมบูรณ์ทั้งหมด
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto flex-wrap justify-end">
          <div className="flex flex-col bg-blue-50 dark:bg-blue-900/20 px-4 py-2.5 rounded-lg border border-blue-200 dark:border-blue-800 w-full sm:w-auto min-w-[200px]">
            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
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
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-1.5 text-xs font-semibold text-blue-600/90 dark:text-blue-400/90">
              <span>CASH: {todayBreakdown.CASH.toLocaleString()}</span>
              <span className="opacity-40">|</span>
              <span>QR: {todayBreakdown.QR.toLocaleString()}</span>
              <span className="opacity-40">|</span>
              <span>MEM: {todayBreakdown.MEMBER.toLocaleString()}</span>
            </div>
          </div>

          <div className="relative flex flex-col bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 w-full sm:w-auto min-w-[200px]">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePrintSummary}
              className="absolute top-1.5 right-1.5 h-7 w-7 text-emerald-600 hover:bg-emerald-200 dark:hover:bg-emerald-800/50"
              title="พิมพ์สรุปยอดนี้ออกเครื่องปริ้น"
            >
              <Printer className="h-4 w-4" />
            </Button>

            <div className="flex items-baseline gap-2 justify-center sm:justify-start pr-6">
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

            <div className="flex items-center justify-center sm:justify-start gap-3 mt-1.5 text-xs font-semibold text-emerald-600/90 dark:text-emerald-400/90">
              <span>CASH: {filteredBreakdown.CASH.toLocaleString()}</span>
              <span className="opacity-40">|</span>
              <span>QR: {filteredBreakdown.QR.toLocaleString()}</span>
              <span className="opacity-40">|</span>
              <span>MEM: {filteredBreakdown.MEMBER.toLocaleString()}</span>
            </div>

            <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between gap-2">
              <span className="text-xs text-emerald-700 dark:text-emerald-400">
                เครื่องพิมพ์:
              </span>
              <Select
                value={selectedPrinter}
                onValueChange={handlePrinterChange}
              >
                <SelectTrigger className="h-6 text-xs w-[140px] bg-white dark:bg-zinc-950 border-emerald-200 dark:border-emerald-800">
                  <SelectValue placeholder="เลือกเครื่องพิมพ์" />
                </SelectTrigger>
                <SelectContent>
                  {printers.length > 0 ? (
                    printers.map((p) => (
                      <SelectItem key={p} value={p} className="text-xs">
                        {p}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled className="text-xs">
                      ไม่พบเครื่องพิมพ์
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal bg-white dark:bg-zinc-950",
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

              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger className="w-[140px] bg-white dark:bg-zinc-950">
                  <SelectValue placeholder="เลือกรอบการขาย" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกกะการทำงาน</SelectItem>
                  {availableShifts.map((shift) => (
                    <SelectItem key={`shift-${shift}`} value={String(shift)}>
                      กะที่ {shift}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="ค้นหา..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-full sm:w-[180px]"
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
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 ml-2">
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
