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
import { Banknote, QrCode, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { openShift } from "@/lib/actions/actionShift";
import { OpenShiftModalProps } from "@/lib/type";

export function OpenShiftModal({
  isOpen,
  onClose,
  organizationId,
  employeeId,
  employeeName,
  onSuccess,
}: OpenShiftModalProps) {
  const [startingCash, setStartingCash] = useState<string>("");
  const [amountQr, setAmountQr] = useState<string>(""); // 🟢 เปลี่ยนชื่อ State ให้ตรงกับ Schema
  const [note, setNote] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  const handleOpenShift = async () => {
    const parsedCash = startingCash === "" ? 0 : parseFloat(startingCash);
    const parsedQr = amountQr === "" ? 0 : parseFloat(amountQr);

    if (
      isNaN(parsedCash) ||
      parsedCash < 0 ||
      isNaN(parsedQr) ||
      parsedQr < 0
    ) {
      toast.error("กรุณาระบุจำนวนเงินเริ่มต้นให้ถูกต้อง");
      return;
    }

    setIsPending(true);
    try {
      const result = await openShift(
        organizationId,
        employeeId,
        parsedCash,
        parsedQr,
        note,
      );

      if (result.success) {
        toast.success("เปิดกะสำเร็จ!");
        setStartingCash("");
        setAmountQr("");
        setNote("");

        window.dispatchEvent(new Event("shift-updated"));

        onSuccess();
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
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl">
        <DialogHeader className="flex flex-col items-center justify-center pt-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Banknote className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            เปิดกะการทำงาน
          </DialogTitle>
          <DialogDescription>
            กรุณาระบุจำนวนเงินทอนเริ่มต้นที่มีอยู่ในระบบ
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label className="text-zinc-500">พนักงานผู้เปิดกะ</Label>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border font-medium text-zinc-700 dark:text-zinc-200">
              {employeeName}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="startingCash"
                className="text-sm font-semibold flex items-center gap-1"
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                เงินสด (บาท) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startingCash"
                type="number"
                value={startingCash}
                onChange={(e) => setStartingCash(e.target.value)}
                className="text-xl h-12 text-center font-bold text-emerald-600 focus-visible:ring-emerald-500"
                placeholder="0.00"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="amountQr"
                className="text-sm font-semibold flex items-center gap-1"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                เงินโอน/QR (บาท)
              </Label>
              <Input
                id="amountQr"
                type="number"
                value={amountQr}
                onChange={(e) => setAmountQr(e.target.value)}
                className="text-xl h-12 text-center font-bold text-blue-600 focus-visible:ring-blue-500"
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
              placeholder="เช่น มีแบงก์ร้อย 5 ใบ, แบงก์ยี่สิบ 10 ใบ..."
              className="resize-none h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleOpenShift}
            className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20"
            disabled={isPending || startingCash === ""}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                กำลังเปิดกะ...
              </>
            ) : (
              "ยืนยันเปิดกะ"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
