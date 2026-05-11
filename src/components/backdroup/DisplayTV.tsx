"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Store, Zap } from "lucide-react";
import { BackdropItem } from "@/lib/type";

const DisplayTV = ({ items }: { items: BackdropItem[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) return;

    const currentDuration = (items[currentIndex]?.duration || 10) * 1000;

    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [currentIndex, items]);

  // 🌟 หน้าจอตอนยังไม่มีข้อมูล (คงเดิมไว้)
  if (!items || items.length === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center w-full h-screen bg-black text-white overflow-hidden">
        <Image
          src="/default-bg.jpg" // ⚠️ อย่าลืมเอารูปไปใส่ในโฟลเดอร์ public นะครับ
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

          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 tracking-[0.2em] drop-shadow-lg mb-2">
            POSX SYSTEM
          </h1>

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

  const currentItem = items[currentIndex];
  const isVideo = currentItem?.imageUrl?.match(/\.(mp4|webm|mov)$/i);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }} 
          className="absolute inset-0 w-full h-full flex items-center justify-center" 
        >
          {isVideo ? (
            <video
              src={currentItem.imageUrl}
              autoPlay
              muted
              loop
              playsInline
              className="object-contain w-full h-full"
            />
          ) : (
            <Image
              src={currentItem.imageUrl}
              alt={currentItem.title || "Store Promo"}
              fill 
              className="object-contain"
              priority
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* โลโก้มุมขวาบน (คงเดิม แต่อยู่บนพื้นหลังสีดำ mix-blend ช่วยให้เด่น) */}
      <div className="absolute top-8 right-8 z-50 mix-blend-difference">
        <h2 className="text-white/80 font-bold text-2xl tracking-[0.2em] uppercase">
          POSX<span className="text-primary">AI</span>
        </h2>
      </div>

      {/* แถบ Progress Bar ด้านล่าง (คงเดิม) */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10 z-50">
        <motion.div
          key={`progress-${currentItem.id}`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: currentItem.duration || 10,
            ease: "linear",
          }}
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]"
        />
      </div>
    </div>
  );
};

export default DisplayTV;