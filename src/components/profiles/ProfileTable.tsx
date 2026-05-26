import { ProfileTableProps } from "@/lib/type";
import React from "react";

const ProfileTable = ({ employees, currencyLabel, period }: ProfileTableProps) => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">ลำดับ</th>
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
            {employees.map((emp, index) => {
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
                  <td className="px-4 py-3 font-medium text-zinc-400">
                    {index + 1}
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfileTable;