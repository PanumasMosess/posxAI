"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Store, Zap, Volume2, VolumeX } from "lucide-react";
import { BackdropItem } from "@/lib/type";
import {
  checkTemporaryShoutout,
  deleteTemporaryShoutout,
} from "@/lib/actions/actionBackdrop";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const DisplayTV = ({
  items,
  organizationId,
}: {
  items: BackdropItem[];
  organizationId: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [priorityItem, setPriorityItem] = useState<any>(null);

  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (priorityItem) return;
      const res = await checkTemporaryShoutout(organizationId);
      if (res.success && res.data) {
        setPriorityItem(res.data);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [priorityItem, organizationId]);

  useEffect(() => {
    if (priorityItem) {
      const duration = (priorityItem.duration || 15) * 1000;
      const timer = setTimeout(async () => {
        await deleteTemporaryShoutout(priorityItem.id);
        const nextRes = await checkTemporaryShoutout(organizationId);
        if (nextRes.success && nextRes.data) {
          setPriorityItem(nextRes.data);
        } else {
          setPriorityItem(null);
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [priorityItem, organizationId]);

  useEffect(() => {
    if (!items || items.length === 0 || priorityItem) return;

    const currentDuration = (items[currentIndex]?.duration || 10) * 1000;

    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [currentIndex, items, priorityItem]);

  if ((!items || items.length === 0) && !priorityItem) {
    return (
      <div className="relative flex flex-col items-center justify-center w-full h-screen bg-black text-white overflow-hidden">
        <Image
          src="/default-bg.jpg"
          alt="Default Technology Background"
          fill
          className="object-cover opacity-50"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-20 flex flex-col items-center justify-center backdrop-blur-md bg-white/5 p-16 rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(99,102,241,0.2)]"
        >
          <div className="relative mb-6">
            <Store className="w-24 h-24 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
            <Zap className="absolute -bottom-2 -right-2 w-10 h-10 text-purple-400 animate-pulse drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]" />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <p className="text-blue-100/80 text-xl font-medium tracking-wide">
              กำลังรอรับข้อมูลโปรโมชั่น...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentItem = priorityItem || items[currentIndex];
  const isVideo = currentItem?.imageUrl?.match(/\.(mp4|webm|mov)$/i);
  const isCustomer = !!priorityItem;

  // 🟢 คำนวณคิวถัดไปเพื่อเอาไฟล์ไป "โหลดรอ (Preload)" ล่วงหน้า
  const nextItem = priorityItem
    ? items[currentIndex]
    : items[(currentIndex + 1) % items.length];
  const isNextVideo = nextItem?.imageUrl?.match(/\.(mp4|webm|mov)$/i);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // 🟢 ลดเวลา Fade เหลือ 0.5 วิ เพื่อให้เปลี่ยนฉากไวขึ้น ไม่หน่วง
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
        >
          {isVideo ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                src={currentItem.imageUrl}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                preload="auto"
                className="object-contain w-full h-full bg-black"
              />

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-8 right-8 z-50 p-4 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 text-white hover:bg-black/70 hover:scale-110 active:scale-95 transition-all shadow-2xl group"
                title={isMuted ? "เปิดเสียง" : "ปิดเสียง"}
              >
                {isMuted ? (
                  <VolumeX className="w-8 h-8 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)] group-hover:animate-pulse" />
                ) : (
                  <Volume2 className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                )}
              </button>
            </div>
          ) : (
            <>
              <Image
                src={currentItem.imageUrl.trim()}
                alt={currentItem.title || "Store Promo"}
                fill
                className="object-contain"
                priority
                unoptimized
              />

              {isCustomer && (currentItem.igName || currentItem.message) && (
                <motion.div
                  initial={{ y: 80, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                    delay: 0.4,
                  }}
                  className="absolute bottom-20 px-12 py-8 md:px-16 md:py-10 bg-black/40 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)] max-w-3xl text-center z-10 flex flex-col items-center"
                >
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-[2rem]"></div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/30 via-pink-500/30 to-purple-500/30 blur-2xl -z-10 rounded-[2.5rem]"></div>
                  {currentItem.igName && (
                    <div className="flex items-center justify-center gap-4 relative z-10">
                      <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-2.5 rounded-xl shadow-lg ring-1 ring-white/30">
                        <InstagramIcon className="w-8 h-8 md:w-9 md:h-9 text-white" />
                      </div>
                      <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 tracking-wider drop-shadow-md">
                        {currentItem.igName}
                      </span>
                    </div>
                  )}
                  {currentItem.message && (
                    <p
                      className={`text-2xl md:text-[1.75rem] font-medium text-white/90 leading-relaxed max-w-2xl relative z-10 drop-shadow-md ${currentItem.igName ? "mt-5" : ""}`}
                    >
                      {currentItem.message}
                    </p>
                  )}
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* แถบ Progress Bar ด้านล่าง */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10 z-50">
        <motion.div
          key={`progress-${currentItem.id}`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: currentItem.duration || (isCustomer ? 15 : 10),
            ease: "linear",
          }}
          className={`h-full shadow-[0_0_10px_rgba(139,92,246,0.8)] ${
            isCustomer
              ? "bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500"
              : "bg-gradient-to-r from-blue-500 to-purple-500"
          }`}
        />
      </div>

      {/* 🟢 หลุมดำ Preloader แอบโหลดคิวถัดไปหลังบ้าน */}
      <div className="hidden" aria-hidden="true">
        {nextItem?.imageUrl &&
          (isNextVideo ? (
            <video src={nextItem.imageUrl} preload="auto" muted playsInline />
          ) : (
            <img src={nextItem.imageUrl.trim()} alt="preload" />
          ))}
      </div>
    </div>
  );
};

export default DisplayTV;
