"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export function useIdleTimeout(timeout: number) {
  const [isLocked, setIsLocked] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const lockScreen = useCallback(() => {
    setIsLocked(true);
  }, []);

  const resetTimer = useCallback(() => {
    if (isLocked) return; // ถ้าล็อกอยู่แล้ว ไม่ต้องรีเซ็ตเวลา

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(lockScreen, timeout);
  }, [isLocked, lockScreen, timeout]);

  useEffect(() => {
    const events = [
      "mousemove",
      "keydown",
      "mousedown",
      "touchstart",
      "scroll",
    ];

    // ตั้งค่า event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // เริ่ม timer ครั้งแรก
    resetTimer();

    // Cleanup function
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);

  // คืนค่า isLocked, ฟังก์ชันปลดล็อก และฟังก์ชันรีเซ็ตเวลา
  return { isLocked, setIsLocked, resetTimer };
}
