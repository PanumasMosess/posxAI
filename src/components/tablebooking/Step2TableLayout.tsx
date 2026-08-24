"use client";

import {
  getBookingSettingsAction,
  verifyTableAvailableAction,
} from "@/lib/actions/actionTableBooking";
import { PropsStep2TableLayout } from "@/lib/type";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, MapPin, Users } from "lucide-react";
import dateList from "@/lib/data_temp";

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

  let activeIndex = dateList.GUEST_RANGES?.findIndex(
    (r) => r.min === data.guestCount,
  );
  if (activeIndex === -1 && dateList.GUEST_RANGES) {
    if (data.guestCount >= 13) activeIndex = 3;
    else if (data.guestCount >= 9) activeIndex = 2;
    else if (data.guestCount >= 5) activeIndex = 1;
    else activeIndex = 0;
  }
  const displayGuestCount =
    activeIndex !== -1 && dateList.GUEST_RANGES
      ? dateList.GUEST_RANGES[activeIndex].label
      : data.guestCount;

  return (
    <div className="space-y-6 relative max-w-2xl mx-auto animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">
          เลือกตำแหน่งโต๊ะ
        </h2>
        <div className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
          <Users className="w-4 h-4" />
          ค้นหาสำหรับ: {displayGuestCount} ท่าน
        </div>
      </div>

      {layoutUrl && (
        <button
          onClick={() => setShowLayoutModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-white/5 py-4 rounded-2xl transition-all duration-300 font-medium group"
        >
          <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
          ดูแผนผังร้าน (Store Layout)
        </button>
      )}

      <div className="bg-zinc-900/40 p-4 sm:p-6 rounded-3xl border border-white/5 shadow-inner">
        <div className="max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
            {tables.map((table) => {
              const isSelected = data.selectedTableId === table.id;
              const isBookedInSystem = (table as any).isBookedForDate;
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
                if (table.status === "DIRTY") realtimeBadge = "DIRTY";
              }

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
                    relative p-3 min-h-[90px] rounded-2xl transition-all duration-300 flex flex-col items-center justify-center overflow-hidden border
                    ${
                      isDisabled
                        ? "border-white/5 bg-zinc-900/30 opacity-40 cursor-not-allowed grayscale"
                        : isSelected
                          ? "border-amber-400 bg-gradient-to-br from-amber-500/20 to-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.02]"
                          : "border-white/10 bg-zinc-800/40 hover:border-amber-500/50 hover:bg-zinc-800/80 hover:shadow-lg"
                    }
                  `}
                >
                  {/* Status Badges */}
                  <div className="absolute top-0 right-0">
                    {isBookedInSystem && (
                      <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-bl-xl shadow-sm">
                        ติดจอง
                      </span>
                    )}
                    {!isBookedInSystem && realtimeBadge === "RESERVED" && (
                      <span className="text-[10px] font-bold bg-yellow-500 text-yellow-950 px-2 py-0.5 rounded-bl-xl shadow-sm">
                        จองแล้ว
                      </span>
                    )}
                    {!isBookedInSystem && realtimeBadge === "WAIT_BOOKING" && (
                      <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-bl-xl shadow-sm">
                        รอจอง
                      </span>
                    )}
                    {!isBookedInSystem && realtimeBadge === "OCCUPIED" && (
                      <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-bl-xl shadow-sm">
                        ไม่ว่าง
                      </span>
                    )}
                    {!isBookedInSystem && realtimeBadge === "DIRTY" && (
                      <span className="text-[10px] font-bold bg-zinc-600 text-white px-2 py-0.5 rounded-bl-xl shadow-sm">
                        รอล้าง
                      </span>
                    )}
                    {!isBookedInSystem && !isBusyRealtime && !isEnoughSeats && (
                      <span className="text-[10px] font-bold bg-orange-500/80 text-white px-2 py-0.5 rounded-bl-xl shadow-sm">
                        ไม่พอ
                      </span>
                    )}
                  </div>

                  <span
                    className={`font-black text-lg truncate w-full text-center mt-2 ${isDisabled ? "text-zinc-600" : isSelected ? "text-amber-400" : "text-zinc-200"}`}
                  >
                    {table.tableName}
                  </span>
                  <span
                    className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${isDisabled ? "text-zinc-600" : "text-zinc-400"}`}
                  >
                    <Users className="w-3 h-3" /> {tableCapacity}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6 mt-6 border-t border-white/5">
        <button
          onClick={onPrev}
          disabled={isChecking}
          className="w-1/3 px-6 py-4 rounded-2xl border border-white/10 bg-zinc-900/50 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          ย้อนกลับ
        </button>
        <button
          onClick={handleVerifyAndNext}
          disabled={!data.selectedTableId || isChecking}
          className="w-2/3 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-bold hover:from-amber-400 hover:to-amber-300 transition-all disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-[0_8px_16px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.3)] hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2 justify-center"
        >
          {isChecking && <Loader2 className="w-5 h-5 animate-spin" />}
          {isChecking ? "กำลังตรวจสอบ..." : "ดำเนินการต่อ"}
        </button>
      </div>

      {/* Modal แผนผังร้าน */}
      {showLayoutModal && layoutUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-opacity animate-fade-in"
          onClick={() => setShowLayoutModal(false)}
        >
          <button
            onClick={() => setShowLayoutModal(false)}
            className="absolute top-6 right-6 text-zinc-400 bg-zinc-900 hover:bg-amber-500 hover:text-zinc-950 rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-all z-10 border border-white/10"
          >
            &times;
          </button>
          <img
            src={layoutUrl}
            alt="Store Layout"
            className="w-full max-w-4xl max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
