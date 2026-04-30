"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface MemberInfo {
  id: number;
  firstName: string;
  lastName: string | null;
  creditBalance: number;
}

interface FormPayCreditProps {
  member: MemberInfo;
  onPay: (memberId: number, amount: number) => Promise<void>;
}

export default function FormPayCredit({ member, onPay }: FormPayCreditProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payAmount = Number(amount);

    if (payAmount <= 0 || isNaN(payAmount)) {
      toast.error("กรุณาระบุจำนวนเงินให้ถูกต้อง (มากกว่า 0)");
      return;
    }

    setIsSubmitting(true);
    try {
      await onPay(member.id, payAmount);
      setOpen(false); // ปิดหน้าต่างเมื่อสำเร็จ
      setAmount(""); // ล้างค่าในช่องกรอก
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          ชำระเครดิต
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>เติมเครดิตลูกค้า</DialogTitle>
            <DialogDescription>
              ทำรายการให้คุณ{" "}
              <strong>
                {member.firstName} {member.lastName || ""}
              </strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                เครดิตปัจจุบัน
              </label>
              <div className="col-span-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {member.creditBalance.toLocaleString("th-TH", {
                  style: "currency",
                  currency: "THB",
                })}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="amount"
                className="text-right text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                ยอดที่ต้องการ
              </label>
              <div className="col-span-3 relative">
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-4 pr-10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <span className="absolute right-3 top-2.5 text-sm text-zinc-500">
                  ฿
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting || !amount}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "ยืนยันการทำรายการ"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
