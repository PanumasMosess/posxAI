import React, { useState, useMemo } from "react";
import { ProfileTableProps } from "@/lib/type";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ProfileTable = ({
  employees,
  currencyLabel,
  period,
}: ProfileTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 🟢 1. ระบบค้นหา (กรองจากชื่อ)
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [employees, searchTerm]);

  // 🟢 2. ระบบแบ่งหน้า (Pagination)
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // รีเซ็ตกลับไปหน้า 1 เสมอเมื่อมีการพิมพ์ค้นหาใหม่
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
      {/* ส่วนค้นหา */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="ค้นหาชื่อพนักงาน..."
            value={searchTerm}
            onChange={handleSearch}
            className="h-9 pl-9 text-sm bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
          />
        </div>
        <div className="text-xs text-zinc-500 hidden sm:block">
          ทั้งหมด {filteredEmployees.length} รายการ
        </div>
      </div>

      {/* ส่วนตาราง */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap w-20 text-center">
                ลำดับ
              </th>
              <th className="px-4 py-3 whitespace-nowrap">ชื่อพนักงาน</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">
                ยอดขาย ({currencyLabel})
              </th>
              <th className="px-4 py-3 text-right whitespace-nowrap">
                จำนวน (รายการ)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {currentEmployees.length > 0 ? (
              currentEmployees.map((emp, index) => {
                const sales =
                  period === "daily"
                    ? emp.todaySales
                    : period === "monthly"
                      ? emp.monthSales
                      : emp.yearSales;
                const items =
                  period === "daily"
                    ? emp.todayItems
                    : period === "monthly"
                      ? emp.monthItems
                      : emp.yearItems;

                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-400 text-center">
                      {startIndex + index + 1}{" "}
                      {/* คำนวณลำดับที่ถูกต้องตามหน้า */}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                      {emp.name}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                      {sales.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      {items.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  ไม่พบข้อมูลที่ค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ส่วนควบคุมหน้า (Pagination) */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
        <p className="text-xs text-zinc-500 font-medium">
          แสดง {filteredEmployees.length === 0 ? 0 : startIndex + 1} ถึง{" "}
          {Math.min(startIndex + ITEMS_PER_PAGE, filteredEmployees.length)} จาก{" "}
          {filteredEmployees.length} รายการ
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 w-16 text-center">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileTable;
