"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Armchair, CheckCircle2, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

type TableItem = {
  id: number;
  tableName: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
};

interface MoveTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: TableItem;
  allTables: TableItem[];
  onConfirm: (fromId: number, toId: number) => void;
}

const TableStatusPage = ({
  isOpen,
  onClose,
  currentTable,
  allTables,
  onConfirm,
}: MoveTableDialogProps) => {
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);

  const availableTables = allTables.filter(
    (t) => t.status === "AVAILABLE" && t.id !== currentTable.id
  );

  const targetTableObj = availableTables.find((t) => t.id === selectedTargetId);

  const handleConfirm = () => {
    if (selectedTargetId) {
      onConfirm(currentTable.id, selectedTargetId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl">
        <div className="bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 p-8 pb-10 border-b border-zinc-100 dark:border-zinc-800 relative">
          <DialogTitle className="text-center text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-6">
            ยืนยันการย้ายโต๊ะ
          </DialogTitle>

          <div className="flex items-center justify-center gap-6 sm:gap-12">
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-white dark:bg-zinc-800 border-[3px] border-orange-200 dark:border-orange-900 shadow-[0_8px_30px_-6px_rgba(249,115,22,0.3)] flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105">
                <span className="text-2xl sm:text-3xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight truncate max-w-[90%] text-center">
                  {currentTable.tableName}
                </span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  กำลังใช้งาน
                </span>
              </div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                โต๊ะปัจจุบัน
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-600 -mt-8">
              <MoveRight
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 transition-all duration-500",
                  selectedTargetId
                    ? "text-blue-500 animate-pulse scale-125"
                    : "opacity-50"
                )}
              />
            </div>
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div
                className={cn(
                  "w-32 h-32 sm:w-36 sm:h-36 rounded-3xl border-[3px] flex flex-col items-center justify-center gap-2 transition-all duration-300",
                  selectedTargetId
                    ? "bg-blue-600 border-blue-600 shadow-[0_8px_30px_-6px_rgba(37,99,235,0.5)] scale-105"
                    : "bg-zinc-50 dark:bg-zinc-900/50 border-dashed border-zinc-300 dark:border-zinc-700"
                )}
              >
                {selectedTargetId ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate max-w-[90%] text-center">
                      {targetTableObj?.tableName}
                    </span>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                      ปลายทาง
                    </span>
                  </>
                ) : (
                  <>
                    <Armchair className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-1" />
                    <span className="text-xs text-zinc-400 font-medium">
                      เลือกโต๊ะ...
                    </span>
                  </>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-widest transition-colors",
                  selectedTargetId ? "text-blue-600" : "text-zinc-400"
                )}
              >
                โต๊ะใหม่
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col h-[320px]">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950 sticky top-0 z-20">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Armchair className="w-4 h-4 text-zinc-500" />
              เลือกโต๊ะที่ว่าง
            </h4>
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-md font-medium">
              ว่าง {availableTables.length} โต๊ะ
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50 dark:bg-zinc-900/20">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {availableTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTargetId(table.id)}
                  className={cn(
                    "relative group flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-zinc-900",
                    "hover:shadow-md hover:-translate-y-0.5",
                    selectedTargetId === table.id
                      ? "border-blue-600 shadow-blue-100 dark:shadow-blue-900/20 ring-1 ring-blue-600"
                      : "border-transparent shadow-sm hover:border-zinc-300 dark:hover:border-zinc-600"
                  )}
                >
                  <span
                    className={cn(
                      "text-xl font-bold mb-1 transition-colors",
                      selectedTargetId === table.id
                        ? "text-blue-600"
                        : "text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    {table.tableName}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    ว่าง
                  </span>

                  {selectedTargetId === table.id && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}

              {availableTables.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-60">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                    <Armchair className="w-6 h-6 text-zinc-400" />
                  </div>
                  <p className="text-sm font-medium text-zinc-500">
                    ไม่มีโต๊ะว่างในขณะนี้
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex w-full gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedTargetId}
              className={cn(
                "flex-1 sm:flex-none min-w-[140px] font-semibold transition-all shadow-sm",
                !selectedTargetId
                  ? "opacity-50 cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-200 dark:hover:shadow-blue-900/30"
              )}
            >
              {selectedTargetId ? (
                <>
                  ยืนยันย้ายไป {targetTableObj?.tableName}
                  <MoveRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                "กรุณาเลือกโต๊ะ"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TableStatusPage;
