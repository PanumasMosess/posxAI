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
import { Wallet, QrCode, Banknote, Loader2, CreditCard } from "lucide-react";
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
  const [actualQr, setActualQr] = useState<string>("");
  const [actualMember, setActualMember] = useState<string>(""); 
  const [note, setNote] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  const handleCloseShift = async () => {
    if (!shiftId) {
      toast.error("ไม่พบข้อมูลกะที่กำลังเปิดอยู่");
      return;
    }

    const endingCash = actualCash === "" ? 0 : parseFloat(actualCash);
    const endingQr = actualQr === "" ? 0 : parseFloat(actualQr);
    const endingMember = actualMember === "" ? 0 : parseFloat(actualMember); 
    if (
      isNaN(endingCash) ||
      endingCash < 0 ||
      isNaN(endingQr) ||
      endingQr < 0 ||
      isNaN(endingMember) ||
      endingMember < 0
    ) {
      toast.error("กรุณาระบุจำนวนเงินให้ถูกต้อง");
      return;
    }

    setIsPending(true);
    try {
      const result = await closeShift(
        shiftId,
        employeeId,
        endingCash,
        endingQr,
        endingMember,
        note,
      );

      if (result.success) {
        const totalDiff = result.data!.totalDiff;
        if (totalDiff === 0) {
          toast.success("ปิดกะสำเร็จ ยอดเงินตรง 🎉");
        } else if (totalDiff < 0) {
          toast.warning(`ปิดกะสำเร็จ แต่เงินขาดไป ${Math.abs(totalDiff)} บาท`);
        } else {
          toast.info(`ปิดกะสำเร็จ เงินเกินมา ${totalDiff} บาท`);
        }

        setActualCash("");
        setActualQr("");
        setActualMember(""); 
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
            กรุณาระบุยอดที่นับได้จริงทั้งหมด <br />
            (ระบบจะคำนวณกระทบยอดให้โดยอัตโนมัติ)
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label
                htmlFor="actualCash"
                className="text-sm font-semibold flex items-center gap-1"
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                นับเงินสดได้ (บาท) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="actualCash"
                type="number"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                className="text-xl h-12 text-center font-bold border-zinc-300 focus-visible:ring-emerald-500 text-emerald-600"
                placeholder="0.00"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="actualQr"
                className="text-sm font-semibold flex items-center gap-1"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                ยอด QR (บาท)
              </Label>
              <Input
                id="actualQr"
                type="number"
                value={actualQr}
                onChange={(e) => setActualQr(e.target.value)}
                className="text-xl h-12 text-center font-bold border-zinc-300 focus-visible:ring-blue-500 text-blue-600"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="actualMember"
                className="text-sm font-semibold flex items-center gap-1"
              >
                <CreditCard className="w-4 h-4 text-purple-600" />
                ยอด Member (บาท)
              </Label>
              <Input
                id="actualMember"
                type="number"
                value={actualMember}
                onChange={(e) => setActualMember(e.target.value)}
                className="text-xl h-12 text-center font-bold border-zinc-300 focus-visible:ring-purple-500 text-purple-600"
                placeholder="0.00"
              />
            </div>
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
        <DialogFooter className="gap-3 sm:gap-2 mt-4">
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
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
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
