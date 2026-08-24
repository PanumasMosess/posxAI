"use client";

import { PropsStep4Payment } from "@/lib/type";
import React, { useState, useEffect } from "react";
import { Loader2, ScanLine, CheckCircle } from "lucide-react";
import { checkPaymentStatusAction } from "@/lib/actions/actionTableBooking";
import { toast } from "react-toastify";

export default function Step4Payment({
  data,
  updateData,
  onPrev,
  onSubmit,
}: PropsStep4Payment) {
  const promptpayId = data.promptpayNumber || "0899999999";
  const accountName = data.promptpayName || "";
  const amount = data.depositAmount || 20.0;

  const qrCodeUrl = `https://promptpay.io/${promptpayId}/${amount.toFixed(2)}.png`;

  const [paymentStatus, setPaymentStatus] = useState<"WAITING" | "PAID">(
    "WAITING",
  );

  const handlePaymentSuccess = () => {
    toast.success("ชำระเงินสำเร็จ! 🎉 ระบบได้ยืนยันการจองของคุณเรียบร้อยแล้ว", {
      position: "top-center",
      autoClose: 3000,
      theme: "dark",
    });
    setTimeout(() => {
      onSubmit();
      window.close();
    }, 3000);
  };

  useEffect(() => {
    if (!data.bookingId) return;

    const interval = setInterval(async () => {
      try {
        const result = await checkPaymentStatusAction(data.bookingId as number);
        if (result.success && result.status === "PAID") {
          setPaymentStatus("PAID");
          clearInterval(interval);
          handlePaymentSuccess();
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการตรวจสอบยอดเงิน:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, data.bookingId]);

  return (
    <div className="space-y-6 animate-fade-in text-center max-w-md mx-auto">
      {/* Header Icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/10 rounded-full mb-2 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
        {paymentStatus === "WAITING" ? (
          <ScanLine className="w-10 h-10 text-amber-500 animate-pulse" />
        ) : (
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        )}
      </div>

      <h3 className="text-3xl font-black text-zinc-100 tracking-tight">
        {paymentStatus === "WAITING" ? "รอการชำระเงิน" : "ชำระเงินสำเร็จ"}
      </h3>

      {/* Status Text */}
      <div className="h-6">
        {paymentStatus === "WAITING" ? (
          <p className="text-amber-400 text-sm font-medium flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ระบบกำลังตรวจสอบยอดเงินอัตโนมัติ...
          </p>
        ) : (
          <p className="text-emerald-400 text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
            ✅ ยืนยันการจองเรียบร้อยแล้ว!
          </p>
        )}
      </div>

      {/* QR Code Card */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-8 mt-4 mb-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Glow effect in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-[50px] pointer-events-none" />

        <div className="relative z-10">
          <p className="text-sm font-medium text-zinc-400 mb-4 tracking-wide uppercase">
            สแกนเพื่อชำระเงิน (พร้อมเพย์)
          </p>

          {accountName && (
            <p className="text-sm font-bold text-zinc-200 mb-5 bg-zinc-800/80 py-2 px-4 rounded-xl inline-block border border-white/5 shadow-sm">
              {accountName}
            </p>
          )}

          <div className="w-56 h-56 bg-white flex items-center justify-center mx-auto mb-6 rounded-2xl shadow-[0_10px_40px_rgba(245,158,11,0.2)] p-3 relative group">
            {/* Scanner corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-xl pointer-events-none" />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="PromptPay QR Code"
              className={`w-full h-full object-contain transition-all duration-500 ${paymentStatus === "PAID" ? "opacity-30 blur-sm" : ""}`}
            />

            {paymentStatus === "PAID" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle className="w-20 h-20 text-emerald-500 drop-shadow-lg" />
              </div>
            )}
          </div>

          <div className="bg-amber-500/10 py-3 rounded-2xl border border-amber-500/20 inline-block px-8">
            <p className="font-black text-4xl text-amber-500 tracking-tight">
              {amount.toFixed(2)} <span className="text-xl font-bold">THB</span>
            </p>
          </div>

          <p className="text-xs font-medium text-zinc-500 mt-4 leading-relaxed">
            * กรุณาโอนให้ตรงยอดเป๊ะๆ รวมถึงเศษสตางค์ <br />{" "}
            เพื่อให้ระบบยืนยันอัตโนมัติ
          </p>
        </div>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 py-3 px-4 rounded-xl inline-block max-w-sm">
        <p className="text-xs text-red-400 font-medium">
          ⚠️ กรุณาอย่าปิดหน้านี้หรือกดย้อนกลับจนกว่าระบบจะยืนยันสำเร็จ
        </p>
      </div>
    </div>
  );
}
