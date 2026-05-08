"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input"; 
import {
  Receipt,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search, 
} from "lucide-react";

import { useUser } from "@/components/providers/UserContext";
import CountdownTimer from "./CountdownTimer";
import { ProfilleMainProps } from "@/lib/type";

const ProfilleMain = ({ orders }: ProfilleMainProps) => {
  const { employeeId, positionName } = useUser();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); 
  const itemsPerPage = 10;

  const isAdmin = ["Admin", "admin", "Spadmin", "spadmin"].includes(
    positionName || "",
  );
  const isEntertainer = positionName === "Entertainer";

  const displayOrders = useMemo(() => {
    let filtered = [];
    if (isAdmin) {
      filtered = orders;
    } else if (isEntertainer) {
      filtered = orders.filter((order) =>
        order.orderitems?.some(
          (item: any) => item.menu?.mcEmployeeId === employeeId,
        ),
      );
    }

    const groups: Record<string, any> = {};

    filtered.forEach((order) => {
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

      groups[key].totalPrice += order.price_sum || 0;


      if (order.status === "PAY_COMPLETED") {
        groups[key].status = "PAY_COMPLETED";
      }

      if (order.orderitems) {
        order.orderitems.forEach((item: any) => {
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
      }
    });

    const groupedArray = Object.values(groups).sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      return groupedArray.filter(
        (bill) =>
          bill.tableName.toLowerCase().includes(term) ||
          bill.runningCode.toLowerCase().includes(term),
      );
    }

    return groupedArray;
  }, [orders, isAdmin, isEntertainer, employeeId, searchTerm]); 

  useEffect(() => {
    setCurrentPage(1);
  }, [displayOrders.length, searchTerm]);

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
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 px-2 gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Receipt className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                ประวัติการรับออเดอร์
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
                  <Card
                    key={bill.id}
                    className="p-4 sm:p-5 hover:shadow-md transition-all duration-200 border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      {/* ข้อมูลหัวบิล */}
                      <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-xs"
                          >
                            โต๊ะ {bill.tableName}
                          </Badge>
                          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-mono">
                            {bill.runningCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(bill.createdAt).toLocaleString("th-TH")}
                        </div>
                      </div>

                      <div className="md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start">
                        <div className="flex flex-col md:items-end">
                          <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mb-0.5">
                            ยอดรวมทั้งบิล
                          </span>
                          <p className="text-xl sm:text-2xl font-black text-primary dark:text-primary">
                            ฿{bill.totalPrice?.toLocaleString() || 0}
                          </p>
                        </div>
                        <Badge
                          className={`text-[10px] px-2 py-0.5 mt-0 md:mt-1 shadow-sm ${
                            bill.status === "PAY_COMPLETED"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : bill.status === "CANCELLED"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : "bg-blue-100 text-blue-700 border-blue-200"
                          }`}
                          variant="outline"
                        >
                          {bill.status === "PAY_COMPLETED"
                            ? "ชำระแล้ว"
                            : bill.status === "CANCELLED"
                              ? "ยกเลิก"
                              : "กำลังใช้งาน"}
                        </Badge>
                      </div>
                    </div>

                    {/* รายการเมนูย่อยในบิลนี้ */}
                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                      {bill.items?.map((item: any, idx: number) => {
                        const itemTotal =
                          item.note && item.price_package
                            ? item.price_package * item.quantity
                            : item.price * item.quantity;

                        return (
                          <div
                            key={`${item.id}-${idx}`}
                            className="flex justify-between items-start text-sm p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg group transition-colors"
                          >
                            <div className="flex gap-3 items-start flex-1">
                              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0">
                                <AvatarImage
                                  src={item.img}
                                  className="object-cover"
                                />
                                <AvatarFallback className="text-xs bg-zinc-100 text-zinc-400">
                                  IMG
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex flex-col">
                                <p className="text-zinc-800 dark:text-zinc-200 font-semibold leading-tight flex items-center gap-2">
                                  <span className="text-primary font-black text-xs sm:text-sm bg-primary/10 px-1.5 py-0.5 rounded">
                                    {item.quantity}x
                                  </span>
                                  {item.menuName}
                                </p>

                                {item.note && (
                                  <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                                    * {item.note}
                                  </p>
                                )}

                                {item.orderStatus === "COMPLETED" &&
                                  item.mcEmployeeId && (
                                    <div className="mt-1">
                                      <CountdownTimer
                                        startTime={item.orderCreatedAt}
                                        packageHours={item.package_hours}
                                        quantity={item.quantity}
                                        unit={item.unit}
                                      />
                                    </div>
                                  )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end shrink-0 ml-2">
                              <span className="text-zinc-900 dark:text-white text-xs sm:text-sm font-bold mt-1">
                                ฿{itemTotal.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
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
