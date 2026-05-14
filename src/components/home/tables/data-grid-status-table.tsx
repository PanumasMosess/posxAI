"use client";

import { useState } from "react";
import { StatusTable } from "@/lib/type";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  tables: StatusTable[];
};

export const Data_grid_status_table = ({ tables }: Props) => {
  const [search, setSearch] = useState("");
  const filteredTables = tables.filter((t) =>
    t.tableName.toLowerCase().includes(search.toLowerCase())
  );

  const handleTableClick = (id: string | number, organizationId: string | number | null) => {
    const origin = window.location.origin;
    const orgId = organizationId ?? 0;
    const url = `${origin}/orders?table=${id}&organizationId=${orgId}`;
    window.open(url, "_blank", "width=390,height=844,left=100,top=100");
  };

  const getStatusDetail = (status: string) => {
    switch (status) {
      case "OCCUPIED":
        return { label: "ไม่ว่าง", color: "text-red-500", bg: "bg-red-500", border: "border-red-500/40", glow: "shadow-[0_0_15px_rgba(239,68,68,0.2)]" };
      case "RESERVED":
        return { label: "จองแล้ว", color: "text-yellow-500", bg: "bg-yellow-500", border: "border-yellow-500/40", glow: "shadow-[0_0_15px_rgba(234,179,8,0.2)]" };
      case "DIRTY":
        return { label: "รอทำความสะอาด", color: "text-zinc-400", bg: "bg-zinc-400", border: "border-zinc-400/40", glow: "shadow-[0_0_15px_rgba(161,161,170,0.2)]" };
      case "WAIT_BOOKING":
        return { label: "รอจอง", color: "text-blue-500", bg: "bg-blue-500", border: "border-blue-500/40", glow: "shadow-[0_0_15px_rgba(59,130,246,0.2)]" };
      default:
        return { label: "ว่าง", color: "text-emerald-500", bg: "bg-emerald-500", border: "border-emerald-500/40", glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]" };
    }
  };

  const statusLegend = [
    { name: "ว่าง", color: "bg-emerald-500" },
    { name: "ไม่ว่าง", color: "bg-red-500" },
    { name: "จองแล้ว", color: "bg-yellow-500" },
    { name: "รอความสะอาด", color: "bg-zinc-400" },
    { name: "รอจอง", color: "bg-blue-500" },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 p-4 animate-in fade-in duration-500">

      {/* Header: Search & Minimal Legend */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-4 border-b border-zinc-800/40">
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
          <Input
            placeholder="ค้นหาโต๊ะ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900/30 border-zinc-800 text-sm rounded-xl h-10 focus:ring-1 focus:ring-orange-500/30"
          />
        </div>

        {/* Legend ขนาดเล็ก */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {statusLegend.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", item.color)} />
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-tight">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-12 pt-4">
        {filteredTables.map((table) => {
          const detail = getStatusDetail(table.status);

          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table.id, table.organizationId)}
              className="flex flex-col items-center gap-4 cursor-pointer group active:scale-95 transition-transform"
            >
              {/* Circular Table Body */}
              <div className={cn(
                "relative w-28 h-28 rounded-full border-2 transition-all duration-300",
                "bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center",
                "group-hover:scale-105 shadow-2xl",
                detail.border,
                detail.glow
              )}>
                {/* Status Dot */}
                <div className={cn("absolute top-3 right-3 w-2.5 h-2.5 rounded-full z-10 shadow-sm", detail.bg)} />

                <div className="text-center px-3 z-10">
                  <p className={cn("text-[8px] font-bold uppercase tracking-[0.2em] mb-0.5", detail.color)}>
                    {detail.label}
                  </p>
                  <h3 className="text-white font-bold text-base tracking-tight leading-tight">
                    {table.tableName}
                  </h3>
                </div>

                {/* Subtle Shine */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
              </div>

              {/* Outside Labels */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-zinc-300 font-semibold text-xs text-center line-clamp-1 group-hover:text-white transition-colors">
                  {table.tableName}
                </span>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-zinc-900/60 rounded-full border border-zinc-800">
                  <Users className="w-2.5 h-2.5 text-zinc-500" />
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                    {table.seatCount} Seats
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};