"use client";
import { SettingEmployeeProps } from "@/lib/type";
import { useRouter } from "next/navigation";
import { Data_table_setting_position } from "../tables/data-table-setting-position";
import column_setting_position from "../tables/column_setting_position";
import {
  updateNameEmp,
  updateNamePosition,
  updatePositionEmp,
  updateStausEmp,
  updateStusPosition,
  updateSurNameEmp,
} from "@/lib/actions/actionSettings";
import { Data_table_setting_employee } from "../tables/data-table-setting-employee";
import column_setting_employee from "../tables/column_setting_employee";

const SettingEmployeePage = ({
  initialItems,
  relatedData,
  userId,
  organizationId,
}: SettingEmployeeProps) => {
  const router = useRouter();

  const handleStatusChange = async (id: number, status: string) => {
    const result = await updateStusPosition(id, status);
    if (result.success) {
      router.refresh();
    }
  };

  const onUpdateName = async (id: number, positionName: string) => {
    const result = await updateNamePosition(id, positionName);
    if (result.success) {
      router.refresh();
    }
  };

  const handleStatusChangeEmp = async (id: number, status: string) => {
    const result = await updateStausEmp(id, status);
    if (result.success) {
      router.refresh();
    }
  };

  const onUpdateNameEmp = async (id: number, newName: string) => {
    const result = await updateNameEmp(id, newName);
    if (result.success) {
      router.refresh();
    }
  };

  const onUpdateSurNameEmp = async (id: number, newSurName: string) => {
    const result = await updateSurNameEmp(id, newSurName);
    if (result.success) {
      router.refresh();
    }
  };

  const onUpdatePositionEmp = async (id: number, positionId: number) => {
    const result = await updatePositionEmp(id, positionId);
    if (result.success) {
      router.refresh();
    }
  };
  const columns = column_setting_position(
    handleStatusChange,
    onUpdateName,
    organizationId ?? 0
  );

  const column_employee = column_setting_employee(
    handleStatusChangeEmp,
    onUpdateNameEmp,
    onUpdateSurNameEmp,
    onUpdatePositionEmp,
    organizationId ?? 0,
    relatedData.positions
  );
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        className="
          rounded-2xl 
          border border-white/20 dark:border-zinc-700/50    
          bg-white/70 dark:bg-zinc-900/70 
          backdrop-blur-xl   
          shadow-[0_8px_30px_rgb(0,0,0,0.04)]
          dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
          p-0 overflow-hidden h-full
        "
      >
        <div className="overflow-x-auto w-full">
          <div className="min-w-[600px] md:min-w-full p-4">
            <Data_table_setting_position
              columns={columns}
              data={relatedData.positions}
              userId={userId}
              organizationId={organizationId ?? 0}
            />
          </div>
        </div>
      </div>
      <div
        className="
          rounded-2xl 
          border border-white/20 dark:border-zinc-700/50    
          bg-white/70 dark:bg-zinc-900/70 
          backdrop-blur-xl   
          shadow-[0_8px_30px_rgb(0,0,0,0.04)]
          dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
          p-0 overflow-hidden h-full
        "
      >
        <div className="overflow-x-auto w-full">
          <div className="min-w-[600px] md:min-w-full p-4">
            <Data_table_setting_employee
              columns={column_employee}
              data={initialItems}
              userId={userId}
              organizationId={organizationId ?? 0}
              position={relatedData.positions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingEmployeePage;
