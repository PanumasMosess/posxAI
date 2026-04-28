"use client";
import { SettingEmployeeProps, SettingPositions } from "@/lib/type";
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
  updatePinPosition,
  updateMemberStatus,
  updateMemberField,
} from "@/lib/actions/actionSettings";
import { Data_table_setting_employee } from "../tables/data-table-setting-employee";
import column_setting_employee from "../tables/column_setting_employee";

import { Data_table_setting_member } from "../tables/data_table_setting_member";
import column_setting_member from "../tables/column_setting_member";

import { toast } from "react-toastify";

const SettingEmployeePage = ({
  initialItems,
  relatedData,
  userId,
  organizationId,
}: SettingEmployeeProps) => {
  const router = useRouter();

  // --- Handlers for Position ---
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

  const onUpdatePin = async (id: number, newPin: string) => {
    const result = await updatePinPosition(id, newPin);
    if (result.success) {
      router.refresh();
    } else {
      toast.error(result.message || "เกิดข้อผิดพลาดในการตั้งค่า PIN");
    }
  };

  // --- Handlers for Employee ---
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


  const handleStatusChangeMember = async (id: number, status: string) => {
    const result = await updateMemberStatus(id, status);
    if (result.success) {
      router.refresh();
    } else {
      toast.error("อัปเดตสถานะไม่สำเร็จ");
    }
  };

  const handleUpdateFieldMember = async (
    id: number,
    field: string,
    newValue: string,
  ) => {
    let parsedValue: string | number = newValue;

    if (field === "points" || field === "creditBalance") {
      parsedValue = Number(newValue.replace(/[^0-9.-]+/g, "")) || 0;
    }

    const result = await updateMemberField(id, field, parsedValue as any);

    if (result.success) {
      router.refresh();
    } else {
      toast.error("อัปเดตข้อมูลไม่สำเร็จ");
    }
  };

  const columns = column_setting_position(
    handleStatusChange,
    onUpdateName,
    organizationId ?? 0,
    onUpdatePin,
  );

  const column_employee = column_setting_employee(
    handleStatusChangeEmp,
    onUpdateNameEmp,
    onUpdateSurNameEmp,
    onUpdatePositionEmp,
    organizationId ?? 0,
    relatedData.positions,
  );

  const column_member = column_setting_member(
    handleStatusChangeMember,
    handleUpdateFieldMember, // ✅ ส่งฟังก์ชันนี้ลงไปทำงานคู่กับ Column อย่างปลอดภัย
    organizationId ?? 0,
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ส่วนบนแบ่ง 2 คอลัมน์ (ตำแหน่ง, พนักงาน) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* กล่อง: ตำแหน่ง */}
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
                data={relatedData.positions as SettingPositions[]}
                userId={userId}
                organizationId={organizationId ?? 0}
              />
            </div>
          </div>
        </div>

        {/* กล่อง: พนักงาน */}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ✅ ส่วนตารางสมาชิกลูกค้า (ปรับให้กางเต็มจอ ไม่โดนบีบ) */}
        <div
          className="
          rounded-2xl 
          border border-white/20 dark:border-zinc-700/50    
          bg-white/70 dark:bg-zinc-900/70 
          backdrop-blur-xl   
          shadow-[0_8px_30px_rgb(0,0,0,0.04)]
          dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
          p-0 overflow-hidden w-full
        "
        >
          <div className="overflow-x-auto w-full">
            <div className="min-w-[800px] md:min-w-full p-4">
              <Data_table_setting_member
                columns={column_member}
                data={(relatedData as any).members || []}
                userId={userId}
                organizationId={organizationId ?? 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingEmployeePage;
