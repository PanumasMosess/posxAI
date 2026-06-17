"use client";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUser } from "@/components/providers/UserContext";

// นำเข้า Action
import {
  updateAccountStatus, updateAccountName,
  updateCategoryStatus, updateCategoryName,
} from "@/lib/actions/actionAccounting";

// สมมติว่าคุณสร้าง Data Table คล้ายๆ Data_table_setting_position ไว้แล้ว (เดี๋ยวจะบอกวิธีทำข้างล่าง)
import { Data_table_setting_account } from "../tables/data-table-setting-account";
// import column_setting_account from "../tables/column_setting_account";
import { Data_table_setting_category } from "../tables/data-table-setting-category";
import column_setting_category from "../tables/column_setting_category";
import { Data_table_setting_txlog } from "../tables/data-table-setting-txlog";
import column_setting_txlog from "../tables/column_setting_txlog";
import { useState } from "react";

export default function SettingAccountingPage({ accounts, categories, txLogs, userId, organizationId }: any) {
  const router = useRouter();
  const { employeeId } = useUser();

  // --- Handlers for Accounts ---
  const handleAccountStatus = async (id: number, status: string) => {
    const res = await updateAccountStatus(id, status);
    if (res.success) router.refresh();
  };
  const handleAccountName = async (id: number, name: string) => {
    const res = await updateAccountName(id, name);
    if (res.success) router.refresh();
  };

  // --- Handlers for Categories ---
  const handleCategoryStatus = async (id: number, status: string) => {
    const res = await updateCategoryStatus(id, status);
    if (res.success) router.refresh();
  };
  const handleCategoryName = async (id: number, name: string) => {
    const res = await updateCategoryName(id, name);
    if (res.success) router.refresh();
  };

  // --- Columns ---
  // const colAccounts = column_setting_account(handleAccountStatus, handleAccountName);
  const colCategories = column_setting_category(handleCategoryStatus, handleCategoryName);
  const colTxLogs = column_setting_txlog();

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ส่วนบนแบ่ง 2 คอลัมน์: บัญชีการเงิน & หมวดหมู่ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* กล่อง: บัญชีการเงิน */}
        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-0 overflow-hidden h-full">
          <div className="p-4">
            <Data_table_setting_account
              data={accounts}
              userId={Number(employeeId)}
              organizationId={organizationId}
              onUpdateStatus={handleAccountStatus}
              onUpdateName={handleAccountName}
            />
          </div>
        </div>

        {/* กล่อง: หมวดหมู่รายรับ-รายจ่าย */}
        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-0 overflow-hidden h-full">
          <div className="p-4">
            <Data_table_setting_category
              columns={colCategories}
              data={categories}
              userId={Number(employeeId)}
              organizationId={organizationId}
            />
          </div>
        </div>
      </div>

      {/* ส่วนล่าง เต็มจอ: ประวัติการจัดการเงินบัญชี (Log) */}
      <div className="grid grid-cols-1 gap-4">
        <div className="rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-sm p-0 overflow-hidden w-full">
          <div className="p-4">
            <Data_table_setting_txlog
              columns={colTxLogs}
              data={txLogs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}