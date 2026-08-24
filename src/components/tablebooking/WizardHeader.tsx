import React from "react";
import { Check } from "lucide-react";

export default function WizardHeader({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: "ค้นหา" },
    { num: 2, label: "เลือกโต๊ะ" },
    { num: 3, label: "ข้อมูล" },
    { num: 4, label: "ชำระเงิน" },
  ];

  return (
    <div className="bg-zinc-950/80 backdrop-blur-md p-6 text-zinc-100 border-b border-zinc-800/50">
      <h2 className="text-2xl md:text-3xl font-black mb-8 text-center bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 bg-clip-text text-transparent tracking-widest">
        TABLE BOOKING
      </h2>

      <div className="relative max-w-lg mx-auto">
        {/* เส้นเชื่อม Progress Line */}
        <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-zinc-800 rounded-full -z-10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="flex items-start justify-between">
          {steps.map(({ num, label }) => {
            const isActive = currentStep === num;
            const isCompleted = currentStep > num;

            return (
              <div
                key={num}
                className="flex flex-col items-center gap-2 relative z-10 w-16"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isActive
                      ? "bg-amber-500 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110 font-bold"
                      : isCompleted
                        ? "bg-zinc-800 text-amber-400 border border-amber-500/30"
                        : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : num}
                </div>

                <span
                  className={`text-[11px] md:text-xs text-center transition-colors duration-300 ${
                    isActive
                      ? "text-amber-400 font-bold"
                      : isCompleted
                        ? "text-zinc-300 font-medium"
                        : "text-zinc-600"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
