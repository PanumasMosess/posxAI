"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Receipt,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUser } from "@/components/providers/UserContext";
import { ProfilleMainProps } from "@/lib/type";

import SalesSummary from "./SalesSummary";
import OrderCard from "./OrderCard";

const ProfilleMain = ({ orders, allEmployees = [] }: ProfilleMainProps) => {
  const { employeeId, positionName } = useUser();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const isAdmin = ["Admin", "admin", "Spadmin", "spadmin"].includes(
    positionName || "",
  );

  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    isAdmin ? "ALL" : String(employeeId),
  );

  const {
    displayOrders,
    dailyData,
    monthlyData,
    yearlyData, // 🟢 ดึงข้อมูลรายปีเพิ่มออกไปใช้ด้านล่าง
    todayTotal,
    yesterdayTotal,
    thisMonthTotal,
    lastMonthTotal,
    thisYearTotal, // 🟢 ดึงยอดรวมปีนี้
    lastYearTotal, // 🟢 ดึงยอดรวมปีที่แล้ว
  } = useMemo(() => {
    const groups: Record<string, any> = {};
    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const yesterday = today - 86400000;

    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let tTotal = 0;
    let yTotal = 0;
    let tmTotal = 0;
    let lmTotal = 0;
    let tyTotal = 0; // 🟢 ยอดรวมปีนี้
    let lyTotal = 0; // 🟢 ยอดรวมปีที่แล้ว

    const dData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today - (6 - i) * 86400000);
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

    // 🟢 โครงสร้างข้อมูลกราฟรายปี (ย้อนหลัง 3 ปี)
    const yData = Array.from({ length: 3 }, (_, i) => {
      const yearTarget = thisYear - (2 - i);
      return {
        name: `${yearTarget + 543}`, // แสดงผลเป็น พ.ศ. ให้สวยและอ่านง่ายตามไทยสไตล์
        year: yearTarget,
        total: 0,
      };
    });

    orders.forEach((order) => {
      let myItems: any[] = [];

      if (isAdmin && selectedEmpId === "ALL") {
        myItems = order.orderitems || [];
      } else {
        myItems = (order.orderitems || []).filter(
          (item: any) =>
            String(item.menu?.mcEmployeeId) === selectedEmpId ||
            String(order.employeeId) === selectedEmpId,
        );
      }

      if (myItems.length === 0) return;

      const key = order.order_running_code || `ORDER-${order.id}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          runningCode: order.order_running_code || `ID: ${order.id}`,
          tableName: order.table?.tableName || "ไม่ระบุ",
          createdAt: order.createdAt,
          status: order.status,
          totalPrice: 0,
          items: [],
        };
      }
      if (order.status === "PAY_COMPLETED")
        groups[key].status = "PAY_COMPLETED";

      const orderDate = new Date(order.createdAt);
      const orderTimeZero = new Date(
        orderDate.getFullYear(),
        orderDate.getMonth(),
        orderDate.getDate(),
      ).getTime();
      const oMonth = orderDate.getMonth();
      const oYear = orderDate.getFullYear();

      myItems.forEach((item: any) => {
        const itemPrice = item.price_package || item.price || 0;
        const itemTotal = itemPrice * item.quantity;

        groups[key].totalPrice += itemTotal;

        if (order.status !== "CANCELLED") {
          if (orderTimeZero === today) tTotal += itemTotal;
          if (orderTimeZero === yesterday) yTotal += itemTotal;
          if (oMonth === thisMonth && oYear === thisYear) tmTotal += itemTotal;
          if (oMonth === lastMonth && oYear === lastMonthYear)
            lmTotal += itemTotal;

          // 🟢 สะสมยอดเปรียบเทียบปีนี้ และปีที่แล้ว
          if (oYear === thisYear) tyTotal += itemTotal;
          if (oYear === thisYear - 1) lyTotal += itemTotal;

          const dIndex = dData.findIndex((d) => d.timestamp === orderTimeZero);
          if (dIndex !== -1) dData[dIndex].total += itemTotal;

          const mIndex = mData.findIndex(
            (m) => m.month === oMonth && m.year === oYear,
          );
          if (mIndex !== -1) mData[mIndex].total += itemTotal;

          // 🟢 สะสมยอดใส่ลงกราฟรายปี
          const yIndex = yData.findIndex((y) => y.year === oYear);
          if (yIndex !== -1) yData[yIndex].total += itemTotal;
        }

        groups[key].items.push({
          id: item.id,
          quantity: item.quantity,
          menuName: item.menu?.menuName,
          note: item.note,
          img: item.menu?.img || "/placeholder.png",
          price_package: item.menu?.price_package,
          price: item.price,
          package_hours: item.menu?.package_hours || 0,
          unit: item.menu?.unit,
          mcEmployeeId: item.menu?.mcEmployeeId,
          orderStatus: order.status,
          orderCreatedAt: order.createdAt,
        });
      });
    });

    const groupedArray = Object.values(groups).sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    let finalArray = groupedArray;
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      finalArray = groupedArray.filter(
        (bill) =>
          bill.tableName.toLowerCase().includes(term) ||
          bill.runningCode.toLowerCase().includes(term),
      );
    }

    return {
      displayOrders: finalArray,
      dailyData: dData,
      monthlyData: mData,
      yearlyData: yData, // 🟢 ส่งออกอาเรย์ข้อมูลปีไปใช้ต่อ
      todayTotal: tTotal,
      yesterdayTotal: yTotal,
      thisMonthTotal: tmTotal,
      lastMonthTotal: lmTotal,
      thisYearTotal: tyTotal, // 🟢 ส่งออกยอดรวมปีนี้
      lastYearTotal: lyTotal, // 🟢 ส่งออกยอดรวมปีที่แล้ว
    };
  }, [orders, isAdmin, selectedEmpId, searchTerm]);

  const currencyLabel =
    orders[0]?.orderitems?.[0]?.menu?.unitPrice?.label || "฿";

  useEffect(() => {
    setCurrentPage(1);
    if (isAdmin) {
      setSelectedEmpId("ALL");
    }
  }, [displayOrders.length, searchTerm, selectedEmpId]);

  const totalPages = Math.max(
    1,
    Math.ceil(displayOrders.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = displayOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-3 sm:p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
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
                onValueChange={(val) => setSelectedEmpId(val)}
              >
                <SelectTrigger className="w-full h-9 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
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
                  <SelectItem
                    value="ALL"
                    className="font-semibold text-primary"
                  >
                    ดูภาพรวมทุกคน
                  </SelectItem>
                  {allEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.name} {emp.surname}
                    </SelectItem>
                  ))}
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
        />

        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 px-2 gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Receipt className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                {isAdmin && selectedEmpId === "ALL"
                  ? "ประวัติบิลทั้งหมดของร้าน"
                  : "ประวัติบิลของคุณ"}
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  placeholder="ค้นหาโต๊ะ หรือ เลขบิล..."
                  className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-10 shadow-sm rounded-xl focus-visible:ring-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Badge
                variant="secondary"
                className="text-xs h-10 px-4 flex items-center justify-center whitespace-nowrap rounded-xl shadow-sm"
              >
                ทั้งหมด {displayOrders.length} บิล
              </Badge>
            </div>
          </div>

          {displayOrders.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Receipt className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500 font-medium">
                {searchTerm ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีประวัติการทำงาน"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid gap-4">
                {currentOrders.map((bill) => (
                  <OrderCard
                    key={bill.id}
                    bill={bill}
                    currencyLabel={currencyLabel}
                  />
                ))}
              </div>

              {displayOrders.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm gap-4">
                  <p className="text-xs sm:text-sm text-zinc-500 font-medium">
                    แสดง {startIndex + 1} ถึง{" "}
                    {Math.min(startIndex + itemsPerPage, displayOrders.length)}{" "}
                    จากทั้งหมด {displayOrders.length} บิล
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="h-8 px-3 text-xs sm:text-sm"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> ก่อนหน้า
                    </Button>
                    <span className="text-xs sm:text-sm font-medium mx-2 min-w-[70px] text-center text-zinc-600 dark:text-zinc-300">
                      หน้า {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3 text-xs sm:text-sm"
                    >
                      ถัดไป <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilleMain;
