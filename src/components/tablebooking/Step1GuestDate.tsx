"use client";

import { PropsStep1GuestDate } from "@/lib/type";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import dateList from "@/lib/data_temp";
import {
  Users,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export default function Step1GuestDate({
  data,
  updateData,
  onNext,
  tables,
  initialBookings,
  organizationId,
}: PropsStep1GuestDate) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // เปิด Modal ทันทีถ้ายังไม่ได้เลือกวันที่
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(!data.bookingDate);
  const [mounted, setMounted] = useState(false);

  // ล็อกการเลื่อนหน้าจอเมื่อเปิด Modal
  useEffect(() => {
    setMounted(true);
    if (isGuestModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isGuestModalOpen]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 15);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const handleDateSelect = (day: number) => {
    const newDate = new Date(year, month, day);
    if (data.bookingDate && data.bookingDate.getHours() !== 0) {
      newDate.setHours(
        data.bookingDate.getHours(),
        data.bookingDate.getMinutes(),
      );
    } else {
      newDate.setHours(0, 0, 0, 0);
    }
    updateData({ bookingDate: newDate });
  };

  const handleTimeSelect = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const newDate = data.bookingDate ? new Date(data.bookingDate) : new Date();
    newDate.setHours(hours, minutes, 0, 0);
    updateData({ bookingDate: newDate });
  };

  const isSelectedDate = (day: number) => {
    if (!data.bookingDate) return false;
    return (
      data.bookingDate.getDate() === day &&
      data.bookingDate.getMonth() === month &&
      data.bookingDate.getFullYear() === year
    );
  };

  const selectedTime =
    data.bookingDate && data.bookingDate.getHours() !== 0
      ? `${String(data.bookingDate.getHours()).padStart(2, "0")}:${String(data.bookingDate.getMinutes()).padStart(2, "0")}`
      : null;

  // ==========================================
  // 💡 ปรับใหม่: เริ่มต้นให้ "ไม่มีอันไหนถูกเลือก" (activeIndex = -1)
  // ระบบจะถือว่าเลือกแล้วก็ต่อเมื่อค่าเป็น 4, 8, 12, 16 ตามที่เราเซ็ตไว้ตอนกดปุ่มเท่านั้น
  // ==========================================
  let activeIndex = -1;
  if (data.guestCount >= 13) activeIndex = 3;
  else if (data.guestCount >= 9) activeIndex = 2;
  else if (data.guestCount >= 5) activeIndex = 1;
  else if (data.guestCount === 4) activeIndex = 0; // ต้องเป็น 4 เท่านั้นถึงจะนับว่าเลือก (ค่าตั้งต้น 2 จะถูกมองว่ายังไม่เลือก)

  // ใช้ safeIndex เพื่อป้องกัน Error ตอนยังไม่เลือกอะไรเลย
  const safeIndex = activeIndex === -1 ? 0 : activeIndex;
  const currentRangeMin = dateList.GUEST_RANGES[safeIndex].min;
  const currentRangeMax = dateList.GUEST_RANGES[safeIndex + 1]
    ? dateList.GUEST_RANGES[safeIndex + 1].min - 1
    : 16;

  const handleGuestRangeSelect = (index: number) => {
    const maxGuest = dateList.GUEST_RANGES[index + 1]
      ? dateList.GUEST_RANGES[index + 1].min - 1
      : 16;

    updateData({
      guestCount: maxGuest, // จะบันทึกเป็น 4, 8, 12, หรือ 16
      bookingDate: null,
      selectedTableId: null,
    });

    setIsGuestModalOpen(false);
  };

  const hasAvailableTableForDate = (dateToCheck: Date) => {
    const checkDateStr = dateToCheck.toDateString();
    const isCheckToday = checkDateStr === today.toDateString();

    const bookedTableIds = initialBookings
      .filter((booking) => {
        const isSameDate =
          new Date(booking.bookingDate).toDateString() === checkDateStr;
        const isActiveBooking = ["PENDING", "CONFIRMED"].includes(
          booking.status,
        );
        return isSameDate && isActiveBooking;
      })
      .map((booking) => booking.tableId);

    const availableTables = tables.filter((table) => {
      const isNotBookedInSystem = !bookedTableIds.includes(table.id);
      let isRealtimeAvailable = true;

      if (isCheckToday) {
        const busyStatuses = ["OCCUPIED", "RESERVED", "WAIT_BOOKING"];
        if (busyStatuses.includes(table.status)) {
          isRealtimeAvailable = false;
        }
      }

      const capacity = (table as any).seatCount || (table as any).capacity || 0;
      const isCapacityMatch =
        capacity >= currentRangeMin && capacity <= currentRangeMax;
      const isReservable = (table as any).isReservable !== false;

      return (
        isNotBookedInSystem &&
        isRealtimeAvailable &&
        isCapacityMatch &&
        isReservable
      );
    });

    return availableTables.length > 0;
  };

  const canProceed =
    data.bookingDate !== null &&
    data.bookingDate.getHours() !== 0 &&
    activeIndex !== -1;

  return (
    <div className="space-y-8 animate-fade-in max-w-lg mx-auto">
      {/* 1. ปุ่มแสดง/แก้ไข จำนวนลูกค้า */}
      <div className="flex flex-col items-center space-y-3">
        <label className="flex items-center justify-center gap-2 text-base font-medium text-zinc-200">
          <Users className="w-5 h-5 text-amber-500" />
          จำนวนลูกค้า (ท่าน)
        </label>
        <button
          onClick={() => setIsGuestModalOpen(true)}
          className="w-full max-w-[260px] flex flex-col items-center justify-center p-5 rounded-3xl bg-zinc-900/60 border border-white/5 hover:bg-zinc-800 transition-all duration-300 shadow-inner group"
        >
          <span className="text-xs text-zinc-500 font-medium mb-1">
            ช่วงที่เลือกปัจจุบัน
          </span>

          {/* 💡 ถ้ายังไม่เลือก ให้โชว์คำว่า "ยังไม่ได้เลือก" แทน */}
          <span
            className={`text-2xl font-bold transition-colors ${activeIndex !== -1 ? "text-amber-400 group-hover:text-amber-300" : "text-zinc-600"}`}
          >
            {activeIndex !== -1
              ? `${dateList.GUEST_RANGES[activeIndex]?.label} ท่าน`
              : "ยังไม่ได้เลือก"}
          </span>

          <div className="mt-3 bg-zinc-800 text-zinc-300 text-xs px-5 py-1.5 rounded-full group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all font-semibold">
            เปลี่ยนจำนวนคน
          </div>
        </button>
      </div>

      {/* 2. เลือกวันที่ */}
      <div className="space-y-4">
        <label className="flex items-center justify-center gap-2 text-base font-medium text-zinc-200">
          <CalendarDays className="w-5 h-5 text-amber-500" />
          วันที่ต้องการจอง
        </label>
        <div className="border border-white/5 rounded-3xl p-5 bg-zinc-900/40 shadow-inner">
          <div className="flex justify-between items-center mb-6 px-2">
            <button
              onClick={prevMonth}
              className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-zinc-100 text-lg tracking-wide">
              {dateList.MONTHS[month]} {year + 543}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {dateList.DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-xs font-medium text-zinc-500 py-2 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="p-2"></div>
            ))}
            {days.map((day) => {
              const currentRenderDate = new Date(year, month, day);
              currentRenderDate.setHours(0, 0, 0, 0);
              const isOutOfRange =
                currentRenderDate < today || currentRenderDate > maxDate;
              // ถ้ายังไม่เลือกคน ไม่ให้กดเลือกวัน
              const isFull =
                !isOutOfRange &&
                (activeIndex === -1 ||
                  !hasAvailableTableForDate(currentRenderDate));
              const isDisabled = isOutOfRange || isFull;
              const selected = isSelectedDate(day);

              return (
                <button
                  key={day}
                  disabled={isDisabled}
                  onClick={() => handleDateSelect(day)}
                  className={`relative aspect-square flex items-center justify-center rounded-2xl text-sm transition-all duration-300
                    ${
                      isDisabled
                        ? "text-zinc-700 bg-zinc-900/20 cursor-not-allowed"
                        : selected
                          ? "bg-gradient-to-br from-amber-500 to-amber-400 text-zinc-950 font-bold shadow-[0_4px_12px_rgba(245,158,11,0.3)] scale-105"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 border border-transparent hover:border-zinc-700"
                    }`}
                >
                  <span>{day}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. เลือกเวลา (Time Slots) */}
      {data.bookingDate && (
        <div className="space-y-4 animate-fade-in">
          <label className="flex items-center justify-center gap-2 text-base font-medium text-zinc-200">
            <Clock className="w-5 h-5 text-amber-500" />
            เวลาที่ต้องการจอง
          </label>
          <div className="border border-white/5 rounded-3xl p-5 bg-zinc-900/40 shadow-inner">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {dateList.TIME_SLOTS.map((time) => {
                const isSelected = selectedTime === time;

                const isToday =
                  data.bookingDate?.toDateString() ===
                  new Date().toDateString();
                const [h, m] = time.split(":").map(Number);
                const currentHour = new Date().getHours();
                const currentMinute = new Date().getMinutes();
                const isPastTime =
                  isToday &&
                  (currentHour > h ||
                    (currentHour === h && currentMinute >= m));

                return (
                  <button
                    key={time}
                    disabled={isPastTime}
                    onClick={() => handleTimeSelect(time)}
                    className={`py-3 rounded-2xl border text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                      ${
                        isPastTime
                          ? "bg-zinc-900/20 border-white/5 text-zinc-700 cursor-not-allowed"
                          : isSelected
                            ? "bg-gradient-to-br from-amber-500 to-amber-400 border-amber-400 text-zinc-950 shadow-[0_4px_12px_rgba(245,158,11,0.25)]"
                            : "bg-zinc-800/30 border-white/5 text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-800/80 hover:text-amber-400"
                      }
                    `}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`w-full font-bold py-4 px-4 rounded-2xl mt-8 transition-all duration-300 shadow-lg text-lg hover:scale-[1.01] active:scale-[0.99]
          ${
            canProceed
              ? "bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 shadow-amber-500/25"
              : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-white/5"
          }`}
      >
        ค้นหาโต๊ะว่าง
      </button>

      {/* ========================================== */}
      {/* 💡 MODAL: เลือกจำนวนลูกค้า */}
      {/* ========================================== */}
      {mounted &&
        isGuestModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in h-[100dvh] overflow-hidden">
            <div className="bg-zinc-950 border border-white/10 rounded-[2rem] p-6 sm:p-8 w-full max-w-sm shadow-2xl relative animate-scale-up">
              {/* ปุ่มปิด Modal แสดงเมื่อมีการเลือกจำนวนคนไปแล้วเท่านั้น */}
              {activeIndex !== -1 && (
                <button
                  onClick={() => setIsGuestModalOpen(false)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white bg-zinc-900 hover:bg-zinc-800 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <div className="text-center mb-8 mt-2">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/10 rounded-full mb-4 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <Users className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-white">เลือกจำนวนคน</h3>
                <p className="text-zinc-400 text-sm mt-2">
                  โปรดระบุจำนวนคนเพื่อค้นหาโต๊ะที่เหมาะสม
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {dateList.GUEST_RANGES.map((range, index) => {
                  const isSelected = activeIndex === index;
                  return (
                    <button
                      key={range.min}
                      onClick={() => handleGuestRangeSelect(index)}
                      className={`py-4 rounded-2xl border transition-all duration-300 text-center text-sm font-bold hover:scale-[1.02] active:scale-[0.98] ${
                        isSelected
                          ? "bg-gradient-to-br from-amber-500 to-amber-400 border-amber-400 text-zinc-950 shadow-[0_8px_16px_rgba(245,158,11,0.25)]"
                          : "bg-zinc-900 border-white/5 text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-400 shadow-inner"
                      }`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
