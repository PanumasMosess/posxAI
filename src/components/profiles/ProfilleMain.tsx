"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  BarChart3,
  UserCircle2,
  Search,
  LayoutGrid,
  TableProperties,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { useUser } from "@/components/providers/UserContext";
import { ProfilleMainProps } from "@/lib/type";

import SalesSummary from "./SalesSummary";
import OrderCard from "./OrderCard";
import { Input } from "../ui/input";
import ProfileTable from "./ProfileTable";

const ProfilleMain = ({ orders, allEmployees = [] }: ProfilleMainProps) => {
  const { employeeId, positionName } = useUser();

  const isAdmin = ["Admin", "admin", "Spadmin", "spadmin"].includes(
    positionName || "",
  );

  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    isAdmin ? "ALL" : String(employeeId),
  );

  const [empSearch, setEmpSearch] = useState("");
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("daily");

  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [displayLimit, setDisplayLimit] = useState(10);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const filteredEmployees = allEmployees.filter((emp) =>
    `${emp.name} ${emp.surname}`
      .toLowerCase()
      .includes(empSearch.toLowerCase()),
  );

  const {
    dailyData,
    monthlyData,
    yearlyData,
    todayTotal,
    yesterdayTotal,
    thisMonthTotal,
    lastMonthTotal,
    thisYearTotal,
    lastYearTotal,
    employeeStats,
  } = useMemo(() => {
    // 🟢 บังคับใช้ "เวลาปัจจุบันจริงๆ (Real Time)" ห้ามไปเดาเวลาจากกะเก่าเด็ดขาด
    const realNow = new Date();

    const todayMillis = new Date(
      realNow.getFullYear(),
      realNow.getMonth(),
      realNow.getDate(),
    ).getTime();

    const yesterdayMillis = todayMillis - 86400000;

    const thisMonth = realNow.getMonth();
    const thisYear = realNow.getFullYear();
    const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let tTotal = 0;
    let yTotal = 0;
    let tmTotal = 0;
    let lmTotal = 0;
    let tyTotal = 0;
    let lyTotal = 0;

    const empStatsMap = new Map();
    allEmployees.forEach((emp) => {
      empStatsMap.set(String(emp.id), {
        id: String(emp.id),
        name: `${emp.name} ${emp.surname}`,
        todaySales: 0,
        monthSales: 0,
        yearSales: 0,
        totalSales: 0,
        todayItems: 0,
        monthItems: 0,
        yearItems: 0,
        totalItems: 0,
      });
    });

    const dData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(todayMillis - (6 - i) * 86400000);
      return {
        name: d.toLocaleDateString("th-TH", { day: "2-digit", month: "short" }),
        timestamp: d.getTime(),
        total: 0,
      };
    });

    const mData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(thisYear, thisMonth - (5 - i), 1);
      return {
        name: d.toLocaleDateString("th-TH", {
          month: "short",
          year: "2-digit",
        }),
        month: d.getMonth(),
        year: d.getFullYear(),
        total: 0,
      };
    });

    const yData = Array.from({ length: 3 }, (_, i) => {
      const yearTarget = thisYear - (2 - i);
      return {
        name: `${yearTarget + 543}`,
        year: yearTarget,
        total: 0,
      };
    });

    orders.forEach((payment: any) => {
      // 🟢 ดึงวันที่ของบิล โดยเช็คจาก "เวลาเปิดกะ (startTime)" ของบิลนั้นๆ อย่างเคร่งครัด
      // ถ้าร้านเปิดกะเมื่อวาน แล้วขายข้ามมาตี 1 ของวันนี้ ยอดจะถูกทบรวมเป็นของเมื่อวานตามเวลาเปิดกะทันที (ไม่ตัด 00:00)
      const referenceDateStr =
        payment.shift?.startTime ||
        payment.shift?.createdAt ||
        payment.createdAt;

      const targetDateObj = new Date(referenceDateStr);

      const timeZero = new Date(
        targetDateObj.getFullYear(),
        targetDateObj.getMonth(),
        targetDateObj.getDate(),
      ).getTime();

      const pMonth = targetDateObj.getMonth();
      const pYear = targetDateObj.getFullYear();

      const billTotal = payment.totalAmount || 0;
      const empId = String(payment.createdById);

      let itemsCount = 0;
      const empItemTotals: Record<string, { sales: number; qty: number }> = {};

      if (payment.runningRef && payment.runningRef.order) {
        payment.runningRef.order.forEach((o: any) => {
          (o.orderitems || []).forEach((item: any) => {
            const itemPrice = item.price_package || item.price || 0;
            const itemTotal = itemPrice * item.quantity;
            itemsCount += item.quantity;

            // หาสิทธิ์เจ้าของยอดขาย
            const specificEmpId = String(
              item.menu?.mcEmployeeId || o.employeeId || empId,
            );
            if (!empItemTotals[specificEmpId]) {
              empItemTotals[specificEmpId] = { sales: 0, qty: 0 };
            }
            empItemTotals[specificEmpId].sales += itemTotal;
            empItemTotals[specificEmpId].qty += item.quantity;
          });
        });
      }

      // กระจายยอดเข้าพนักงาน (ยอดทบรวมข้ามคืน จะวิ่งเข้าช่องวันเดียวกันได้อย่างถูกต้อง)
      Object.entries(empItemTotals).forEach(([eId, data]) => {
        if (empStatsMap.has(eId)) {
          const stat = empStatsMap.get(eId);
          stat.totalSales += data.sales;
          stat.totalItems += data.qty;

          if (timeZero === todayMillis) {
            stat.todaySales += data.sales;
            stat.todayItems += data.qty;
          }
          if (pMonth === thisMonth && pYear === thisYear) {
            stat.monthSales += data.sales;
            stat.monthItems += data.qty;
          }
          if (pYear === thisYear) {
            stat.yearSales += data.sales;
            stat.yearItems += data.qty;
          }
        }
      });

      // อัปเดตกราฟภาพรวมร้าน
      const isAll = isAdmin && selectedEmpId === "ALL";
      const salesToAdd = isAll
        ? billTotal
        : empItemTotals[selectedEmpId]?.sales || 0;

      if (salesToAdd > 0 || isAll) {
        if (timeZero === todayMillis) tTotal += salesToAdd;
        if (timeZero === yesterdayMillis) yTotal += salesToAdd;
        if (pMonth === thisMonth && pYear === thisYear) tmTotal += salesToAdd;
        if (pMonth === lastMonth && pYear === lastMonthYear)
          lmTotal += salesToAdd;
        if (pYear === thisYear) tyTotal += salesToAdd;
        if (pYear === thisYear - 1) lyTotal += salesToAdd;

        const dIndex = dData.findIndex((d) => d.timestamp === timeZero);
        if (dIndex !== -1) dData[dIndex].total += salesToAdd;

        const mIndex = mData.findIndex(
          (m) => m.month === pMonth && m.year === pYear,
        );
        if (mIndex !== -1) mData[mIndex].total += salesToAdd;

        const yIndex = yData.findIndex((y) => y.year === pYear);
        if (yIndex !== -1) yData[yIndex].total += salesToAdd;
      }
    });

    const statsArray = Array.from(empStatsMap.values());

    return {
      dailyData: dData,
      monthlyData: mData,
      yearlyData: yData,
      todayTotal: tTotal,
      yesterdayTotal: yTotal,
      thisMonthTotal: tmTotal,
      lastMonthTotal: lmTotal,
      thisYearTotal: tyTotal,
      lastYearTotal: lyTotal,
      employeeStats: statsArray,
    };
  }, [orders, isAdmin, selectedEmpId, allEmployees]);

  const currencyLabel =
    orders[0]?.runningRef?.order?.[0]?.orderitems?.[0]?.menu?.unitPrice
      ?.label || "฿";

  useEffect(() => {
    if (isAdmin) {
      setSelectedEmpId("ALL");
    } else if (employeeId) {
      setSelectedEmpId(String(employeeId));
    }
  }, [isAdmin, employeeId]);

  useEffect(() => {
    setDisplayLimit(10);
  }, [period, selectedEmpId, viewMode]);

  const sortedDisplayEmployees = useMemo(() => {
    let list =
      isAdmin && selectedEmpId === "ALL"
        ? [...employeeStats]
        : employeeStats.filter((emp) => emp.id === selectedEmpId);

    if (isAdmin) {
      list.sort((a, b) => {
        if (period === "daily") return b.todaySales - a.todaySales;
        if (period === "monthly") return b.monthSales - a.monthSales;
        if (period === "yearly") return b.yearSales - a.yearSales;
        return b.totalSales - a.totalSales;
      });
    }

    return list;
  }, [employeeStats, isAdmin, selectedEmpId, period]);

  const visibleCards = sortedDisplayEmployees.slice(0, displayLimit);

  useEffect(() => {
    if (viewMode !== "card") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit((prev) =>
            Math.min(prev + 10, sortedDisplayEmployees.length),
          );
        }
      },
      { threshold: 1.0 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [sortedDisplayEmployees.length, viewMode]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-3 sm:p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">
              สรุปรายได้
            </h1>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              Sales Summary Overview
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                มุมมองผู้ดูแล: เลือกพนักงาน
              </h3>
            </div>

            <div className="w-full sm:w-64">
              <Select
                value={selectedEmpId}
                onValueChange={(val) => {
                  setSelectedEmpId(val);
                  setEmpSearch("");
                }}
              >
                <SelectTrigger className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {selectedEmpId === "ALL"
                      ? "ดูภาพรวมทุกคน"
                      : allEmployees.find(
                            (emp) => String(emp.id) === selectedEmpId,
                          )
                        ? `${allEmployees.find((emp) => String(emp.id) === selectedEmpId)?.name} ${allEmployees.find((emp) => String(emp.id) === selectedEmpId)?.surname}`
                        : "เลือกพนักงาน..."}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 sticky top-0 bg-white dark:bg-zinc-950 z-10 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                      <Input
                        placeholder="พิมพ์ชื่อเพื่อค้นหา..."
                        value={empSearch}
                        onChange={(e) => setEmpSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="h-8 pl-8 text-xs bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-1"
                      />
                    </div>
                  </div>

                  <SelectItem
                    value="ALL"
                    className="font-semibold text-primary"
                  >
                    ดูภาพรวมทุกคน
                  </SelectItem>

                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.name} {emp.surname}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-zinc-500">
                      ไม่พบชื่อที่ค้นหา
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <SalesSummary
          dailyData={dailyData}
          monthlyData={monthlyData}
          yearlyData={yearlyData}
          todayTotal={todayTotal}
          yesterdayTotal={yesterdayTotal}
          thisMonthTotal={thisMonthTotal}
          lastMonthTotal={lastMonthTotal}
          thisYearTotal={thisYearTotal}
          lastYearTotal={lastYearTotal}
          currencyLabel={currencyLabel}
          chartView={period}
          onViewChange={setPeriod}
        />

        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
            <div className="flex items-center gap-2">
              <UserCircle2 className="w-5 h-5 text-zinc-500" />
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                {isAdmin && selectedEmpId === "ALL"
                  ? "ผลงานแต่ละบุคคล (เรียงตามยอดสูงสุด)"
                  : "สรุปผลงานของคุณ"}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && selectedEmpId === "ALL" && (
                <div className="flex bg-zinc-200 dark:bg-zinc-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("card")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "card"
                        ? "bg-white dark:bg-zinc-700 text-primary shadow-sm"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "table"
                        ? "bg-white dark:bg-zinc-700 text-primary shadow-sm"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    <TableProperties className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                {(["daily", "monthly", "yearly"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      period === p
                        ? "bg-white dark:bg-zinc-700 text-primary shadow-sm"
                        : "text-zinc-500 hover:text-zinc-700"
                    }`}
                  >
                    {p === "daily"
                      ? "รายวัน"
                      : p === "monthly"
                        ? "รายเดือน"
                        : "รายปี"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {sortedDisplayEmployees.length > 0 ? (
            <>
              {viewMode === "card" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleCards.map((emp) => (
                      <OrderCard
                        key={emp.id}
                        employee={emp}
                        currencyLabel={currencyLabel}
                        period={period}
                      />
                    ))}
                  </div>
                  {displayLimit < sortedDisplayEmployees.length && (
                    <div ref={loadMoreRef} className="py-4 flex justify-center">
                      <span className="text-xs text-zinc-400 flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-zinc-300 border-t-primary rounded-full animate-spin"></span>
                        กำลังโหลดเพิ่มเติม...
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <ProfileTable
                  employees={sortedDisplayEmployees}
                  currencyLabel={currencyLabel}
                  period={period}
                />
              )}
            </>
          ) : (
            <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 text-sm">ไม่พบข้อมูลผลงาน</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilleMain;
