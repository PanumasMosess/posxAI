"use client";

import { PropsStep4Payment } from "@/lib/type";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { checkPaymentStatusAction } from "@/lib/actions/actionTableBooking";
import { toast } from "react-toastify";

export default function Step4Payment({
  data,
  updateData,
  onPrev, // 💡 ไม่ได้เรียกใช้แล้ว แต่คงไว้ไม่ให้ Type พัง
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

      window.location.href = "/";
    }, 3000);
  };

  useEffect(() => {
    if (!data.bookingId) return;

    const interval = setInterval(async () => {
      try {
        // console.log(
        //   `กำลังเช็คยอดเงิน ${amount} บาท ของบิล ID: ${data.bookingId}...`,
        // );

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
      <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 rounded-full mb-2 border border-amber-500/20">
        <svg
          className="w-8 h-8 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-zinc-100">รอการชำระเงิน</h3>

      {paymentStatus === "WAITING" ? (
        <p className="text-amber-400 text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ระบบกำลังตรวจสอบยอดเงินอัตโนมัติ...
        </p>
      ) : (
        <p className="text-emerald-400 text-sm font-bold flex items-center justify-center gap-2">
          ✅ ชำระเงินเรียบร้อยแล้ว!
        </p>
      )}

      {/* กล่องแสดง QR Code */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6 my-6 inline-block w-full">
        <p className="text-sm text-zinc-400 mb-1">สแกน QR Code (พร้อมเพย์)</p>

        {accountName && (
          <p className="text-base font-semibold text-zinc-100 mb-4 bg-zinc-900/50 py-1.5 px-3 rounded-lg inline-block border border-zinc-700/50">
            {accountName}
          </p>
        )}
        {!accountName && <div className="mb-4"></div>}

        <div className="w-48 h-48 bg-white border-4 border-amber-500 flex items-center justify-center mx-auto mb-4 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeUrl}
            alt="PromptPay QR Code"
            className="w-full h-full object-contain p-2"
          />
        </div>

        <p className="font-bold text-3xl text-amber-400 tracking-wider">
          {amount.toFixed(2)} THB
        </p>
        <p className="text-xs text-zinc-500 mt-2">
          * กรุณาโอนให้ตรงยอดเป๊ะๆ รวมถึงเศษสตางค์ เพื่อให้ระบบยืนยันอัตโนมัติ
        </p>

        {/* 💡 เพิ่มข้อความเตือนให้ลูกค้ารู้ว่าห้ามออกหรือกดย้อนกลับ */}
        <p className="text-xs text-red-400 mt-4 font-medium bg-red-950/30 py-2 rounded-lg border border-red-900/50">
          ⚠️ กรุณาอย่าปิดหน้านี้หรือกดย้อนกลับจนกว่าระบบจะยืนยันสำเร็จ
        </p>
      </div>

      {/* 💡 นำปุ่ม ยืนยันชำระเงิน (Manual) ออกไปแล้ว */}
    </div>
  );
}
