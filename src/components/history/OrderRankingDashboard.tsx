"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  UtensilsCrossed,
  Star,
  Award,
  History,
  Printer,
} from "lucide-react";
import { OrderRankingDashboardProps } from "@/lib/type";
import { DataTableFoodRank } from "./tables/data-table-food-rank";
import { DataTablePRRank } from "./tables/data-table-pr-rank";
import { column_food_rank } from "./tables/column_food_rank";
import { column_pr_rank } from "./tables/column_pr_rank";
import qz from "qz-tray";
import { getCertContentFromS3, signDataWithS3Key } from "@/lib/actions/actionIndex";

export default function OrderRankingDashboard({
  initialItems,
  id_user,
  organizationId,
  topFood,
  topEntertainer,
  topEmployee,
  prRankData,
}: OrderRankingDashboardProps) {
  const column_food_rank_data = column_food_rank();
  const column_pr_rank_data = column_pr_rank();

  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");

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

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        initQZSecurity();

        if (!qz.websocket.isActive()) {
          await qz.websocket.connect();
        }

        const list = await qz.printers.find();
        setPrinters(list);

        const defaultPrinter = await qz.printers.getDefault();
        if (defaultPrinter) {
          setSelectedPrinter(defaultPrinter);
        } else if (list.length > 0) {
          setSelectedPrinter(list[0]);
        }
      } catch (error) {
        console.error("Failed to load printers or init security:", error);
      }
    };

    fetchPrinters();
  }, [initQZSecurity]); 

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              สถิติยอดฮิต & จัดอันดับออเดอร์
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Top Rankings & Order Statistics
            </p>
          </div>
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
            <div className="h-12 w-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-900/50">
              <UtensilsCrossed className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                เมนูขายดีอันดับ 1
              </p>
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 truncate mt-1">
                {topFood?.name || "ยังไม่มีข้อมูล"}
              </h3>
              {topFood && (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ขายไปแล้ว {topFood.count.toLocaleString()} ครั้ง
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
            <div className="h-12 w-12 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center shrink-0 border border-pink-100 dark:border-pink-900/50">
              <Star className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Entertainer ยอดฮิต
              </p>
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 truncate mt-1">
                {topEntertainer?.name || "ยังไม่มีข้อมูล"}
              </h3>
              {topEntertainer && (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ถูกเรียก {topEntertainer.count.toLocaleString()} ครั้ง
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
              <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                พนักงานยอดเยี่ยม
              </p>
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 truncate mt-1">
                {topEmployee?.name || "ยังไม่มีข้อมูล"}
              </h3>
              {topEmployee && (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                  รับออเดอร์ {topEmployee.count.toLocaleString()} รายการ
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 px-1">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-zinc-500" />
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                ตารางจัดอันดับทั้งหมด
              </h2>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Printer className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                เครื่องปริ้น:
              </span>
              <select
                value={selectedPrinter}
                onChange={(e) => setSelectedPrinter(e.target.value)}
                className="h-8 w-full sm:w-[200px] rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
              >
                {printers.length === 0 && (
                  <option value="">กำลังค้นหา...</option>
                )}
                {printers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <DataTableFoodRank
              columns={column_food_rank_data}
              data={initialItems}
              printerName={selectedPrinter}
            />

            <DataTablePRRank
              columns={column_pr_rank_data}
              data={prRankData || []}
              printerName={selectedPrinter}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
