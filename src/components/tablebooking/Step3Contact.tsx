"use client";

import { PropsStep3Contact } from "@/lib/type";
import React, { useState, useEffect } from "react";
import dateList from "@/lib/data_temp";
import { Loader2, User, Phone, CheckCircle2 } from "lucide-react";
import {
  createBookingAction,
  getBookingSettingsAction,
} from "@/lib/actions/actionTableBooking";

export default function Step3Contact({
  data,
  tables,
  updateData,
  onNext,
  onPrev,
  organizationId,
}: PropsStep3Contact) {
  const [isLoading, setIsLoading] = useState(false);
  const [baseDeposit, setBaseDeposit] = useState(20.0);
  const [promptpayNum, setPromptpayNum] = useState("0899999999");
  const [promptpayName, setPromptpayName] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await getBookingSettingsAction(organizationId);
      if (res.success && res.data) {
        setBaseDeposit(res.data.baseDepositAmount);
        if (res.data.promptpayNumber) setPromptpayNum(res.data.promptpayNumber);
        if (res.data.promptpayName) setPromptpayName(res.data.promptpayName);
      }
    };
    fetchSettings();
  }, [organizationId]);

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return `${date.getDate()} ${dateList.MONTHS_SHOT[date.getMonth()]} ${date.getFullYear() + 543}`;
  };

  const selectedTable = tables.find((t) => t.id === data.selectedTableId);
  const displayTableName = selectedTable ? selectedTable.tableName : "-";

  let activeIndex = dateList.GUEST_RANGES?.findIndex(
    (r) => r.min === data.guestCount,
  );
  if (activeIndex === -1 && dateList.GUEST_RANGES) {
    if (data.guestCount >= 13) activeIndex = 3;
    else if (data.guestCount >= 9) activeIndex = 2;
    else if (data.guestCount >= 5) activeIndex = 1;
    else activeIndex = 0;
  }
  const displayGuestCount =
    activeIndex !== -1 && dateList.GUEST_RANGES
      ? dateList.GUEST_RANGES[activeIndex].label
      : data.guestCount;

  const isFormValid =
    data.customerName.trim() !== "" && data.customerPhone.trim().length >= 9;

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    try {
      const randomSatang = Math.floor(Math.random() * 29) + 1;
      const depositAmount = baseDeposit + randomSatang / 100;

      if (!data.selectedTableId || !data.bookingDate)
        throw new Error("ข้อมูลการจองไม่ครบถ้วน");

      let maxGuestInRange = data.guestCount;
      if (dateList.GUEST_RANGES && activeIndex !== -1) {
        maxGuestInRange = dateList.GUEST_RANGES[activeIndex + 1]
          ? dateList.GUEST_RANGES[activeIndex + 1].min - 1
          : 16;
      }

      const response = await createBookingAction({
        organizationId,
        tableId: data.selectedTableId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        guestCount: maxGuestInRange,
        bookingDate: data.bookingDate,
        depositAmount,
      });

      if (!response.success || !response.bookingId)
        throw new Error(response.message || "บันทึกไม่สำเร็จ");

      updateData({
        depositAmount,
        bookingId: response.bookingId,
        promptpayNumber: promptpayNum,
        promptpayName: promptpayName,
      });

      onNext();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-zinc-100">ข้อมูลการติดต่อ</h3>
        <p className="text-sm text-zinc-400">
          กรุณาระบุข้อมูลเพื่อให้เจ้าหน้าที่ติดต่อกลับ
        </p>
      </div>

      <div className="space-y-5">
        <div className="relative">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            ชื่อ-นามสกุล
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              value={data.customerName}
              onChange={(e) => updateData({ customerName: e.target.value })}
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-4 bg-zinc-900/50 border border-white/10 text-zinc-100 rounded-2xl outline-none focus:bg-zinc-900 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50"
              placeholder="ระบุชื่อผู้จอง"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            เบอร์โทรศัพท์
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="tel"
              value={data.customerPhone}
              maxLength={10}
              disabled={isLoading}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                updateData({ customerPhone: onlyNums });
              }}
              className="w-full pl-11 pr-4 py-4 bg-zinc-900/50 border border-white/10 text-zinc-100 rounded-2xl outline-none focus:bg-zinc-900 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50"
              placeholder="08X-XXX-XXXX"
            />
            {isFormValid && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Box สรุป (Receipt Style) */}
      <div className="relative bg-zinc-900/60 p-6 rounded-3xl border border-white/5 mt-6 shadow-xl backdrop-blur-md">
        <h4 className="font-bold text-zinc-200 mb-4 flex items-center gap-2">
          สรุปรายการจอง
        </h4>
        <ul className="text-sm text-zinc-400 space-y-4">
          <li className="flex justify-between items-center">
            <span>โต๊ะที่เลือก</span>
            <span className="font-bold text-base text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
              {displayTableName}
            </span>
          </li>
          <li className="flex justify-between items-center">
            <span>จำนวนลูกค้า</span>
            <span className="font-semibold text-zinc-200">
              {displayGuestCount} ท่าน
            </span>
          </li>
          <li className="flex justify-between items-center">
            <span>วันที่จอง</span>
            <span className="font-semibold text-zinc-200">
              {formatDate(data.bookingDate)}
            </span>
          </li>
          <li className="flex justify-between items-center pt-4 border-t border-dashed border-zinc-700/50">
            <span className="font-medium text-zinc-300">ยอดมัดจำเริ่มต้น</span>
            <span className="font-black text-xl text-amber-500 tracking-wide">
              {baseDeposit.toFixed(2)} THB
            </span>
          </li>
        </ul>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={onPrev}
          disabled={isLoading}
          className="w-1/3 py-4 rounded-2xl border border-white/10 bg-zinc-900/50 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          กลับ
        </button>
        <button
          onClick={handleProceedToPayment}
          disabled={!isFormValid || isLoading}
          className={`w-2/3 font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2
            ${
              isFormValid
                ? "bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 shadow-[0_8px_16px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.3)] hover:scale-[1.01] active:scale-[0.99]"
                : "bg-zinc-800/50 text-zinc-600 border border-white/5 cursor-not-allowed"
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> กำลังสร้างรายการ...
            </>
          ) : (
            "ดำเนินการชำระมัดจำ"
          )}
        </button>
      </div>
    </div>
  );
}
