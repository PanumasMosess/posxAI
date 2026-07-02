"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  PlusCircle,
  Banknote,
  QrCode,
  User,
  Delete,
} from "lucide-react";

interface SplitTenderPanelProps {
  splitTenders: any[];
  splitRemaining: number;
  currency: string;
  updateSplitTender: (id: string, field: string, value: any) => void;
  removeSplitTender: (id: string) => void;
  addSplitTender: () => void;
}

export default function SplitTenderPanel({
  splitTenders,
  splitRemaining,
  currency,
  updateSplitTender,
  removeSplitTender,
  addSplitTender,
}: SplitTenderPanelProps) {
  // 🟢 ฟังก์ชัน Numpad ธรรมดา (พิมพ์ตัวเลขต่อท้าย)
  const handleMiniNumpad = (id: string, currentAmount: any, value: string) => {
    let strAmount = String(currentAmount || "0");

    if (value === "C") {
      strAmount = "0";
    } else if (value === "BACK") {
      strAmount = strAmount.length > 1 ? strAmount.slice(0, -1) : "0";
    } else if (value === ".") {
      if (!strAmount.includes(".")) {
        strAmount += ".";
      }
    } else {
      strAmount = strAmount === "0" ? value : strAmount + value;
    }

    updateSplitTender(id, "amount", strAmount);
  };

  // 🟢 ฟังก์ชันคีย์ลัด (บวกเพิ่มจากยอดเดิม)
  const handleQuickAdd = (
    id: string,
    currentAmount: any,
    addAmount: number,
  ) => {
    const current = Number(currentAmount) || 0;
    const newAmount = current + addAmount;
    updateSplitTender(id, "amount", String(newAmount));
  };

  return (
    <div className="mx-5 p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex justify-between items-center mb-2">
        <Label className="font-bold">รายการแบ่งจ่าย</Label>

        <Badge
          variant={splitRemaining === 0 ? "default" : "destructive"}
          className="font-mono"
        >
          {splitRemaining > 0
            ? `ขาดอีก: ${splitRemaining.toLocaleString()} ${currency}`
            : splitRemaining < 0
              ? `เกินมา: ${Math.abs(splitRemaining).toLocaleString()} ${currency}`
              : `ยอดพอดีครบแล้ว`}
        </Badge>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
        {splitTenders.map((tender, index) => (
          <div
            key={tender.id}
            className="flex flex-col gap-3 bg-white dark:bg-zinc-950 p-4 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 relative"
          >
            {splitTenders.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:bg-red-50 shrink-0 z-10"
                onClick={() => removeSplitTender(tender.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            <div className="pr-6">
              <Label className="text-xs text-zinc-500 mb-2 block">
                ช่องทางการจ่ายที่ {index + 1}
              </Label>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <Button
                  variant={tender.method === "CASH" ? "default" : "outline"}
                  className={`h-9 text-xs ${
                    tender.method === "CASH"
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                      : ""
                  }`}
                  onClick={() => updateSplitTender(tender.id, "method", "CASH")}
                >
                  <Banknote className="mr-1 h-3 w-3" /> เงินสด
                </Button>
                <Button
                  variant={tender.method === "QR" ? "default" : "outline"}
                  className={`h-9 text-xs ${
                    tender.method === "QR"
                      ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                      : ""
                  }`}
                  onClick={() => updateSplitTender(tender.id, "method", "QR")}
                >
                  <QrCode className="mr-1 h-3 w-3" /> โอน/QR
                </Button>
                <Button
                  variant={tender.method === "MEMBER" ? "default" : "outline"}
                  className={`h-9 text-xs ${
                    tender.method === "MEMBER"
                      ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                      : ""
                  }`}
                  onClick={() =>
                    updateSplitTender(tender.id, "method", "MEMBER")
                  }
                >
                  <User className="mr-1 h-3 w-3" /> สมาชิก
                </Button>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <Label className="text-xs text-zinc-500">
                  จำนวนเงิน ({currency})
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  className="h-10 text-right font-bold text-lg"
                  value={tender.amount || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    updateSplitTender(tender.id, "amount", val);
                  }}
                  placeholder="ระบุยอดเงิน"
                />
              </div>

              <div className="grid grid-cols-4 gap-1.5 mt-3">
                {[100000, 50000, 20000, 10000, 5000, 1000].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    className="col-span-2 h-8 text-xs font-medium bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all shadow-sm"
                    onClick={() =>
                      handleQuickAdd(tender.id, tender.amount, amt)
                    }
                  >
                    +{amt.toLocaleString()}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "C",
                  "0",
                  "BACK",
                ].map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    className={`h-8 text-xs font-semibold ${
                      key === "C" ? "text-red-500 hover:text-red-600" : ""
                    }`}
                    onClick={() =>
                      handleMiniNumpad(tender.id, tender.amount, key)
                    }
                  >
                    {key === "BACK" ? (
                      <Delete className="h-4 w-4 text-zinc-500" />
                    ) : (
                      key
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {splitRemaining > 0 && (
        <Button
          variant="outline"
          className="w-full border-dashed border-2 h-10 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          onClick={addSplitTender}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มช่องทางการจ่าย
        </Button>
      )}
    </div>
  );
}
