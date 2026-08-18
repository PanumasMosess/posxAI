"use client";

import React, { useState } from "react";
import {
  Loader2,
  Search,
  CheckCircle2,
  User,
  Clock,
  Users,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  clearTableAction,
  getBookingByPhoneAction,
  staffCheckInCustomerAction,
} from "@/lib/actions/actionTableBooking";
import { PropsStaffCheckIn } from "@/lib/type";
import dateList from "@/lib/data_temp"; 

export default function StaffCheckInPage({
  organizationId,
  initialOccupiedTables,
}: PropsStaffCheckIn) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"CHECKIN" | "CLEAR">("CHECKIN");

  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return toast.warning("กรุณากรอกเบอร์โทรศัพท์");

    setIsLoading(true);
    setBookingData(null);

    const res = await getBookingByPhoneAction(phone, organizationId);

    if (res.success) {
      setBookingData(res.data);
      toast.success("พบข้อมูลการจอง!");
    } else {
      toast.error(res.message);
    }
    setIsLoading(false);
  };

  const handleConfirmCheckIn = async () => {
    if (!bookingData) return;

    setIsLoading(true);
    const res = await staffCheckInCustomerAction(
      bookingData.id,
      bookingData.tableId,
    );

    if (res.success) {
      toast.success(res.message);
      setBookingData(null);
      setPhone("");
      router.refresh();
    } else {
      toast.error(res.message);
    }
    setIsLoading(false);
  };


  const handleClearTable = async (tableId: number, tableName: string) => {
    if (!confirm(`คุณต้องการเคลียร์ ${tableName} ให้เป็นโต๊ะว่างใช่หรือไม่?`))
      return;

    setIsLoading(true);
    const res = await clearTableAction(tableId);

    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
    setIsLoading(false);
  };

  let displayGuestCount = bookingData?.guestCount || "-";
  if (bookingData?.guestCount && dateList.GUEST_RANGES) {
    const count = bookingData.guestCount;
    let activeIndex = 0;
    if (count >= 13) activeIndex = 3;
    else if (count >= 9) activeIndex = 2;
    else if (count >= 5) activeIndex = 1;
    else activeIndex = 0;

    displayGuestCount = dateList.GUEST_RANGES[activeIndex]?.label || count;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-zinc-100 font-sans">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* เมนูแท็บ */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("CHECKIN")}
            className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === "CHECKIN"
                ? "bg-amber-500/10 text-amber-500 border-b-2 border-amber-500"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            รับลูกค้า (Check-in)
          </button>
          <button
            onClick={() => setActiveTab("CLEAR")}
            className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === "CLEAR"
                ? "bg-amber-500/10 text-amber-500 border-b-2 border-amber-500"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            เคลียร์โต๊ะ (Clear)
          </button>
        </div>

        <div className="p-6 md:p-8">

          {activeTab === "CHECKIN" && (
            <div className="animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-zinc-100">ค้นหาคิวจอง</h2>
                <p className="text-zinc-400 mt-1 text-sm">
                  พิมพ์เบอร์โทรลูกค้าเพื่อรับเข้าโต๊ะ
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    maxLength={10} 
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                      setPhone(onlyNums);
                    }}
                    placeholder="กรอกเบอร์โทรศัพท์..."
                    className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 px-4 py-3 pl-11 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || phone.length < 9}
                  className="w-full bg-zinc-800 text-amber-400 hover:bg-zinc-700 border border-zinc-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading && !bookingData ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  ค้นหาข้อมูล
                </button>
              </form>

              {bookingData && (
                <div className="mt-8 animate-fade-in space-y-6">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-inner">
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-800/50 mb-4">
                      <span className="text-zinc-400 text-sm">โต๊ะที่จอง</span>
                      <span className="text-2xl font-black text-amber-400">
                        {bookingData.table?.tableName || "ไม่ระบุ"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-zinc-900 p-2 rounded-lg text-zinc-400">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">ชื่อลูกค้า</p>
                          <p className="text-sm font-semibold text-zinc-200">
                            {bookingData.customerName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-zinc-900 p-2 rounded-lg text-zinc-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">จำนวน</p>
                          <p className="text-sm font-semibold text-zinc-200">
                            {displayGuestCount} ท่าน
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmCheckIn}
                    disabled={isLoading}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UtensilsCrossed className="w-5 h-5" />
                    )}
                    ลูกค้านั่งที่โต๊ะเรียบร้อย
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "CLEAR" && (
            <div className="animate-fade-in">
              <div className="text-center mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100 text-left">
                    โต๊ะที่ไม่ว่างขณะนี้
                  </h2>
                  <p className="text-zinc-400 mt-1 text-sm text-left">
                    กดเพื่อเคลียร์โต๊ะเมื่อลูกค้ากลับ
                  </p>
                </div>
                <button
                  onClick={() => router.refresh()}
                  className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition"
                >
                  <Sparkles
                    className={`w-4 h-4 text-amber-400 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              {initialOccupiedTables.length === 0 ? (
                <div className="text-center py-10 bg-zinc-950 rounded-xl border border-zinc-800">
                  <p className="text-zinc-500 font-medium">
                    ✨ ตอนนี้ไม่มีโต๊ะที่กำลังใช้งานครับ (โต๊ะว่างทั้งหมด)
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 pb-2">
                  {initialOccupiedTables.map((table) => (
                    <div
                      key={table.id}
                      className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800"
                    >
                      <div>
                        <h3 className="font-bold text-lg text-zinc-100">
                          {table.tableName}
                        </h3>
                        <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 rounded-full border border-red-900/50 mt-1 inline-block">
                          ใช้งานอยู่
                        </span>
                      </div>
                      <button
                        disabled={isLoading}
                        onClick={() =>
                          handleClearTable(table.id, table.tableName)
                        }
                        className="bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 font-bold py-2 px-4 rounded-lg transition-colors border border-zinc-700 hover:border-amber-500 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "เคลียร์โต๊ะ"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
