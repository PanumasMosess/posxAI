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
import { Armchair, CheckCircle2, MoveRight, ListChecks, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { MoveTableDialogProps } from "@/lib/type";

const TableStatusPage = ({
  isOpen,
  onClose,
  currentTable,
  allTables,
  onConfirm,
  currentOrderItems = [],
}: MoveTableDialogProps & { currentOrderItems?: any[] }) => {
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  
  const [moveMode, setMoveMode] = useState<"ALL" | "PARTIAL">("ALL");
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  const availableTables = allTables.filter(
    (t) => t.status === "AVAILABLE" && t.id !== currentTable.id
  );

  const targetTableObj = availableTables.find((t) => t.id === selectedTargetId);

  const toggleItemSelection = (itemId: number) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleConfirm = () => {
    if (selectedTargetId) {
      const itemsToMove = moveMode === "PARTIAL" ? selectedItemIds : null;
      onConfirm(currentTable.id, selectedTargetId, itemsToMove);
      onClose();
      setTimeout(() => {
        setMoveMode("ALL");
        setSelectedItemIds([]);
        setSelectedTargetId(null);
      }, 300);
    }
  };

  const isConfirmDisabled = 
    !selectedTargetId || (moveMode === "PARTIAL" && selectedItemIds.length === 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-[700px] h-[90dvh] sm:h-auto sm:max-h-[90vh] p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col">
        
        {/* ======================================================= */}
        {/* ส่วนบน: กราฟิกแสดงการย้ายโต๊ะ */}
        {/* ======================================================= */}
        <div className="bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 pt-5 pb-4 sm:pt-8 sm:pb-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <DialogTitle className="text-center text-base sm:text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-4 sm:mb-6">
            ยืนยันการย้ายโต๊ะ
          </DialogTitle>

          <div className="flex items-center justify-center gap-4 sm:gap-10 px-4">
            {/* โต๊ะปัจจุบัน */}
            <div className="flex flex-col items-center gap-2 sm:gap-3 relative z-10">
              {/* 💡 ขยายจาก w-16 เป็น w-20 เพื่อให้สมส่วนขึ้น */}
              <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-[1.25rem] sm:rounded-3xl bg-white dark:bg-zinc-800 border-[3px] border-orange-200 dark:border-orange-900 shadow-[0_4px_15px_rgba(249,115,22,0.2)] sm:shadow-[0_8px_30px_-6px_rgba(249,115,22,0.3)] flex flex-col items-center justify-center gap-0.5 sm:gap-1">
                <span className="text-xl sm:text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight truncate max-w-[90%] text-center">
                  {currentTable.tableName}
                </span>
                {/* 💡 นำป้ายแท็กกลับมาแสดงบนมือถือ แต่ปรับฟอนต์ให้เล็กหน่อย */}
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  ใช้งาน
                </span>
              </div>
            </div>

            {/* ลูกศรตรงกลาง */}
            <div className="flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-600">
              <MoveRight
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 transition-all duration-500",
                  selectedTargetId ? "text-blue-500 animate-pulse scale-110 sm:scale-125" : "opacity-50"
                )}
              />
            </div>

            {/* โต๊ะปลายทาง */}
            <div className="flex flex-col items-center gap-2 sm:gap-3 relative z-10">
              <div
                className={cn(
                  "w-20 h-20 sm:w-32 sm:h-32 rounded-[1.25rem] sm:rounded-3xl border-[3px] flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all duration-300",
                  selectedTargetId
                    ? "bg-blue-600 border-blue-600 shadow-[0_4px_15px_rgba(37,99,235,0.4)] sm:shadow-[0_8px_30px_-6px_rgba(37,99,235,0.5)] scale-105"
                    : "bg-zinc-50 dark:bg-zinc-900/50 border-dashed border-zinc-300 dark:border-zinc-700"
                )}
              >
                {selectedTargetId ? (
                  <>
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight truncate max-w-[90%] text-center">
                      {targetTableObj?.tableName}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                      ปลายทาง
                    </span>
                  </>
                ) : (
                  <>
                    <Armchair className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-300 dark:text-zinc-600 mb-0.5 sm:mb-1" />
                    <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium">
                      เลือกโต๊ะ...
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg sm:rounded-xl mx-4 sm:mx-8 mt-5 sm:mt-6">
            <button
              onClick={() => setMoveMode("ALL")}
              className={cn(
                "flex-1 text-xs sm:text-sm py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium transition-all duration-200",
                moveMode === "ALL"
                  ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              ย้ายทั้งโต๊ะ
            </button>
            <button
              onClick={() => setMoveMode("PARTIAL")}
              className={cn(
                "flex-1 text-xs sm:text-sm py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium transition-all duration-200",
                moveMode === "PARTIAL"
                  ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              เลือกบางรายการ
            </button>
          </div>
        </div>

        {/* ======================================================= */}
        {/* ส่วนกลาง: แบ่งเลย์เอาต์ตามโหมดที่เลือก */}
        {/* ======================================================= */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-[250px]">
          
          {/* แสดงรายการอาหาร เฉพาะตอนเลือก "ย้ายบางรายการ" */}
          {moveMode === "PARTIAL" && (
            <div className="flex-1 sm:flex-none w-full sm:w-1/2 min-h-0 border-b sm:border-b-0 sm:border-r border-zinc-100 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-950">
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 shrink-0">
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 sm:gap-2">
                  <ListChecks className="w-4 h-4 text-blue-500" />
                  เลือกรายการที่ย้าย
                </h4>
                <span className="text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 sm:py-1 rounded">
                  {selectedItemIds.length}/{currentOrderItems.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 custom-scrollbar">
                {currentOrderItems.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {currentOrderItems.map((item: any) => (
                      <label
                        key={item.id}
                        className={cn(
                          "flex items-stretch gap-2 sm:gap-3 p-1.5 sm:p-2.5 rounded-lg cursor-pointer border transition-all",
                          selectedItemIds.includes(item.id)
                            ? "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20"
                            : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        )}
                      >
                        <div className="flex items-center pt-1 sm:pt-2">
                          <Checkbox
                            checked={selectedItemIds.includes(item.id)}
                            onCheckedChange={() => toggleItemSelection(item.id)}
                            className="w-4 h-4 sm:w-5 sm:h-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.menu?.img ? (
                              <img src={item.menu.img} alt={item.menu?.menuName} className="w-full h-full object-cover" />
                            ) : (
                              <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 opacity-50" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate flex items-center gap-1.5 sm:gap-2">
                              {item.menu?.menuCode && (
                                <span className="text-[9px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1 py-0.5 rounded notranslate">
                                  {item.menu.menuCode}
                                </span>
                              )}
                              <span className="truncate">{item.menu?.menuName || "ไม่ระบุชื่อเมนู"}</span>
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5">
                              จำนวน: {item.quantity} x {((item.price_sum || 0) / (item.quantity || 1)).toLocaleString()}.-
                            </p>
                          </div>
                        </div>

                        <div className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center shrink-0 notranslate">
                          {(item.price_sum || 0).toLocaleString()}.-
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-400 text-xs sm:text-sm">
                    ไม่มีรายการอาหารในโต๊ะนี้
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ตารางฝั่งเลือกโต๊ะปลายทาง */}
          <div className={cn(
            "flex flex-col min-h-0 bg-zinc-50/50 dark:bg-zinc-900/20", 
            moveMode === "PARTIAL" ? "flex-1 sm:flex-none w-full sm:w-1/2" : "w-full flex-1"
          )}>
            <div className="px-4 sm:px-5 py-2 sm:py-3 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950 sticky top-0 z-20 shrink-0">
              <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 sm:gap-2">
                <Armchair className="w-4 h-4 text-zinc-500" />
                เลือกโต๊ะที่ว่าง
              </h4>
              <span className="text-[10px] sm:text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 sm:py-1 rounded-md font-medium">
                ว่าง {availableTables.length} โต๊ะ
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar">
              <div className={cn("grid gap-2 sm:gap-4", moveMode === "PARTIAL" ? "grid-cols-3 sm:grid-cols-2" : "grid-cols-4")}>
                {availableTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTargetId(table.id)}
                    className={cn(
                      "relative group flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-zinc-900",
                      "hover:shadow-md hover:-translate-y-0.5",
                      selectedTargetId === table.id
                        ? "border-blue-600 shadow-blue-100 dark:shadow-blue-900/20 ring-1 ring-blue-600"
                        : "border-transparent shadow-sm hover:border-zinc-300 dark:hover:border-zinc-600"
                    )}
                  >
                    <span
                      className={cn(
                        "text-base sm:text-xl font-bold mb-0.5 sm:mb-1 transition-colors truncate w-full",
                        selectedTargetId === table.id
                          ? "text-blue-600"
                          : "text-zinc-700 dark:text-zinc-300"
                      )}
                    >
                      {table.tableName}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-800 px-1.5 sm:px-2 py-0.5 rounded-full">
                      ว่าง
                    </span>

                    {selectedTargetId === table.id && (
                      <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-blue-600 text-white rounded-full p-0.5 sm:p-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}

                {availableTables.length === 0 && (
                  <div className="col-span-full py-10 flex flex-col items-center justify-center text-center opacity-60">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2 sm:mb-3">
                      <Armchair className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-zinc-500">
                      ไม่มีโต๊ะว่างในขณะนี้
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* ส่วน Footer */}
        {/* ======================================================= */}
        <DialogFooter className="p-3 sm:p-4 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 shrink-0">
          <div className="flex w-full gap-2 sm:gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none h-10 sm:h-10 text-xs sm:text-sm border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className={cn(
                "flex-1 sm:flex-none h-10 sm:h-10 text-xs sm:text-sm min-w-[140px] font-semibold transition-all shadow-sm",
                isConfirmDisabled
                  ? "opacity-50 cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-200 dark:hover:shadow-blue-900/30"
              )}
            >
              {selectedTargetId ? (
                moveMode === "PARTIAL" && selectedItemIds.length === 0 ? (
                  "กรุณาเลือกรายการ"
                ) : (
                  <>
                    ยืนยันย้ายไป {targetTableObj?.tableName}
                    <MoveRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                  </>
                )
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