// src/components/payments/PaymentMethodsPanel.tsx
"use client";

import {
  Banknote,
  CreditCard,
  QrCode,
  Users,
  Percent,
  CheckCircle2,
  X,
  Delete,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import PaymentOption from "./PaymentOption";
import { PaymentMethodsPanelProps } from "@/lib/type";

export default function PaymentMethodsPanel({
  paymentMethod,
  setPaymentMethod,
  qrType,
  setQrType,
  finalTotal,
  change,
  cashReceived,
  setCashReceived,
  discount,
  setDiscount,
  memberPhone,
  setMemberPhone,
  currency,
  handleNumpadClick,
  handleExactAmount,
  handleQuickAmount,
  memberData,
  setMemberData,
  isLoadingMember,
  handleCheckMember,
}: PaymentMethodsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Buttons เลือกประเภทการจ่าย */}
      <div className="grid grid-cols-4 gap-2">
        <PaymentOption
          icon={QrCode}
          label="QR"
          active={paymentMethod === "QR"}
          onClick={() => setPaymentMethod("QR")}
        />
        <PaymentOption
          icon={Banknote}
          label="เงินสด"
          active={paymentMethod === "CASH"}
          onClick={() => setPaymentMethod("CASH")}
        />
        <PaymentOption
          icon={CreditCard}
          label="บัตร"
          active={paymentMethod === "CARD"}
          onClick={() => setPaymentMethod("CARD")}
          disabled={true}
        />
        <PaymentOption
          icon={Users}
          label="สมาชิก"
          active={paymentMethod === "MEMBER"}
          onClick={() => setPaymentMethod("MEMBER")}
        />
      </div>

      {/* พื้นที่แสดงรายละเอียดของการจ่ายแต่ละประเภท */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800 transition-all duration-300">
        {/* QR Code */}
        {paymentMethod === "QR" && (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
              <button
                onClick={() => setQrType("THAI")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  qrType === "THAI"
                    ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-600"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                🇹🇭 Thai QR
              </button>
              <button
                onClick={() => setQrType("LAO")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  qrType === "LAO"
                    ? "bg-white dark:bg-zinc-700 shadow-sm text-red-600"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                🇱🇦 Lao QR
              </button>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-sm border border-zinc-200">
              {qrType === "THAI" ? (
                finalTotal > 0 ? (
                  <img
                    src={`https://promptpay.io/0812345678/${finalTotal}.png`} // 🔴 เปลี่ยนเบอร์
                    alt="PromptPay QR"
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 bg-zinc-50 rounded-xl flex flex-col items-center justify-center text-zinc-300">
                    <QrCode className="h-12 w-12 mb-2" />
                    <span className="text-xs">ระบุยอดเงินเพื่อสร้าง QR</span>
                  </div>
                )
              ) : (
                <div className="relative w-48 h-48 flex flex-col items-center justify-center text-center">
                  <img
                    src="/QRLaos.JPG"
                    alt="Lao QR"
                    className="w-48 h-48 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden",
                      );
                    }}
                  />
                  <div className="hidden absolute inset-0 bg-zinc-50 rounded-xl flex flex-col items-center justify-center text-zinc-400 p-4">
                    <QrCode className="h-10 w-10 mb-2 opacity-30" />
                    <span className="text-[10px] leading-tight">
                      กรุณานำรูป LAO QR ของร้าน <br />
                      ไปวางที่ <br />{" "}
                      <strong className="text-red-400">
                        /public/lao-qr-static.jpg
                      </strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                {qrType === "THAI"
                  ? "สแกนชำระเงินผ่านพร้อมเพย์"
                  : "สแกน LAO QR (ลูกค้าพิมพ์ยอดเงินเอง)"}
              </p>
              <p className="text-xs text-zinc-500 font-medium bg-zinc-100 dark:bg-zinc-800 py-1.5 px-3 rounded-full inline-block">
                ยอดสุทธิ:{" "}
                <span className="font-bold text-primary">
                  {finalTotal.toLocaleString()}
                </span>{" "}
              </p>
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">
              * พนักงานกรุณาตรวจสอบสลิปก่อนกดยืนยันการชำระเงิน
            </p>
          </div>
        )}

        {/* เงินสด (CASH) */}
        {paymentMethod === "CASH" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-2 text-zinc-500">
                <Percent className="h-4 w-4" />
                <span className="text-sm font-bold">ส่วนลด</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="0"
                  className="w-32 text-right font-bold text-lg border-none shadow-none focus-visible:ring-0 p-0 h-auto bg-transparent"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  onFocus={(e) => e.target.select()}
                />
                <span className="text-sm font-medium text-zinc-400">
                  {currency}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  รับเงินมา
                </label>
                {change >= 0 && (
                  <span className="text-xs font-bold text-emerald-600">
                    เงินทอน: {change.toLocaleString()}
                  </span>
                )}
                {change < 0 && (
                  <span className="text-xs font-bold text-red-500">
                    ขาดอีก: {Math.abs(change).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="relative group">
                <Input
                  type="text"
                  readOnly
                  className="text-right text-3xl h-16 pr-4 font-black bg-white dark:bg-zinc-950 border-zinc-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm tracking-tight"
                  value={parseFloat(cashReceived || "0").toLocaleString()}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                className="h-10 col-span-2 text-xs font-bold bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 hover:border-primary rounded-xl transition-all"
                onClick={handleExactAmount}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                พอดี ({finalTotal.toLocaleString()})
              </Button>
              <Button
                variant="outline"
                className="h-10 col-span-2 text-xs font-bold text-red-500 bg-red-50 border-red-100 hover:bg-red-100 hover:border-red-200 hover:text-red-600 rounded-xl transition-all"
                onClick={() => setCashReceived("0")}
              >
                <X className="h-3 w-3 mr-1" />
                เคลียร์
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[50000, 100000, 200000, 500000, 1000000].map((amt, i) => (
                <Button
                  key={amt}
                  variant="outline"
                  className="h-10 text-xs font-medium bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-primary/50 hover:bg-primary/5 hover:text-primary rounded-xl transition-all shadow-sm"
                  style={
                    i >= 3 ? { gridColumn: "span 2" } : { gridColumn: "span 2" }
                  }
                  onClick={() => handleQuickAmount(amt)}
                >
                  {amt.toLocaleString()}
                </Button>
              ))}
            </div>

            <Separator className="bg-zinc-200/50 dark:bg-zinc-700/50" />

            <div className="grid grid-cols-4 gap-2">
              {["7", "8", "9"].map((btn) => (
                <Button
                  key={btn}
                  variant="ghost"
                  className="h-14 text-2xl font-medium bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 active:scale-95 transition-all"
                  onClick={() => handleNumpadClick(btn)}
                >
                  {btn}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="h-14 text-xl font-bold bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl active:scale-95 transition-all"
                onClick={() => handleNumpadClick("BACKSPACE")}
              >
                <Delete className="w-6 h-6" />
              </Button>

              {["4", "5", "6"].map((btn) => (
                <Button
                  key={btn}
                  variant="ghost"
                  className="h-14 text-2xl font-medium bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 active:scale-95 transition-all"
                  onClick={() => handleNumpadClick(btn)}
                >
                  {btn}
                </Button>
              ))}
              <div />

              {["1", "2", "3"].map((btn) => (
                <Button
                  key={btn}
                  variant="ghost"
                  className="h-14 text-2xl font-medium bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 active:scale-95 transition-all"
                  onClick={() => handleNumpadClick(btn)}
                >
                  {btn}
                </Button>
              ))}
              <div />

              <Button
                variant="ghost"
                className="h-14 text-2xl font-medium bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 col-span-2 active:scale-95 transition-all"
                onClick={() => handleNumpadClick("0")}
              >
                0
              </Button>
              <Button
                variant="ghost"
                className="h-14 text-2xl font-medium bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 active:scale-95 transition-all"
                onClick={() => handleNumpadClick("00")}
              >
                00
              </Button>
              <Button
                variant="ghost"
                className="h-14 text-2xl font-bold bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 active:scale-95 transition-all"
                onClick={() => handleNumpadClick(".")}
              >
                .
              </Button>
            </div>
          </div>
        )}

        {/* บัตรเครดิต (CARD) */}
        {paymentMethod === "CARD" && (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-400 space-y-3">
            <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <CreditCard className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-sm font-medium">กรุณาเสียบบัตรที่เครื่อง EDC</p>
          </div>
        )}

        {/* สมาชิก (MEMBER) */}
        {paymentMethod === "MEMBER" && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium pl-1 text-zinc-600 dark:text-zinc-400">
                เบอร์โทรศัพท์สมาชิก
              </label>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder="กรอกเบอร์โทรค้นหา..."
                  className="h-12 bg-white dark:bg-zinc-950 font-medium text-lg"
                  value={memberPhone}
                  onChange={(e) =>
                    setMemberPhone(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); 
                      if (!isLoadingMember) {
                        handleCheckMember();
                      }
                    }
                  }}
                />
                <Button
                  className="h-12 px-6"
                  variant="secondary"
                  onClick={handleCheckMember}
                  disabled={isLoadingMember}
                >
                  {isLoadingMember ? "กำลังตรวจ..." : "ตรวจสอบ"}
                </Button>
              </div>
            </div>
            {memberData ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl mt-4 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        {memberData.firstName} {memberData.lastName}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                        {memberData.tier?.name || "Member"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px]"
                    onClick={() => setMemberData(null)}
                  >
                    เปลี่ยน
                  </Button>
                </div>
                <Separator className="my-2 bg-emerald-100/50 dark:bg-emerald-800/50" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      แต้มสะสม
                    </p>
                    <p className="font-bold text-lg text-primary dark:text-emerald-400">
                      {memberData.points.toLocaleString()}{" "}
                      <span className="text-xs font-normal">แต้ม</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      เครดิตคงเหลือ
                    </p>
                    <p
                      className={`font-bold text-lg ${
                        memberData.creditBalance < finalTotal
                          ? "text-red-500 dark:text-red-400" // ✅ ตอนเงินไม่พอ (สว่างขึ้นในโหมดมืด)
                          : "text-zinc-900 dark:text-zinc-100" // ✅ ตอนเงินพอ (สีขาวในโหมดมืด)
                      }`}
                    >
                      {memberData.creditBalance.toLocaleString()}{" "}
                      <span className="text-xs font-normal">{currency}</span>
                    </p>
                  </div>
                </div>
                {memberData.creditBalance < finalTotal && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 mt-2 font-medium">
                    * เครดิตไม่พอจ่าย กรุณาเลือกวิธีอื่นหรือเติมเงิน
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl mt-4 text-center opacity-60">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  กรุณาระบุเบอร์โทรศัพท์เพื่อตรวจสอบสิทธิ์สมาชิก
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
