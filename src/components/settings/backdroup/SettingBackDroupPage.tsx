"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUser } from "@/components/providers/UserContext";
import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, Image as ImageIcon } from "lucide-react";
import { SettingBackdropProps } from "@/lib/type";
import { Data_table_setting_backdrop } from "../tables/Data_table_setting_backdrop";
import column_setting_backdrop from "../tables/column_setting_backdrop";
import SettingFormBackdrop from "@/components/forms/SettingFormBackdrop";
import {
  deleteBackdrop,
  updateBackdropDuration,
  updateBackdropSequence,
  updateBackdropStatus,
  updateBackdropTitle,
} from "@/lib/actions/actionSettings";


const SettingBackdropPage = ({
  initialItems,
  organizationId,
}: SettingBackdropProps) => {
  const router = useRouter();
  const { employeeId } = useUser();

  const [openUploadSheet, setOpenUploadSheet] = useState(false);
  const [currentBackdropId, setCurrentBackdropId] = useState<number | null>(
    null,
  );

  const handleUpdateTitle = async (id: number, title: string) => {
    const result = await updateBackdropTitle(id, title);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleUpdateSequence = async (id: number, newSequence: number) => {
    const result = await updateBackdropSequence(id, newSequence);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleUpdateDuration = async (id: number, duration: number) => {
    const result = await updateBackdropDuration(id, duration);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleStatusChange = async (id: number, isActive: boolean) => {
    const result = await updateBackdropStatus(id, isActive);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพ/วิดีโอนี้?")) return;

    const result = await deleteBackdrop(id);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const onOpenForm = (backdropId: number | null = null) => {
    setCurrentBackdropId(backdropId);
    setOpenUploadSheet(true);
  };

  const columns = column_setting_backdrop(
    handleUpdateTitle,
    handleUpdateSequence,
    handleUpdateDuration,
    handleStatusChange,
    handleDelete,
    onOpenForm
  );

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 dark:bg-zinc-900/60 p-4 sm:p-6 rounded-2xl border border-white/20 dark:border-zinc-700/50 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl shrink-0">
            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight line-clamp-1">
              หน้าจอโปรโมชั่น (Backdrop)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 sm:mt-1 line-clamp-2">
              จัดการรูปภาพสไลด์โชว์สำหรับหน้าจอฝั่งลูกค้า
            </p>
          </div>
        </div>
        <Button
          onClick={() => onOpenForm(null)}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all rounded-xl text-sm sm:text-base h-11 sm:h-12 px-6"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
          อัปโหลดรูปภาพใหม่
        </Button>
      </div>
      <div
        className="
          rounded-2xl 
          border border-zinc-200/60 dark:border-zinc-800/60    
          bg-white/80 dark:bg-zinc-950/80 
          backdrop-blur-xl   
          shadow-lg
          flex-1
          w-full
          overflow-hidden
        "
      >
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
          <div className="min-w-[700px] w-full p-3 sm:p-4 md:p-6">
            <Data_table_setting_backdrop
              columns={columns}
              data={initialItems}
              organizationId={organizationId}
              userId={Number(employeeId)}
            />
          </div>
        </div>
      </div>

      <Sheet open={openUploadSheet} onOpenChange={setOpenUploadSheet}>
        <SettingFormBackdrop
          backdropId={currentBackdropId}
          organizationId={organizationId}
          stateSheet={setOpenUploadSheet}
          userId={Number(employeeId)}
        />
      </Sheet>
    </div>
  );
};

export default SettingBackdropPage;
