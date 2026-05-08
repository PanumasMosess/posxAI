"use client";

import React, { useState, useEffect } from "react";
import { Hourglass } from "lucide-react";
import { CountdownTimerProps } from "@/lib/type";

const CountdownTimer = ({
  startTime,
  packageHours,
  quantity,
  unit,
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("กำลังคำนวณ...");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const durationHours =
      packageHours > 0 ? packageHours : unit?.includes("ชม") ? quantity : 0;

    if (durationHours <= 0) return;

    const startMs = new Date(startTime).getTime();
    const endMs = startMs + durationHours * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endMs - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("หมดเวลาแล้ว");
        setIsExpired(true);
        return;
      }

      const h = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${h}ชม. ${m}น. ${s}วิ.`);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, packageHours, quantity, unit]);

  if (packageHours === 0 && !unit?.includes("ชม")) return null;

  return (
    <div
      className={`flex items-center gap-1.5 mt-2 px-3 py-1 w-fit rounded-lg text-xs sm:text-sm font-bold border shadow-sm transition-colors ${
        isExpired
          ? "bg-red-50 text-red-600 border-red-300 dark:bg-red-900/40 dark:border-red-700"
          : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:border-blue-700 animate-pulse"
      }`}
    >
      <Hourglass className="w-4 h-4" />
      <span className="tracking-wide">
        {isExpired ? "หมดเวลา" : `เหลือเวลา: ${timeLeft}`}
      </span>
    </div>
  );
};

export default CountdownTimer;
