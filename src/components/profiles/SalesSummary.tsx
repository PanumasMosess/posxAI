"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { SalesSummaryProps } from "@/lib/type";

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f43f5e",
];

const SalesSummary = ({
  dailyData,
  monthlyData,
  yearlyData = [],
  todayTotal,
  yesterdayTotal,
  thisMonthTotal,
  lastMonthTotal,
  thisYearTotal = 0,
  lastYearTotal = 0,
  currencyLabel = "฿",
}: SalesSummaryProps) => {
  const [chartView, setChartView] = useState<"daily" | "monthly" | "yearly">(
    "daily",
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-lg">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1">
            {label}
          </p>
          <p className="text-primary font-bold text-sm sm:text-base">
            ยอดขาย: {payload[0].value.toLocaleString()} {currencyLabel}
          </p>
        </div>
      );
    }
    return null;
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const renderTrend = (current: number, previous: number, label: string) => {
    const percent = calculateTrend(current, previous);
    const isUp = percent > 0;
    const isDown = percent < 0;
    const isNeutral = percent === 0;

    return (
      <div className="flex items-center gap-1.5 mt-3 text-sm">
        {isUp ? (
          <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
        ) : isDown ? (
          <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />
        ) : (
          <Minus className="w-4 h-4 text-zinc-400 shrink-0" />
        )}
        <span
          className={`font-semibold shrink-0 ${
            isUp
              ? "text-emerald-500"
              : isDown
                ? "text-red-500"
                : "text-zinc-500"
          }`}
        >
          {isNeutral ? "เท่าเดิม" : `${Math.abs(percent).toFixed(1)}%`}
        </span>
        <span className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm truncate">
          เทียบ{label}
        </span>
      </div>
    );
  };

  const formatCompactNumber = (number: number) => {
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(1)}k`;
    return number.toString();
  };

  // 🟢 สลับการดึงชุดข้อมูลตามปุ่มที่เลือก (เพิ่มของรายปี)
  const currentData =
    chartView === "daily"
      ? dailyData
      : chartView === "monthly"
        ? monthlyData
        : yearlyData;

  return (
    <Card className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm font-sans w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 truncate">
            สรุปยอดขายของคุณ
          </h2>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1 truncate">
            {chartView === "daily"
              ? "ยอดขาย 7 วันล่าสุด"
              : chartView === "monthly"
                ? "ยอดขาย 6 เดือนล่าสุด"
                : "ยอดขายรายปี"}
          </p>
        </div>

        {/* 🟢 ปรับแถบปุ่มกดให้เป็น 3 ปุ่มเพื่อรองรับ รายปี */}
        <div className="flex w-full sm:w-auto p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg shrink-0">
          <button
            onClick={() => setChartView("daily")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${
              chartView === "daily"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            รายวัน
          </button>
          <button
            onClick={() => setChartView("monthly")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${
              chartView === "monthly"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            รายเดือน
          </button>
          <button
            onClick={() => setChartView("yearly")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${
              chartView === "yearly"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            รายปี
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1 flex flex-col h-full bg-primary/5 dark:bg-primary/10 p-5 sm:p-6 rounded-2xl border border-primary/10 dark:border-primary/20 min-w-0">
          <p className="text-zinc-600 dark:text-zinc-300 text-sm font-bold mb-auto">
            {chartView === "daily"
              ? "ยอดขายวันนี้"
              : chartView === "monthly"
                ? "ยอดขายเดือนนี้"
                : "ยอดขายปีนี้"}
          </p>

          <div className="flex items-baseline w-full flex-wrap gap-x-1 py-4">
            <h3 className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-black text-primary tracking-tight break-words">
              {chartView === "daily"
                ? todayTotal.toLocaleString()
                : chartView === "monthly"
                  ? thisMonthTotal.toLocaleString()
                  : thisYearTotal.toLocaleString()}
            </h3>
            <span className="text-base font-bold text-primary mr-1">
              {currencyLabel}
            </span>
          </div>

          <div className="mt-auto border-t border-primary/10 pt-3">
            {chartView === "daily"
              ? renderTrend(todayTotal, yesterdayTotal, "เมื่อวาน")
              : chartView === "monthly"
                ? renderTrend(thisMonthTotal, lastMonthTotal, "เดือนก่อน")
                : renderTrend(thisYearTotal, lastYearTotal, "ปีก่อน")}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-3 h-[250px] sm:h-[300px] w-full mt-2 lg:mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="#71717a"
                opacity={0.15}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#71717a",
                  fontSize: 11,
                  fontFamily: "inherit",
                  fontWeight: 500,
                }}
                dy={10}
                minTickGap={5}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={45}
                tick={{
                  fill: "#71717a",
                  fontSize: 11,
                  fontFamily: "inherit",
                  fontWeight: 500,
                }}
                tickFormatter={formatCompactNumber}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#71717a", opacity: 0.1 }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={45}>
                {currentData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default SalesSummary;
