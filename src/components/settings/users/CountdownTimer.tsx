import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

// ✅ Component ตัวจับเวลาถอยหลัง
 const CountdownTimer = ({
  startTime,
  packageHours,
  quantity,
  unit,
}: {
  startTime: string | Date;
  packageHours: number;
  quantity: number;
  unit: string;
}) => {
  const [timeLeft, setTimeLeft] = useState<string>("กำลังคำนวณ...");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // คำนวณว่าได้เวลากี่ชั่วโมง
    // ถ้ามีแพ็กเกจเหมา ใช้ packageHours, ถ้าไม่มีแพ็กเกจ เช็คว่าหน่วยเป็น "ชม." หรือไม่ ถ้าใช่ใช้ quantity
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

  // ถ้าไม่ใช่รายชั่วโมง ไม่ต้องโชว์
  if (packageHours === 0 && !unit?.includes("ชม")) return null;

  return (
    <div
      className={`flex items-center gap-1 mt-1.5 px-2 py-0.5 w-fit rounded-md text-[10px] font-semibold border ${
        isExpired
          ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30"
          : "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 animate-pulse"
      }`}
    >
      <Clock className="w-3 h-3" />
      <span>{isExpired ? "หมดเวลา" : `เหลือ: ${timeLeft}`}</span>
    </div>
  );
};

export default CountdownTimer;