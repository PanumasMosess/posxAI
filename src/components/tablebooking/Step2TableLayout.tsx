"use client";

import {
  getBookingSettingsAction,
  verifyTableAvailableAction,
} from "@/lib/actions/actionTableBooking";
import { PropsStep2TableLayout } from "@/lib/type";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

export default function Step2TableLayout({
  data,
  tables,
  updateData,
  onNext,
  onPrev,
  organizationId,
}: PropsStep2TableLayout) {
  const router = useRouter();
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [layoutUrl, setLayoutUrl] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await getBookingSettingsAction(organizationId);
        if (res.success && res.data?.storeLayoutUrl) {
          setLayoutUrl(res.data.storeLayoutUrl);
        }
      } catch (error) {
        console.error("Error fetching store layout:", error);
      }
    };
    fetchLayout();
  }, [organizationId]);

  const handleVerifyAndNext = async () => {
    if (!data.selectedTableId || !data.bookingDate) return;

    setIsChecking(true);

    try {
      const res = await verifyTableAvailableAction(
        data.selectedTableId,
        data.bookingDate,
      );

      if (res.success) {
        onNext(); 
      } else {

        toast.error(res.message || "โต๊ะนี้ไม่ว่างแล้ว กรุณาเลือกโต๊ะใหม่", {
          position: "top-center",
          theme: "dark",
        });
        updateData({ selectedTableId: null }); 
        router.refresh(); 
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่");
    } finally {
      setIsChecking(false);
    }
  };

  const isToday = data.bookingDate
    ? new Date(data.bookingDate).toDateString() === new Date().toDateString()
    : false;

  return (
    <div className="space-y-6 relative">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-100">เลือกตำแหน่งโต๊ะ</h2>
        <p className="text-zinc-400 mt-2 text-sm">
          เลื่อนเพื่อดูโต๊ะทั้งหมดสำหรับโซนต่างๆ
        </p>
        <div className="mt-3 text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 inline-block px-4 py-1.5 rounded-full">
          ค้นหาสำหรับ: {data.guestCount} ท่าน
        </div>
      </div>

      {layoutUrl && (
        <button
          onClick={() => setShowLayoutModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 text-amber-400 border border-zinc-700 py-3 rounded-xl transition font-medium shadow-sm"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          ดูแผนผังร้าน
        </button>
      )}

      <div className="bg-zinc-950 p-3 sm:p-4 rounded-xl border border-zinc-800 shadow-inner">
        <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {tables.map((table) => {
              const isSelected = data.selectedTableId === table.id;

              // 1. เช็คว่าติดจองล่วงหน้าในระบบ (เวลาทับซ้อน)
              const isBookedInSystem = (table as any).isBookedForDate;

              // 2. 💡 เช็คสถานะหน้าร้าน (เอาเงื่อนไข 2 ชม. ออกแล้ว บล็อกแบบ 100%)
              let isBusyRealtime = false;
              let realtimeBadge = null;

              if (isToday) {
                if (
                  ["OCCUPIED", "RESERVED", "WAIT_BOOKING"].includes(
                    table.status,
                  )
                ) {
                  isBusyRealtime = true;
                  realtimeBadge = table.status;
                }
                if (table.status === "DIRTY") {
                  realtimeBadge = "DIRTY";
                }
              }

              // 3. เช็คความจุโต๊ะ
              const tableCapacity =
                (table as any).seatCount || (table as any).capacity || 0;
              const isEnoughSeats = tableCapacity >= data.guestCount;

              const isDisabled =
                isBookedInSystem || isBusyRealtime || !isEnoughSeats;

              return (
                <button
                  key={table.id}
                  disabled={isDisabled}
                  onClick={() => updateData({ selectedTableId: table.id })}
                  className={`
                    relative p-2 min-h-[85px] rounded-xl border-2 transition-all flex flex-col items-center justify-center overflow-hidden
                    ${
                      isDisabled
                        ? "border-zinc-800 bg-zinc-900/50 opacity-40 cursor-not-allowed" // กดไม่ได้
                        : isSelected
                          ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30" // เลือกอยู่
                          : "border-zinc-700 bg-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800/80" // ว่าง
                    }
                  `}
                >
                  {isBookedInSystem && (
                    <span className="absolute top-0 right-0 text-[9px] font-bold bg-red-900/80 text-red-300 px-1.5 py-0.5 rounded-bl-lg">
                      ติดจอง
                    </span>
                  )}

                  {!isBookedInSystem && realtimeBadge === "RESERVED" && (
                    <span className="absolute top-0 right-0 text-[9px] font-bold bg-yellow-600/80 text-yellow-100 px-1.5 py-0.5 rounded-bl-lg">
                      จองแล้ว
                    </span>
                  )}

                  {!isBookedInSystem && realtimeBadge === "WAIT_BOOKING" && (
                    <span className="absolute top-0 right-0 text-[9px] font-bold bg-blue-600/80 text-blue-100 px-1.5 py-0.5 rounded-bl-lg">
                      รอจอง
                    </span>
                  )}

                  {!isBookedInSystem && realtimeBadge === "OCCUPIED" && (
                    <span className="absolute top-0 right-0 text-[9px] font-bold bg-red-600/80 text-red-100 px-1.5 py-0.5 rounded-bl-lg">
                      ไม่ว่าง
                    </span>
                  )}

                  {!isBookedInSystem && realtimeBadge === "DIRTY" && (
                    <span className="absolute top-0 right-0 text-[9px] font-bold bg-gray-600/80 text-gray-100 px-1.5 py-0.5 rounded-bl-lg">
                      รอล้าง
                    </span>
                  )}

                  {!isBookedInSystem && !isBusyRealtime && !isEnoughSeats && (
                    <span className="absolute top-0 right-0 text-[9px] font-bold bg-orange-900/80 text-orange-300 px-1.5 py-0.5 rounded-bl-lg">
                      ไม่พอ
                    </span>
                  )}

                  <span
                    className={`font-bold text-sm truncate w-full text-center mt-2 ${isDisabled ? "text-zinc-500" : isSelected ? "text-amber-400" : "text-zinc-200"}`}
                  >
                    {table.tableName}
                  </span>

                  <span
                    className={`text-[10px] mt-1 ${isDisabled ? "text-zinc-600" : "text-zinc-400"}`}
                  >
                    {tableCapacity} ที่นั่ง
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-zinc-800">
        <button
          onClick={onPrev}
          disabled={isChecking}
          className="px-6 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          ย้อนกลับ
        </button>

        <button
          onClick={handleVerifyAndNext}
          disabled={!data.selectedTableId || isChecking}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center gap-2 justify-center"
        >
          {isChecking && <Loader2 className="w-4 h-4 animate-spin" />}
          {isChecking ? "กำลังตรวจสอบ..." : "ถัดไป"}
        </button>
      </div>

      {showLayoutModal && layoutUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setShowLayoutModal(false)}
        >
          <button
            onClick={() => setShowLayoutModal(false)}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-300 bg-zinc-900/50 hover:bg-amber-500 hover:text-black rounded-full w-10 h-10 flex items-center justify-center text-2xl transition z-10 border border-zinc-700"
          >
            &times;
          </button>
          <img
            src={layoutUrl}
            alt="Store Layout"
            className="w-full max-w-4xl max-h-[85vh] object-contain rounded-xl shadow-2xl animate-fade-in bg-zinc-900/50"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
