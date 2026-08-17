"use client";

import { PropsStep1GuestDate } from "@/lib/type";
import React, { useState } from "react";
import dateList from "@/lib/data_temp";

export default function Step1GuestDate({
  data,
  updateData,
  onNext,
  tables,
  initialBookings,
  organizationId,
}: PropsStep1GuestDate) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  // ==========================================
  // 💡 Logic การเลือกวันที่ และคงเวลาเดิมไว้
  // ==========================================
  const handleDateSelect = (day: number) => {
    const newDate = new Date(year, month, day);
    // ถ้าเคยเลือกเวลาไว้แล้ว ให้ดึงเวลาเดิมมาใส่ด้วย
    if (data.bookingDate && data.bookingDate.getHours() !== 0) {
      newDate.setHours(
        data.bookingDate.getHours(),
        data.bookingDate.getMinutes(),
      );
    } else {
      newDate.setHours(0, 0, 0, 0); // 00:00 แปลว่ายังไม่ได้เลือกเวลา
    }
    updateData({ bookingDate: newDate });
  };

  // ==========================================
  // 💡 Logic การเลือกเวลา
  // ==========================================
  const handleTimeSelect = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    // ถ้ายังไม่ได้เลือกวัน ให้ใช้วันนี้เป็นค่าเริ่มต้น
    const newDate = data.bookingDate ? new Date(data.bookingDate) : new Date();
    newDate.setHours(hours, minutes, 0, 0);
    updateData({ bookingDate: newDate });
  };

  // ตรวจสอบวันที่เลือก
  const isSelectedDate = (day: number) => {
    if (!data.bookingDate) return false;
    return (
      data.bookingDate.getDate() === day &&
      data.bookingDate.getMonth() === month &&
      data.bookingDate.getFullYear() === year
    );
  };

  // 💡 ตรวจสอบเวลาที่ถูกเลือก
  const selectedTime =
    data.bookingDate && data.bookingDate.getHours() !== 0
      ? `${String(data.bookingDate.getHours()).padStart(2, "0")}:${String(data.bookingDate.getMinutes()).padStart(2, "0")}`
      : null;

  // ==========================================
  // Logic หาว่าตอนนี้เลือกช่วงลูกค้าไหนอยู่
  // ==========================================
  let activeIndex = dateList.GUEST_RANGES.findIndex(
    (r) => r.min === data.guestCount,
  );
  if (activeIndex === -1) {
    if (data.guestCount >= 13) activeIndex = 3;
    else if (data.guestCount >= 9) activeIndex = 2;
    else if (data.guestCount >= 5) activeIndex = 1;
    else activeIndex = 0;
  }

  const currentRangeMin = dateList.GUEST_RANGES[activeIndex].min;
  const currentRangeMax = dateList.GUEST_RANGES[activeIndex + 1]
    ? dateList.GUEST_RANGES[activeIndex + 1].min - 1
    : 16;

  const handleGuestRangeSelect = (min: number) => {
    updateData({
      guestCount: min,
      bookingDate: null,
      selectedTableId: null,
    });
  };

  const hasAvailableTableForDate = (dateToCheck: Date) => {
    const checkDateStr = dateToCheck.toDateString();
    const isCheckToday = checkDateStr === today.toDateString();

    const bookedTableIds = initialBookings
      .filter((booking) => {
        const isSameDate =
          new Date(booking.bookingDate).toDateString() === checkDateStr;
        
        // 💡 แก้ตรงนี้! ให้เช็คเฉพาะ PENDING หรือ CONFIRMED เท่านั้น (ตรงกับ Step 2 เป๊ะ)
        const isActiveBooking = ["PENDING", "CONFIRMED"].includes(booking.status);
        
        return isSameDate && isActiveBooking;
      })
      .map((booking) => booking.tableId);

    const availableTables = tables.filter((table) => {
      const isNotBookedInSystem = !bookedTableIds.includes(table.id);
      let isRealtimeAvailable = true;
      
      // 💡 บล็อกสถานะหน้าร้านกรณีดูของ "วันนี้"
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

  // 💡 เช็คว่ากดปุ่มถัดไปได้ไหม (ต้องมี Date และ Hour ห้ามเป็น 0)
  const canProceed =
    data.bookingDate !== null && data.bookingDate.getHours() !== 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-lg mx-auto">
      {/* 1. เลือกจำนวนลูกค้า */}
      <div>
        <label className="block text-base font-semibold text-zinc-100 mb-3 text-center">
          จำนวนลูกค้า (ท่าน)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {dateList.GUEST_RANGES.map((range, index) => {
            const isSelected = activeIndex === index;
            return (
              <button
                key={range.min}
                onClick={() => handleGuestRangeSelect(range.min)}
                className={`py-3 rounded-xl border transition-all text-center ${
                  isSelected
                    ? "bg-amber-500 border-amber-500 text-zinc-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-800"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. เลือกวันที่ */}
      <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/50 shadow-inner">
        <div className="flex justify-between items-center mb-4 px-2">
          <button
            onClick={prevMonth}
            className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 rounded-full transition"
          >
            &lt;
          </button>
          <span className="font-bold text-zinc-100 text-lg tracking-wide">
            {dateList.MONTHS[month]} {year + 543}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 rounded-full transition"
          >
            &gt;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {dateList.DAYS_OF_WEEK.map((day) => (
            <div key={day} className="text-xs font-semibold text-zinc-500 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="p-2"></div>
          ))}
          {days.map((day) => {
            const currentRenderDate = new Date(year, month, day);
            currentRenderDate.setHours(0, 0, 0, 0);
            const isOutOfRange =
              currentRenderDate < today || currentRenderDate > maxDate;
            const isFull =
              !isOutOfRange && !hasAvailableTableForDate(currentRenderDate);
            const isDisabled = isOutOfRange || isFull;
            const selected = isSelectedDate(day);

            return (
              <button
                key={day}
                disabled={isDisabled}
                onClick={() => handleDateSelect(day)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-full text-sm transition-all
                  ${
                    isDisabled
                      ? "text-zinc-600 bg-zinc-900/30 cursor-not-allowed"
                      : selected
                        ? "bg-amber-500 text-zinc-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 border border-transparent hover:border-zinc-700"
                  }`}
              >
                <span>{day}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 💡 3. เลือกเวลา (Time Slots) */}
      {data.bookingDate && (
        <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/50 shadow-inner animate-fade-in">
          <label className="block text-base font-semibold text-zinc-100 mb-3 text-center">
            เวลาที่ต้องการจอง (Time)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {dateList.TIME_SLOTS.map((time) => {
              const isSelected = selectedTime === time;

              const isToday =
                data.bookingDate?.toDateString() === new Date().toDateString();
              const [h, m] = time.split(":").map(Number);
              const currentHour = new Date().getHours();
              const currentMinute = new Date().getMinutes();
              const isPastTime =
                isToday &&
                (currentHour > h || (currentHour === h && currentMinute >= m));

              return (
                <button
                  key={time}
                  disabled={isPastTime}
                  onClick={() => handleTimeSelect(time)}
                  className={`py-2 rounded-lg border text-sm transition-all text-center
                    ${
                      isPastTime
                        ? "bg-zinc-900/30 border-zinc-800/50 text-zinc-700 cursor-not-allowed"
                        : isSelected
                          ? "bg-amber-500 border-amber-500 text-zinc-950 font-bold shadow-md"
                          : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-400"
                    }
                  `}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`w-full font-bold py-3 px-4 rounded-xl mt-4 transition-all shadow-lg
          ${canProceed ? "bg-amber-500 hover:bg-amber-400 text-zinc-950" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}
      >
        ค้นหาโต๊ะว่าง
      </button>
    </div>
  );
}