"use client";

import { BookingData, PropsDataTableBooking } from "@/lib/type";
import { useState, useMemo } from "react";
import WizardHeader from "./WizardHeader";
import Step1GuestDate from "./Step1GuestDate";
import Step2TableLayout from "./Step2TableLayout";
import Step3Contact from "./Step3Contact";
import Step4Payment from "./Step4Payment";

export default function TableBookingWizard({
  initialTables,
  initialBookings,
  organizationId,
}: PropsDataTableBooking) {
  const [step, setStep] = useState(1);

  const [bookingData, setBookingData] = useState<BookingData>({
    guestCount: 2,
    bookingDate: null,
    selectedTableId: null,
    customerName: "",
    customerPhone: "",
    slipPreview: null,
  });

  const updateData = (newData: Partial<BookingData>) => {
    if (
      newData.bookingDate &&
      newData.bookingDate !== bookingData.bookingDate
    ) {
      newData.selectedTableId = null;
    }
    setBookingData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = () => {
    // console.log("ข้อมูลการจองทั้งหมด:", bookingData);
  };

  const computedTables = useMemo(() => {
    if (!bookingData.bookingDate) {
      return initialTables.map((table) => ({
        ...table,
        isBookedForDate: false,
      }));
    }
    const selectedDateStr = new Date(bookingData.bookingDate).toDateString();

    // 💡 ดึงเวลาที่ลูกค้าเลือกมาเพื่อเช็คว่าทับซ้อนกันไหม
    const selectedDateTime = bookingData.bookingDate.getTime();

    const bookedTableIds = initialBookings
      .filter((booking) => {
        const isSameDate =
          new Date(booking.bookingDate).toDateString() === selectedDateStr;

        const isActiveBooking = ["PENDING", "CONFIRMED"].includes(
          booking.status,
        );

        const bookedDateTime = new Date(booking.bookingDate).getTime();
        const hoursDifference =
          Math.abs(selectedDateTime - bookedDateTime) / (1000 * 60 * 60);
        const isTimeOverlap = hoursDifference < 2.5;

        return isSameDate && isActiveBooking && isTimeOverlap;
      })
      .map((booking) => booking.tableId);

    return initialTables.map((table) => ({
      ...table,
      isBookedForDate: bookedTableIds.includes(table.id),
    }));
  }, [bookingData.bookingDate, initialTables, initialBookings]);

  return (
    <div className="relative min-h-screen flex justify-center items-center p-4 md:p-8 font-sans text-zinc-100">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2000&auto=format&fit=crop')`,
        }}
      />
      <div className="absolute inset-0 z-0 bg-zinc-950/65 backdrop-blur-[3px]" />

      <div className="relative z-10 max-w-3xl w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto backdrop-blur-md">
        <WizardHeader currentStep={step} />

        <div className="p-6 md:p-8">
          {step === 1 && (
            <Step1GuestDate
              data={bookingData}
              updateData={updateData}
              onNext={nextStep}
              tables={initialTables}
              initialBookings={initialBookings}
              organizationId={organizationId}
            />
          )}
          {step === 2 && (
            <Step2TableLayout
              data={bookingData}
              tables={computedTables}
              updateData={updateData}
              onNext={nextStep}
              onPrev={prevStep}
              organizationId={organizationId}
            />
          )}
          {step === 3 && (
            <Step3Contact
              data={bookingData}
              tables={initialTables}
              updateData={updateData}
              onNext={nextStep}
              onPrev={prevStep}
              organizationId={organizationId}
            />
          )}
          {step === 4 && (
            <Step4Payment
              data={bookingData}
              updateData={updateData}
              onPrev={prevStep}
              onSubmit={handleSubmit}
              organizationId={organizationId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
