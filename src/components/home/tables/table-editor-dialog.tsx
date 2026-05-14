"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Armchair,
  Crown,
  Martini,
  Sofa,
  Users,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableEditorProps} from "@/lib/type";
import { updateTableDesign } from "@/lib/actions/actionSettings";
import Table_card_status from "./table-card-status";

const shapes = [
  { value: "circle", label: "โต๊ะกลม", icon: Armchair },
  { value: "square", label: "โต๊ะเหลี่ยม", icon: Armchair },
  { value: "rectangle", label: "โต๊ะยาว", icon: Armchair },
  { value: "vip", label: "โต๊ะ VIP", icon: Crown },
  { value: "bar", label: "เคาน์เตอร์บาร์", icon: Martini },
  { value: "sofa", label: "โซฟา", icon: Sofa },
];

const rotations = [
  { value: 0, label: "แนวนอน", icon: ArrowDown },
  { value: 90, label: "แนวตั้ง", icon: ArrowRight },
  { value: 180, label: "แนวนอนกลับ", icon: ArrowUp },
  { value: 270, label: "แนวตั้งกลับ", icon: ArrowLeft },
];

const Table_editor_dialog = ({ open, onClose, table, onSaved }: TableEditorProps) => {
  const [tableName, setTableName] = useState("");
  const [shape, setShape] = useState("circle");
  const [rotation, setRotation] = useState(0);
  const [seatCount, setSeatCount] = useState(4);

  const defaultSeats = [2, 4, 6, 8, 10, 12];

  useEffect(() => {
    if (table) {
      setTableName(table.tableName);
      setShape(table.shape || "circle");
      setRotation(table.rotation || 0);
      setSeatCount(table.seatCount || 4);
    }
  }, [table]);

  if (!table) return null;

  const isVertical = rotation === 90 || rotation === 270;

  const handleCustomSeatChange = (value: string) => {
    if (value === "") {
      setSeatCount(0);
      return;
    }
    const num = parseInt(value);
    if (!isNaN(num)) {
      setSeatCount(num);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        className="sm:max-w-[580px] w-[95vw] max-h-[95vh] overflow-hidden border-zinc-800 bg-[#090909] text-white p-0 flex flex-col"
      >
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">แก้ไขโต๊ะ</DialogTitle>
          </DialogHeader>
        </div>

        {/* ส่วนเนื้อหาที่เลื่อนได้ */}
        <div className="flex-1 overflow-y-auto px-6 space-y-6 custom-scrollbar">
          <div className="space-y-2">
            <div className="text-sm text-zinc-400">ชื่อโต๊ะ</div>
            <Input
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="ชื่อโต๊ะ"
              className="bg-zinc-900 border-zinc-700 focus:ring-orange-500"
            />
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-zinc-300">รูปแบบโต๊ะ</div>
            <div className="grid grid-cols-2 gap-3">
              {shapes.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setShape(item.value)}
                    className={`h-14 rounded-2xl border flex items-center justify-center gap-2 transition-all ${
                      shape === item.value
                        ? "border-orange-500 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                        : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-zinc-300">ทิศของโต๊ะ</div>
            <div className="grid grid-cols-4 gap-2">
              {rotations.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRotation(item.value)}
                    className={`h-14 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                      rotation === item.value
                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                        : "border-zinc-700 bg-zinc-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ส่วนจำนวนที่นั่ง - เพิ่มการระบุตัวเลขเอง */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Users className="w-4 h-4" /> จำนวนที่นั่ง
              </div>
              <div className="flex items-center gap-2 bg-zinc-900/50 px-2 py-1 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">ระบุเอง:</span>
                <Input
                  type="number"
                  min="1"
                  value={seatCount || ""}
                  onChange={(e) => handleCustomSeatChange(e.target.value)}
                  className="w-14 h-7 bg-transparent border-none text-right text-orange-400 font-bold p-0 focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {defaultSeats.map((seat) => (
                <button
                  key={seat}
                  type="button"
                  onClick={() => setSeatCount(seat)}
                  className={`h-10 rounded-xl border text-sm font-bold transition-all ${
                    seatCount === seat
                      ? "border-orange-500 bg-orange-500/10 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.1)]"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {seat}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-black p-4 overflow-hidden shadow-2xl">
            <div className="mb-2 text-center text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Preview Layout</div>
            <div className="h-[200px] flex items-center justify-center">
              <div className={`transition-all duration-500 ease-in-out ${isVertical ? "w-[120px] h-[160px]" : "w-[160px] h-[120px]"}`}>
                <Table_card_status
                  table={{ ...table, tableName, shape, rotation, seatCount }}
                  containerWidth={500}
                />
              </div>
            </div>
          </div>
          <div className="h-4" /> 
        </div>

        {/* ส่วนปุ่มกดยึดติดด้านล่าง */}
        <div className="p-6 bg-[#090909] border-t border-zinc-800 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl"
            onClick={onClose}
          >
            ยกเลิก
          </Button>
          <Button
            className="flex-1 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-[0_4px_15px_rgba(249,115,22,0.3)] transition-all active:scale-95"
            onClick={async () => {
              await updateTableDesign(table.id, { tableName, shape, rotation, seatCount });
              onSaved({ ...table, tableName, shape, rotation, seatCount });
              onClose();
            }}
          >
            บันทึกการเปลี่ยนแปลง
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Table_editor_dialog;