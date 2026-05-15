"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { CloseShiftModalProps } from "@/lib/type";
import { closeShift } from "@/lib/actions/actionShift";

export function CloseShiftModal({
  isOpen,
  onClose,
  shiftId,
  employeeId,
}: CloseShiftModalProps) {
  const [actualCash, setActualCash] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  const handleCloseShift = async () => {
    if (!shiftId) {
      toast.error("ไม่พบข้อมูลกะที่กำลังเปิดอยู่");
      return;
    }

    const endingCash = actualCash === "" ? 0 : parseFloat(actualCash);

    if (isNaN(endingCash) || endingCash < 0) {
      toast.error("กรุณาระบุจำนวนเงินให้ถูกต้อง");
      return;
    }

    setIsPending(true);
    try {
      const result = await closeShift(shiftId, employeeId, endingCash, note);

      if (result.success) {
        const diff = result.data!.diff;
        if (diff === 0) {
          toast.success("ปิดกะสำเร็จ ยอดเงินตรง 🎉");
        } else if (diff < 0) {
          toast.warning(`ปิดกะสำเร็จ แต่เงินขาดไป ${Math.abs(diff)} บาท`);
        } else {
          toast.info(`ปิดกะสำเร็จ เงินเกินมา ${diff} บาท`);
        }

        setActualCash("");
        setNote("");
        onClose();
        window.dispatchEvent(new Event("manual-lock"));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center justify-center pt-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
            <Wallet className="w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            ปิดกะการทำงาน
          </DialogTitle>
          <DialogDescription className="text-center">
            กรุณานับเงินสดทั้งหมดในลิ้นชักแล้วระบุยอดด้านล่าง <br />
            (ระบบจะคำนวณกระทบยอดให้โดยอัตโนมัติ)
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="actualCash" className="text-sm font-semibold">
              เงินสดที่นับได้จริง (บาท) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="actualCash"
              type="number"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              className="text-2xl h-14 text-center font-bold border-zinc-300 focus-visible:ring-red-500"
              placeholder="0.00"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium text-zinc-500">
              หมายเหตุ (ถ้ามี)
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น มีเงินเกิน 10 บาท, ลูกค้าโอนแต่กดเป็นเงินสด..."
              className="resize-none h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleCloseShift}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={isPending || actualCash === ""}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                กำลังตรวจสอบ...
              </>
            ) : (
              "ยืนยันการปิดกะ"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
