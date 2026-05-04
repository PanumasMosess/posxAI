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
  updateMemberStatus,
  updateMemberField,
  updateStatusEmpPin,
  updateNameEmpPin,
  updateSurNameEmpPin,
  updatePositionEmpPin,
  updatePinEmpPin,
  payMemberCredit,
} from "@/lib/actions/actionSettings";
import { Data_table_setting_employee } from "../tables/data-table-setting-employee";
import column_setting_employee from "../tables/column_setting_employee";

import { Data_table_setting_member } from "../tables/data_table_setting_member";
import column_setting_member from "../tables/column_setting_member";

import { toast } from "react-toastify";
import { Data_table_setting_employee_pin } from "../tables/Data_table_setting_employee_pin";
import column_setting_employee_pin from "../tables/column_setting_employee_pin";
import { useUser } from "@/components/providers/UserContext";

const SettingEmployeePage = ({
  initialItems,
  relatedData,
  userId,
  organizationId,
}: SettingEmployeeProps) => {
  const router = useRouter();
  const { employeeId } = useUser();
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

  // --- Handlers for Employee (ระบบเก่า) ---
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

  // --- Handlers for Member ---
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

  const handleStatusChangeEmpPin = async (id: number, status: string) => {
    const result = await updateStatusEmpPin(id, status);
    if (result.success) router.refresh();
    else toast.error("อัปเดตสถานะพนักงานไม่สำเร็จ");
  };

  const onUpdateNameEmpPin = async (id: number, newName: string) => {
    const result = await updateNameEmpPin(id, newName);
    if (result.success) router.refresh();
    else toast.error("อัปเดตชื่อไม่สำเร็จ");
  };

  const onUpdateSurNameEmpPin = async (id: number, newSurName: string) => {
    const result = await updateSurNameEmpPin(id, newSurName);
    if (result.success) router.refresh();
    else toast.error("อัปเดตนามสกุลไม่สำเร็จ");
  };

  const onUpdatePositionEmpPin = async (id: number, positionId: number) => {
    const result = await updatePositionEmpPin(id, positionId);
    if (result.success) router.refresh();
    else toast.error("อัปเดตตำแหน่งไม่สำเร็จ");
  };

  const onUpdatePinEmpPin = async (id: number, newPin: string) => {
    const result = await updatePinEmpPin(id, newPin);
    if (result.success) router.refresh();
    else toast.error("อัปเดต PIN ไม่สำเร็จ");
  };

  const handlePayCredit = async (memberId: number, amount: number) => {
    if (!employeeId) {
      toast.error("ไม่พบข้อมูลพนักงานผู้ทำรายการ");
      return;
    }

    const result = await payMemberCredit(
      memberId,
      amount,
      Number(employeeId),
      organizationId ?? 0,
    );

    if (result.success) {
      toast.success("บันทึกการชำระเครดิตสำเร็จ");
      router.refresh();
    } else {
      toast.error(result.message || "เกิดข้อผิดพลาด");
    }
  };

  // --- Column Definitions ---
  const columns = column_setting_position(
    handleStatusChange,
    onUpdateName,
    organizationId ?? 0,
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
    handleUpdateFieldMember,
    handlePayCredit,
    organizationId ?? 0,
  );

  const column_employee_pin = column_setting_employee_pin(
    handleStatusChangeEmpPin,
    onUpdateNameEmpPin,
    onUpdateSurNameEmpPin,
    onUpdatePositionEmpPin,
    onUpdatePinEmpPin,
    organizationId ?? 0,
    relatedData.positions,
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
                userId={Number(employeeId)}
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
                userId={Number(employeeId)}
                organizationId={organizationId ?? 0}
                position={relatedData.positions}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                userId={Number(employeeId)}
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
          p-0 overflow-hidden w-full
        "
        >
          <div className="overflow-x-auto w-full">
            <div className="min-w-[800px] md:min-w-full p-4">
              <Data_table_setting_employee_pin
                columns={column_employee_pin}
                data={(relatedData as any).employeePins || []}
                userId={Number(employeeId)}
                organizationId={organizationId ?? 0}
                positions={relatedData.positions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingEmployeePage;
