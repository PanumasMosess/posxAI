"use client";

import React from "react";
import clsx from "clsx";
import { Crown, Martini, Sofa } from "lucide-react";
import {TableCardProps} from "@/lib/type";
import status from "@/lib/data_temp";

const Chair = ({ style, className }: { style?: React.CSSProperties; className?: string }) => (
  <div
    style={style}
    className={clsx(
      "absolute pointer-events-none w-3.5 h-5 flex flex-col items-center z-0",
      className
    )}
  >
    <div className="w-full h-1.5 rounded-t-sm bg-[#c2b7a8] border-x border-t border-[#a89d8d] shadow-sm" />
    <div className="w-[90%] h-3.5 rounded-b-[3px] bg-gradient-to-b from-[#fdfbf7] to-[#e3d7c5] border border-[#d1c2ae] relative -mt-[1px] shadow-sm">
      <div className="absolute top-0 inset-x-[1px] h-[1px] bg-white opacity-60" />
    </div>
  </div>
);

export default function Table_card_status({ table, onClick }: TableCardProps) {
  const shape = table.shape || "circle";
  const seatCount = table.seatCount || 4;
  const rotation = table.rotation || 0;

  const statusMeta = status.tableStatuses.find((s) => s.value === table.status);
  const themeMap = {
    "bg-green-500": { dot: "bg-emerald-500", glow: "shadow-[0_0_20px_rgba(16,185,129,0.4)]", border: "border-emerald-600/50" },
    "bg-red-500": { dot: "bg-red-500", glow: "shadow-[0_0_20px_rgba(239,68,68,0.4)]", border: "border-red-600/50" },
    "bg-yellow-500": { dot: "bg-amber-500", glow: "shadow-[0_0_20px_rgba(245,158,11,0.4)]", border: "border-amber-600/50" },
    "bg-gray-500": { dot: "bg-zinc-400", glow: "shadow-[0_0_15px_rgba(161,161,170,0.3)]", border: "border-zinc-500/50" },
    "bg-blue-500": { dot: "bg-blue-500", glow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]", border: "border-blue-600/50" },
  };
  const currentTheme = themeMap[statusMeta?.color as keyof typeof themeMap] || themeMap["bg-green-500"];

  const renderChairs = (side: "top" | "bottom" | "left" | "right", rotateDeg: string, offset: string, count: number) => {
    return Array.from({ length: count }).map((_, i) => (
      <Chair
        key={`${side}-${i}`}
        style={{
          left: side === "top" || side === "bottom" ? `${((i + 1) / (count + 1)) * 100}%` : undefined,
          top: side === "left" || side === "right" ? `${((i + 1) / (count + 1)) * 100}%` : undefined,
          transform: (side === "top" || side === "bottom" ? "translateX(-50%)" : "translateY(-50%)") + ` ${rotateDeg}`,
          [side]: offset,
        }}
      />
    ));
  };

  return (
    <div className="w-full h-full relative group p-0 overflow-visible flex items-center justify-center">
      {/* 
         WRAPPER: จัดการการหมุนและตำแหน่งเก้าอี้ 
         ใช้ pointer-events-none เพื่อไม่ให้พื้นที่ว่างๆ รอบโต๊ะขวางการ Resize หรือรับแรงคลิก
      */}
      <div 
        className="relative w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-300"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        
        {/* 1. CHAIRS LAYER */}
        {shape !== "sofa" && (
          <div className="absolute inset-0 pointer-events-none z-0">
            {shape === "bar" ? (
              renderChairs("bottom", "rotate(180deg)", "5%", seatCount)
            ) : (
              <>
                {renderChairs("top", "rotate(0deg)", "-5%", Math.ceil(seatCount / 2))}
                {renderChairs("bottom", "rotate(180deg)", "-5%", Math.floor(seatCount / 2))}
              </>
            )}
          </div>
        )}

        {/* 
            2. TABLE LAYER (ใช้ <button> ตรงนี้เพื่อให้พื้นที่คลิกเท่ากับขนาดโต๊ะจริงๆ)
        */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
          }}
          className={clsx(
            "relative z-20 pointer-events-auto border-[3.5px] flex flex-col items-center justify-center bg-gradient-to-br from-[#f8e8cf] via-[#e2c08f] to-[#c99558] shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.2),0_8px_20px_-5px_rgba(0,0,0,0.15)] transition-all duration-200 active:scale-95",
            currentTheme.border,
            currentTheme.glow,
            shape === "circle" && "w-[75%] h-[75%] rounded-full",
            shape === "square" && "w-[70%] h-[70%] rounded-[12px]",
            shape === "rectangle" && "w-[90%] h-[65%] rounded-[10px]",
            shape === "vip" && "w-[75%] h-[75%] rounded-[15px] bg-gradient-to-br from-[#fef3c7] via-[#f59e0b] to-[#b45309] border-[#92400e]",
            shape === "bar" && "w-[95%] h-[50%] rounded-lg bg-[#2a1a0f] text-white",
            shape === "sofa" && "w-[50%] h-[50%] rounded-lg"
          )}
        >
          {/* Status Dot */}
          <div className="absolute top-1 right-1 flex items-center justify-center">
            <span className={clsx("absolute w-2 h-2 rounded-full animate-ping opacity-30", currentTheme.dot)} />
            <span className={clsx("relative w-1.5 h-1.5 rounded-full border border-white/40", currentTheme.dot)} />
          </div>

          {/* Icons */}
          {shape === "vip" && <Crown className="w-4 h-4 text-[#78350f] mb-0.5" />}
          {shape === "bar" && <Martini className="w-3.5 h-3.5 text-amber-400 mb-0.5 opacity-80" />}
          {shape === "sofa" && <Sofa className="w-3.5 h-3.5 text-[#5c4021] opacity-50 mb-0.5" />}

          {/* Label */}
          <div className="flex flex-col items-center gap-0 z-10 select-none">
            <span className={clsx("text-[8px] font-black uppercase opacity-40 leading-none", shape === "bar" ? "text-white" : "text-[#3d2c18]")}>
              {shape}
            </span>
            <span className={clsx("text-[11px] font-bold tracking-tight leading-tight", shape === "bar" ? "text-white" : "text-[#2a1d0e]")}>
              {table.tableName}
            </span>
          </div>
        </button>

        {/* 3. SOFA EXTRAS */}
        {shape === "sofa" && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
            <div className="w-[53%] h-[18%] bg-[#d1c7b7] border border-[#b9afa1] rounded-t-md shadow-sm mb-[33%]" style={{ filter: 'brightness(0.95)' }} />
            <div className="absolute w-[53%] h-[18%] bg-[#d1c7b7] border border-[#b9afa1] rounded-b-md shadow-sm mt-[33%]" style={{ filter: 'brightness(0.9)' }} />
          </div>
        )}
      </div>
    </div>
  );
}