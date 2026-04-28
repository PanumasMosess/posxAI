"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, CalendarDays, Wallet, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTablePagination } from "@/components/TablePagination";
import { column_member_transaction } from "./tables/column_member_transaction"; 
import { MemberTransactionProps } from "@/lib/type";

const MemberTransection = ({ data = [] }: MemberTransactionProps) => {
  const [phoneSearch, setPhoneSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ กรองข้อมูลแบบเรียลไทม์
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const memberPhone = item.member?.phone || "";
      const matchPhone = memberPhone.includes(phoneSearch.trim());

      let matchDate = true;
      const itemDate = new Date(item.createdAt);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start) matchDate = false;
      }

      if (endDate && matchDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) matchDate = false;
      }

      return matchPhone && matchDate;
    });
  }, [data, phoneSearch, startDate, endDate]);

  // ✅ คำนวณสรุปยอดความเคลื่อนไหว (จากข้อมูลที่ถูกค้นหาเท่านั้น)
  const summary = useMemo(() => {
    let netCredit = 0;
    let netPoint = 0;

    filteredData.forEach((item) => {
      const amt = Number(item.amount) || 0;
      if (item.walletType === "CREDIT") {
        netCredit += amt;
      } else if (item.walletType === "POINT") {
        netPoint += amt;
      }
    });

    return { netCredit, netPoint };
  }, [filteredData]);

  const table = useReactTable({
    data: filteredData,
    columns: column_member_transaction,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4 w-full">
      {/* 🔍 ส่วนค้นหาและกรองข้อมูล */}
      <div className="flex flex-col xl:flex-row gap-3 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="ค้นหาด้วยเบอร์โทรศัพท์..."
            className="pl-10 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-emerald-500"
            value={phoneSearch}
            onChange={(e) =>
              setPhoneSearch(e.target.value.replace(/[^0-9]/g, ""))
            }
            maxLength={10}
          />
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-40 xl:w-44">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="date"
              className="pl-10 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-emerald-500 text-xs sm:text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="ตั้งแต่วันที่"
            />
          </div>
          <span className="text-zinc-400 font-medium">-</span>
          <div className="relative flex-1 sm:w-40 xl:w-44">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="date"
              className="pl-10 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-emerald-500 text-xs sm:text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="ถึงวันที่"
              min={startDate}
            />
          </div>
        </div>
      </div>

      {/* 📊 ตารางแสดงผล */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-zinc-200 dark:border-zinc-800"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-zinc-500 dark:text-zinc-400"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
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
                  colSpan={column_member_transaction.length}
                  className="h-32 text-center text-zinc-500 dark:text-zinc-400"
                >
                  ไม่พบข้อมูลประวัติการทำรายการ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <DataTablePagination table={table} />
        </div>
      </div>

      {/* 💰 กล่องสรุปยอด (อัปเดตอัตโนมัติตามการค้นหา) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg text-blue-600 dark:text-blue-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                ยอดรวมเครดิต
              </p>
              <p className="text-[10px] text-zinc-500">ความเคลื่อนไหวสุทธิ</p>
            </div>
          </div>
          <p
            className={`text-2xl font-black ${
              summary.netCredit >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {summary.netCredit > 0 ? "+" : ""}
            {summary.netCredit.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-sm font-medium text-zinc-500">฿</span>
          </p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                ยอดรวมแต้มสะสม
              </p>
              <p className="text-[10px] text-zinc-500">ความเคลื่อนไหวสุทธิ</p>
            </div>
          </div>
          <p
            className={`text-2xl font-black ${
              summary.netPoint >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {summary.netPoint > 0 ? "+" : ""}
            {summary.netPoint.toLocaleString()}{" "}
            <span className="text-sm font-medium text-zinc-500">Pts</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberTransection;
