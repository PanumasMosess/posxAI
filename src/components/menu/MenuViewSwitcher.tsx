"use client";

import { useState, useEffect, useRef } from "react";
import { LayoutGrid, BookOpen, Layers } from "lucide-react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import MenuOrderPage from "./MenuOrderPage";
import MenuBookPage from "./MenuBookPage";
import { MenuPOSPageClientProps } from "@/lib/type";

const VIEWS = [
  { id: "grid", label: "List", icon: LayoutGrid, color: "text-white" },
  { id: "book", label: "Book", icon: BookOpen, color: "text-[#D4AF37]" },
] as const;

type ViewMode = typeof VIEWS[number]["id"];

export default function MenuViewSwitcher(props: MenuPOSPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const [isRightSide, setIsRightSide] = useState(true); 
  const [isTopHalf, setIsTopHalf] = useState(false); 
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // สร้าง Ref ไว้เก็บค่าขอบเขตหน้าจอ
  const constraintsRef = useRef<HTMLDivElement>(null); 
  
  const isDragging = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchView = (mode: ViewMode) => {
    setViewMode(mode);
    setIsOpen(false);
  };

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    setIsRightSide(info.point.x > screenWidth / 2);
    setIsTopHalf(info.point.y < screenHeight / 2);
    
    setTimeout(() => {
      isDragging.current = false;
    }, 150);
  };

  const handleToggleMenu = (e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      return;
    }
    setIsOpen(!isOpen);
  };

  if (!isMounted) return null;

  const activeView = VIEWS.find((v) => v.id === viewMode) || VIEWS[0];

  return (
    <div className="relative w-full h-full overflow-hidden">
      
      {/* ✅ ปรับระยะ inset-1 ให้กล่องล่องหนชิดขอบจอสุดๆ (เหลือแค่ 4px กันเงาแหว่ง) */}
      <div ref={constraintsRef} className="fixed inset-1 pointer-events-none" />

      <div className="w-full h-full pointer-events-auto">
        {viewMode === "grid" && <MenuOrderPage {...props} />}
        {viewMode === "book" && <MenuBookPage {...props} />}
      </div>

      <motion.div 
        ref={dropdownRef}
        drag
        dragConstraints={constraintsRef} 
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        // เริ่มต้นที่ขวาล่าง 
        className="fixed bottom-28 right-4 sm:right-6 z-[100] flex flex-col items-center gap-2 pointer-events-none"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: isTopHalf ? -10 : 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: isTopHalf ? -10 : 10, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              style={{ originY: isTopHalf ? 0 : 1, originX: isRightSide ? 1 : 0 }}
              className={`absolute flex flex-col gap-2 w-max pointer-events-auto ${
                isTopHalf ? "top-full mt-3" : "bottom-full mb-3"
              } ${
                isRightSide ? "items-end right-0" : "items-start left-0"
              }`}
            >
              {VIEWS.map((view) => {
                const Icon = view.icon;
                const isActive = view.id === viewMode;
                return (
                  <button
                    key={view.id}
                    onClick={() => handleSwitchView(view.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl shadow-xl border border-white/10 transition-all active:scale-95 ${
                      isActive 
                        ? "bg-orange-600 text-white" 
                        : "bg-black/90 backdrop-blur-md text-white/70 hover:bg-white/10 hover:text-white"
                    } ${isRightSide ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`p-1.5 rounded-full ${isActive ? "bg-black/20" : "bg-white/5"}`}>
                      <Icon size={14} strokeWidth={2.5} className={isActive ? "text-white" : view.color} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase notranslate px-1">
                      {view.label}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleToggleMenu}
          className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-white/10 transition-all pointer-events-auto active:scale-95 cursor-grab active:cursor-grabbing ${
            isOpen ? "bg-black" : "bg-black/80 backdrop-blur-md hover:bg-black"
          }`}
        >
          <Layers 
            size={20} 
            strokeWidth={2} 
            className={isOpen ? "text-orange-500" : activeView.color} 
          />
        </button>
      </motion.div>
    </div>
  );
}