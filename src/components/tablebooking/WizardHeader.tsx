import React from "react";

export default function WizardHeader({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: "ค้นหา" },
    { num: 2, label: "เลือกโต๊ะ" },
    { num: 3, label: "ข้อมูล" },
    { num: 4, label: "ชำระเงิน" },
  ];

  return (
    // เปลี่ยนพื้นหลังเป็นสีดำเทา (zinc-950) และเพิ่มเส้นขอบล่างสีเทาเข้ม
    <div className="bg-zinc-950 p-6 text-zinc-100 border-b border-zinc-800">
      <h2 className="text-2xl font-bold mb-6 text-center text-amber-500 tracking-wider">
        จองโต๊ะ
      </h2>

      <div className="relative max-w-lg mx-auto">
        {/* เส้นเชื่อม Progress Line (สีเทาเข้ม) */}
        <div className="absolute top-4 left-0 w-full h-1 bg-zinc-800 -z-10 transform -translate-y-1/2"></div>

        <div className="flex items-center justify-between text-sm font-medium">
          {steps.map(({ num, label }) => {
            const isActive = currentStep >= num; // เช็คว่าถึง Step นี้หรือยัง

            return (
              <div
                key={num}
                className="flex flex-col items-center gap-2 relative"
              >
                {/* วงกลมตัวเลข */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-amber-500 text-zinc-950 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold" // สไตล์ Step ที่ผ่านมาแล้ว (สีทอง มีแสง)
                      : "bg-zinc-900 text-zinc-600 border-zinc-700" // สไตล์ Step ที่ยังไม่ถึง (สีเทา)
                  }`}
                >
                  {num}
                </div>

                {/* ข้อความบอก Step */}
                <span
                  className={`text-xs transition-colors ${
                    isActive ? "text-amber-400 font-semibold" : "text-zinc-600"
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
