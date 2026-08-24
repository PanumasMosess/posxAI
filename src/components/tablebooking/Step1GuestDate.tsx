"use client";

import { PropsStep1GuestDate } from "@/lib/type";
import React, { useState } from "react";
import dateList from "@/lib/data_temp";
import {
  Users,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
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

  let activeIndex = 0;
  if (data.guestCount >= 13) activeIndex = 3;
  else if (data.guestCount >= 9) activeIndex = 2;
  else if (data.guestCount >= 5) activeIndex = 1;
  else activeIndex = 0;

  const currentRangeMin = dateList.GUEST_RANGES[activeIndex].min;
  const currentRangeMax = dateList.GUEST_RANGES[activeIndex + 1]
    ? dateList.GUEST_RANGES[activeIndex + 1].min - 1
    : 16;

  const handleGuestRangeSelect = (index: number) => {
    const maxGuest = dateList.GUEST_RANGES[index + 1]
      ? dateList.GUEST_RANGES[index + 1].min - 1
      : 16;

    updateData({
      guestCount: maxGuest,
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
    data.bookingDate !== null && data.bookingDate.getHours() !== 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-lg mx-auto">
      {/* 1. เลือกจำนวนลูกค้า */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-base font-medium text-zinc-200">
          <Users className="w-5 h-5 text-amber-500" />
          จำนวนลูกค้า (ท่าน)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {dateList.GUEST_RANGES.map((range, index) => {
            const isSelected = activeIndex === index;
            return (
              <button
                key={range.min}
                onClick={() => handleGuestRangeSelect(index)}
                className={`py-3.5 rounded-2xl border transition-all duration-300 text-center text-sm font-medium hover:scale-[1.02] active:scale-[0.98] ${
                  isSelected
                    ? "bg-gradient-to-br from-amber-500 to-amber-400 border-amber-400 text-zinc-950 shadow-[0_8px_16px_rgba(245,158,11,0.25)]"
                    : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-amber-500/50 hover:bg-zinc-800/80 hover:text-zinc-200"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. เลือกวันที่ */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-base font-medium text-zinc-200">
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
              const isFull =
                !isOutOfRange && !hasAvailableTableForDate(currentRenderDate);
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
          <label className="flex items-center gap-2 text-base font-medium text-zinc-200">
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
    </div>
  );
}
