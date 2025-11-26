"use client";
import { SettingTableProps } from "@/lib/type";
import { Data_table_setting_tables } from "./tables/data-table-setting-tables";
import column_setting_tables from "./tables/column_setting_tables";
import { useRouter } from "next/navigation";
import {
  updateNameTable,
  updateStatusTable,
} from "@/lib/actions/actionSettings";

const SettingTablesPage = ({ initialItems }: SettingTableProps) => {
  const router = useRouter();
  const handleStatusChange = async (id: number, status: string) => {
    const result = await updateStatusTable(id, status);

    if (result.success) {
      router.refresh();
    }
  };

  const onUpdateName = async (id: number, tableName: string) => {
    const result = await updateNameTable(id, tableName);

    if (result.success) {
      router.refresh();
    }
  };

  const columns = column_setting_tables(handleStatusChange, onUpdateName);
  return (
    <div className="w-full space-y-4">
      <div
        className="
      rounded-2xl 
      border border-white/20 dark:border-zinc-700/50    
      bg-white/70 dark:bg-zinc-900/70 
      backdrop-blur-xl   
      shadow-[0_8px_30px_rgb(0,0,0,0.04)]
      dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
      p-0 overflow-hidden 
    "
      >
        <div className="overflow-x-auto w-full">
          <div className="min-w-[600px] md:min-w-full p-4">
            <Data_table_setting_tables columns={columns} data={initialItems} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingTablesPage;
