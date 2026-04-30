"use client";

import { useState, useEffect } from "react";
import { useIdleTimeout } from "@/lib/useIdleTimeout";
import { useSession } from "next-auth/react";
import { Lock, Delete, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { verifyPositionPin } from "@/lib/auth-helpers";
import { useUser } from "./providers/PositionContext";

export default function IdleTimeoutHandler() {
  const { isLocked, setIsLocked, resetTimer } = useIdleTimeout(1800000);
  // const { isLocked, setIsLocked, resetTimer } = useIdleTimeout(1800);
  const { setUser, clearUser } = useUser();

  const { data: session } = useSession();

  const organizationId = (session?.user as any)?.organizationId;

  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (pin.length === 4 && !isVerifying && !isError) {
      handleUnlock();
    }
  }, [pin]);

  useEffect(() => {
    if (isLocked) {
      clearUser();
    }
  }, [isLocked]);

  const handleNumpad = (num: string) => {
    if (isError) {
      setPin(num);
      setIsError(false);
      return;
    }
    if (pin.length < 4) setPin((prev) => prev + num);
  };

  const handleBackspace = () => {
    if (isError) {
      setPin("");
      setIsError(false);
      return;
    }
    setPin((prev) => prev.slice(0, -1));
  };

  const handleUnlock = async () => {
    if (pin.length < 4) return;
    if (!organizationId) {
      toast.error("ไม่พบข้อมูลสาขา");
      setPin("");
      return;
    }

    setIsVerifying(true);
    setIsError(false);

    try {
      const result = await verifyPositionPin(pin, Number(organizationId));

      if (result.success) {
        setIsLocked(false);
        setPin("");
        resetTimer();

        // ✅ แก้ไขให้ส่งค่าเข้าไปใน Context ครบทั้ง 4 ตัว
        setUser(
          result.employeeId ?? null,
          result.employeeName ?? null,
          result.positionId ?? null,
          result.positionName ?? null,
        );

        toast.success(`ปลดล็อกสำเร็จ (พนักงาน: ${result.employeeName})`);
      } else {
        setIsError(true);
        setTimeout(() => {
          setPin("");
          setIsError(false);
        }, 1000);

        console.log(result.message);
      }
    } catch (error) {
      toast.error("ระบบขัดข้อง โปรดลองอีกครั้ง");
      setPin("");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!isLocked) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVerifying) return;

      if (e.key === "Enter" && pin.length === 4) handleUnlock();
      else if (e.key === "Backspace") handleBackspace();
      else if (!isNaN(Number(e.key)) && e.key !== " ") handleNumpad(e.key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked, pin, isVerifying, isError]);

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <Lock className="h-8 w-8" />
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
          หน้าจอถูกล็อก
        </h2>

        <p
          className={`text-sm mb-6 text-center transition-colors duration-300 ${
            isError ? "text-red-500 font-semibold" : "text-zinc-500"
          }`}
        >
          {isError ? (
            "รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่"
          ) : (
            <>
              กรุณากรอกรหัส PIN ตำแหน่งของคุณ <br />
              เพื่อเข้าสู่ระบบทำรายการ
            </>
          )}
        </p>

        <div className="flex gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-5 w-5 rounded-full border-2 transition-all duration-200 ${
                isError && i < pin.length
                  ? "bg-red-500 border-red-500 scale-110"
                  : i < pin.length
                    ? "bg-primary border-primary scale-110"
                    : "bg-transparent border-zinc-300 dark:border-zinc-700"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="outline"
              className="h-16 text-2xl font-medium rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              onClick={() => handleNumpad(num.toString())}
            >
              {num}
            </Button>
          ))}
          <div />
          <Button
            variant="outline"
            className="h-16 text-2xl font-medium rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            onClick={() => handleNumpad("0")}
          >
            0
          </Button>
          <Button
            variant="outline"
            className="h-16 text-2xl font-medium rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-none"
            onClick={handleBackspace}
          >
            <Delete className="h-6 w-6" />
          </Button>
        </div>

        <Button
          className="w-full h-14 text-lg rounded-2xl font-bold"
          onClick={handleUnlock}
          disabled={isVerifying || pin.length < 4}
        >
          {isVerifying ? (
            "กำลังตรวจสอบ..."
          ) : (
            <>
              <Unlock className="mr-2 h-5 w-5" /> ปลดล็อก
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
