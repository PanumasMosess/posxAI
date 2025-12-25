"use client";
import { PrinterProps } from "@/lib/type";
import { Data_table_setting_printers } from "../tables/data-table-setting-printers";
import column_setting_printers from "../tables/column_setting_printer";
import { useRouter } from "next/navigation";
import {
  updateNamePrinter,
  updateStationUse,
} from "@/lib/actions/actionSettings";

const SettingPrinterPage = ({
  initialItems,
  reationData,
  id_user,
  organizationId,
}: PrinterProps) => {
  const router = useRouter();

  const onUpdateStationUse = async (id: number, stationName: string) => {
    const result = await updateStationUse(id, stationName);
    if (result.success) {
      router.refresh();
    }
  };

  const onUpdatePrinterName = async (id: number, printer: string) => {
    const result = await updateNamePrinter(id, printer);
    if (result.success) {
      router.refresh();
    }
  };

  const columns = column_setting_printers(
    onUpdatePrinterName,
    onUpdateStationUse,
    organizationId ?? 0,
    reationData
  );
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
            <Data_table_setting_printers
              columns={columns}
              data={initialItems}
              userId={id_user}
              organizationId={organizationId ?? 0}
              reationdata={reationData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingPrinterPage;
