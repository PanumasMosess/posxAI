"use client";

import { PropsStep3Contact } from "@/lib/type";
import React, { useState, useEffect } from "react";
import dateList from "@/lib/data_temp";
import { Loader2 } from "lucide-react";
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

  // ดึงค่าตั้งค่าจาก DB เมื่อเปิดหน้านี้
  useEffect(() => {
    const fetchSettings = async () => {
      const res = await getBookingSettingsAction(organizationId);
      if (res.success && res.data) {
        setBaseDeposit(res.data.baseDepositAmount);
        if (res.data.promptpayNumber) {
          setPromptpayNum(res.data.promptpayNumber);
        }
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

  // ==========================================
  // 💡 ปรับลอจิกการหา Label ช่วงจำนวนคน ให้แม่นยำขึ้น
  // ==========================================
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
  // ==========================================

  const isFormValid =
    data.customerName.trim() !== "" && data.customerPhone.trim().length >= 9;

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    try {
      // 1. สุ่มเศษสตางค์ โดยใช้ baseDeposit ที่ดึงมาจาก DB
      const randomSatang = Math.floor(Math.random() * 29) + 1;
      const depositAmount = baseDeposit + randomSatang / 100;

      if (!data.selectedTableId || !data.bookingDate) {
        throw new Error("ข้อมูลการจองไม่ครบถ้วน");
      }

      // 2. คำนวณหาค่า "คนที่มากที่สุด" ใน Range ที่เลือก
      let maxGuestInRange = data.guestCount; // ค่าเริ่มต้นเผื่อหาไม่เจอ
      if (dateList.GUEST_RANGES) {
        if (activeIndex !== -1) {
          // ถ้ามีช่วงถัดไป ให้เอาค่า min ของช่วงถัดไปลบ 1
          // ถ้าเป็นช่วงสุดท้าย (เช่น 13-16) ให้ใช้ 16 เป็นค่าสูงสุด
          maxGuestInRange = dateList.GUEST_RANGES[activeIndex + 1]
            ? dateList.GUEST_RANGES[activeIndex + 1].min - 1
            : 16;
        }
      }

      // 3. บันทึกลง Database (ใช้ maxGuestInRange แทน)
      const response = await createBookingAction({
        organizationId: organizationId,
        tableId: data.selectedTableId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        guestCount: maxGuestInRange, // 👈 ส่งคนจำนวนมากที่สุดไปเก็บใน DB
        bookingDate: data.bookingDate,
        depositAmount: depositAmount,
      });

      if (!response.success || !response.bookingId) {
        throw new Error(response.message || "บันทึกไม่สำเร็จ");
      }

      updateData({
        depositAmount: depositAmount,
        bookingId: response.bookingId,
        promptpayNumber: promptpayNum,
        promptpayName: promptpayName,
      });

      // 4. ไปหน้าชำระเงิน
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
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
      <h3 className="text-xl font-semibold text-zinc-100 text-center">
        ข้อมูลผู้จอง VIP
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            ชื่อ-นามสกุล
          </label>
          <input
            type="text"
            value={data.customerName}
            onChange={(e) => updateData({ customerName: e.target.value })}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition disabled:opacity-50"
            placeholder="ระบุชื่อผู้จอง"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            เบอร์โทรศัพท์
          </label>
          <input
            type="tel"
            value={data.customerPhone}
            maxLength={10}
            disabled={isLoading}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, "");
              updateData({ customerPhone: onlyNums });
            }}
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition disabled:opacity-50"
            placeholder="08XXXXXXXX"
          />
        </div>
      </div>

      <div className="bg-zinc-800/50 p-5 rounded-xl border border-zinc-700 mt-4">
        <h4 className="font-semibold text-amber-400 mb-3 border-b border-zinc-700 pb-2">
          สรุปรายการจอง
        </h4>
        <ul className="text-sm text-zinc-300 space-y-3">
          <li className="flex justify-between items-center">
            <span>โต๊ะที่เลือก:</span>
            <span className="font-bold text-lg text-amber-500 bg-amber-500/10 px-3 py-0.5 rounded-md border border-amber-500/20">
              {displayTableName}
            </span>
          </li>
          <li className="flex justify-between">
            <span>จำนวนลูกค้า:</span>
            <span className="font-bold text-zinc-100">
              {displayGuestCount} ท่าน
            </span>
          </li>
          <li className="flex justify-between">
            <span>วันที่:</span>
            <span className="font-bold text-zinc-100">
              {formatDate(data.bookingDate)}
            </span>
          </li>
          <li className="flex justify-between pt-3 border-t border-zinc-700 mt-2">
            <span>ยอดมัดจำเริ่มต้น:</span>
            <span className="font-bold text-red-400 text-lg tracking-wide">
              {baseDeposit.toFixed(2)} THB
            </span>
          </li>
        </ul>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          disabled={isLoading}
          className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl transition border border-zinc-700 disabled:opacity-50"
        >
          กลับ
        </button>
        <button
          onClick={handleProceedToPayment}
          disabled={!isFormValid || isLoading}
          className={`w-2/3 font-bold py-3 flex items-center justify-center gap-2 rounded-xl transition ${
            isFormValid
              ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800"
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
