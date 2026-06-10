"use client";

import { CartItem, MenuPOSPageClientProps } from "@/lib/type";
import { useState, useEffect, Suspense, useMemo, useRef, memo, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import {
  ShoppingCart,
  ClipboardList,
  Plus,
  Trash2,
  Minus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  MonitorUp,
  UtensilsCrossed,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import MenuOrderDetailDialog from "./MenuOrderDetailDialog";
import OrderHandler from "../OrderHandler";
import {
  createMenuToCart,
  createOrder,
  deleteMenuInCart,
  updateCartStatusNEW,
  updateMenuInCart,
  updateTableStatus,
} from "@/lib/actions/actionMenu";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MenuOrderHistorySheet } from "./MenuOrderHistorySheet";
import { Checkbox } from "@/components/ui/checkbox";
import ShoutoutDialog from "./ShoutoutDialog";
import { useUser } from "../providers/UserContext";
import { Input } from "../ui/input";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}
const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFlag, setCurrentFlag] = useState("https://flagcdn.com/w40/th.png");

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
      const originalRemoveChild = Node.prototype.removeChild;
      Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
        if (child.parentNode !== this) {
          return child;
        }
        return originalRemoveChild.call(this, child) as T;
      };

      const originalInsertBefore = Node.prototype.insertBefore;
      Node.prototype.insertBefore = function <T extends Node>(
        this: Node,
        newNode: T,
        referenceNode: Node | null
      ): T {
        if (referenceNode && referenceNode.parentNode !== this) {
          return newNode;
        }
        return originalInsertBefore.call(this, newNode, referenceNode) as T;
      };
    }
    // ---------------------------------------------------------

    if (document.getElementById("google-translate-script")) return;

    const addScript = document.createElement("script");
    addScript.id = "google-translate-script";
    addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    addScript.async = true;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "auto",
          includedLanguages: "th,en,lo,zh-CN,ko",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };
    document.body.appendChild(addScript);

    // เช็คค่าเริ่มต้นจาก Cookie
    const match = document.cookie.match(/googtrans=\/auto\/(.{2,5})/);
    if (match && match[1]) {
      const savedLang = languages.find(l => l.code === match[1]);
      if (savedLang) setCurrentFlag(savedLang.flagUrl);
    }
  }, []);

  // ใช้ลิงก์รูปภาพแทน Emoji
  const languages = [
    { code: "th", flagUrl: "https://flagcdn.com/w40/th.png", name: "ไทย" },
    { code: "en", flagUrl: "https://flagcdn.com/w40/gb.png", name: "English" },
    { code: "lo", flagUrl: "https://flagcdn.com/w40/la.png", name: "ລາວ" },
    { code: "zh-CN", flagUrl: "https://flagcdn.com/w40/cn.png", name: "中文" },
    { code: "ko", flagUrl: "https://flagcdn.com/w40/kr.png", name: "한국어" },
  ];

  const handleSelect = (lang: any) => {
    setCurrentFlag(lang.flagUrl);
    setIsOpen(false);

    document.cookie = `googtrans=/auto/${lang.code}; path=/`;
    document.cookie = `googtrans=/auto/${lang.code}; domain=${window.location.hostname}; path=/`;

    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = lang.code;
      select.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="relative pointer-events-auto">
      <div id="google_translate_element" className="hidden"></div>

      {/* ปุ่มธงชาติมุมขวา */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all bg-black/60 backdrop-blur-md border border-white/20 overflow-hidden shadow-lg"
      >
        <img src={currentFlag} alt="Language" className="w-6 h-6 object-cover rounded-full" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 right-0 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col min-w-[140px] z-50"
          >
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => handleSelect(l)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white transition-colors text-sm text-left notranslate"
              >
                <img src={l.flagUrl} alt={l.name} className="w-5 h-5 object-cover rounded-full shadow-sm" />
                <span className="font-medium tracking-wide">{l.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuImage = memo(({ src, alt, isNearby }: { src: string, alt: string, isNearby: boolean }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (isNearby && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isNearby, shouldLoad]);

  return (
    <div className="w-full h-full relative bg-[#E5E0D8]/60 flex items-center justify-center overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-0 bg-[#E5E0D8]">
          <UtensilsCrossed size={24} strokeWidth={1.5} className="text-[#A6978C]/30 animate-pulse" />
        </div>
      )}

      {shouldLoad && (
        <img
          src={src}
          alt={alt || "Menu"}
          onLoad={() => setIsLoaded(true)}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover z-10 transition-all duration-500 ${isLoaded ? 'opacity-100 group-hover:scale-105' : 'opacity-0'
            }`}
          style={{ willChange: "transform, opacity" }}
        />
      )}
    </div>
  );
});
MenuImage.displayName = "MenuImage";

const MemoizedMenuCard = memo(({
  item,
  isEntertainer,
  isRightPage,
  isBottomPlacement,
  isPkgChecked,
  isNearby,
  onOpenDetail,
  onTogglePackage
}: any) => {
  if (!item) return <div className="flex-1 bg-transparent" />;

  const displayPrice = isPkgChecked ? item.price_package || 0 : item.price_sale;

  const positionClass = isEntertainer
    ? (isRightPage ? "bottom-3 right-3 sm:bottom-4 sm:right-4" : "bottom-3 left-3 sm:bottom-4 sm:left-4")
    : (isBottomPlacement
      ? (isRightPage ? "bottom-3 right-3 sm:bottom-4 sm:right-4" : "bottom-3 left-3 sm:bottom-4 sm:left-4")
      : (isRightPage ? "top-3 right-3 sm:top-4 sm:right-4" : "top-3 left-3 sm:top-4 sm:left-4")
    );

  const checkboxPosition = isRightPage ? "top-3 left-3 sm:top-4 sm:left-4" : "top-3 right-3 sm:top-4 sm:right-4";

  const stopNativeClick = (el: HTMLElement | null) => { if (el) el.onclick = (e) => e.stopPropagation(); };
  const pointerPos = useRef({ x: 0, y: 0, time: 0 });
  const handlePointerDown = (e: React.PointerEvent) => { pointerPos.current = { x: e.clientX, y: e.clientY, time: Date.now() }; };
  const handlePointerUp = (e: React.PointerEvent, action: () => void) => {
    const dx = Math.abs(e.clientX - pointerPos.current.x);
    const dy = Math.abs(e.clientY - pointerPos.current.y);
    const dt = Date.now() - pointerPos.current.time;
    if (dx < 15 && dy < 15 && dt < 500) { e.preventDefault(); e.stopPropagation(); action(); }
  };

  return (
    <div
      ref={stopNativeClick}
      onPointerDown={handlePointerDown}
      onPointerUp={(e) => handlePointerUp(e, () => onOpenDetail(item.id))}
      style={{ touchAction: 'pan-y' }}
      className="relative w-full h-full cursor-pointer group bg-[#F5F1E8] overflow-hidden rounded-2xl shadow-sm border border-black/5 active:scale-[0.98] transition-transform duration-200"
    >
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {item.img ? (
          <MenuImage src={item.img} alt={item.menuName} isNearby={isNearby} />
        ) : (
          <div className="w-full h-full bg-[#E5E0D8]/60 flex flex-col items-center justify-center text-[#A6978C] opacity-80">
            <UtensilsCrossed size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
            <span className="font-serif tracking-widest text-[10px] font-semibold opacity-60 notranslate">NO IMAGE</span>
          </div>
        )}
      </div>

      <div className={`absolute ${positionClass} flex shadow-md z-20 max-w-[90%] bg-white/95 rounded-md overflow-hidden pointer-events-none`}>
        <div className="bg-[#614D43] text-white px-2.5 sm:px-3 py-1.5 flex items-center justify-center min-w-[36px] sm:min-w-[44px]">
          <span className="font-bold text-[11px] sm:text-[13px] notranslate">{item.menuCode || "-"}</span>
        </div>
        <div className="text-[#2A2422] px-2.5 sm:px-3 py-1.5 flex flex-col justify-center relative pr-9 sm:pr-10 min-w-[120px]">
          <span className="font-bold text-[11px] sm:text-[12px] leading-tight line-clamp-1">{item.menuName}</span>
          <span className="font-black text-[#614D43] text-[11px] sm:text-[12px] mt-[1px] notranslate">{displayPrice.toLocaleString()}.-</span>
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#614D43] text-white rounded-md flex items-center justify-center shadow-sm">
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      {item.category?.categoryName === "Entertainer" && item.package_hours > 0 && (
        <div
          className={`absolute ${checkboxPosition} z-50 flex items-center gap-2 bg-white/95 px-3 py-2 shadow-md rounded-lg border border-[#614D43]/20 cursor-pointer hover:bg-orange-50 transition-colors`}
          style={{ touchAction: 'pan-y' }}
          ref={stopNativeClick}
          onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e); }}
          onPointerUp={(e) => { e.stopPropagation(); handlePointerUp(e, () => onTogglePackage(item.id)); }}
        >
          <Checkbox id={`pkg-${item.id}`} checked={isPkgChecked} className="w-4 h-4 rounded-sm border-[#6B5A4E] data-[state=checked]:bg-[#614D43] pointer-events-none" />
          <label className="text-[10px] text-[#2A2422] font-black uppercase pointer-events-none notranslate">Pkg {item.package_hours}h</label>
        </div>
      )}
    </div>
  );
});
MemoizedMenuCard.displayName = "MemoizedMenuCard";


const MenuBookPage = ({
  relatedData,
  initialItems,
  id_user,
  organizationId,
}: MenuPOSPageClientProps) => {
  const router = useRouter();
  const bookRef = useRef<any>(null);
  const { employeeId } = useUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [bookStartPage, setBookStartPage] = useState<number>(0);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [itemnDetail, setItemnDetail] = useState<any>();
  const [tableNumber, setTableNumber] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShoutoutOpen, setIsShoutoutOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [packageSelections, setPackageSelections] = useState<Record<number, boolean>>({});

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    setIsDesktop(!isTouchDevice);
  }, []);

  const categories = useMemo(() => {
    const sortedDbCategories = relatedData.categories.map((c: any) => c.categoryName || c.name).filter(Boolean);
    const activeCatNames = new Set(initialItems.map((item: any) => item.category?.categoryName).filter(Boolean));
    const catsArray = sortedDbCategories.filter((catName: string) => activeCatNames.has(catName) && catName !== "Entertainer");
    if (activeCatNames.has("Entertainer")) catsArray.push("Entertainer");
    return ["All", ...catsArray];
  }, [initialItems, relatedData.categories]);

  // 1. ✅ กรองข้อมูลตะกร้าให้แสดงเฉพาะของโต๊ะนั้นๆ (หรือโต๊ะทั้งหมดถ้าเป็น 0)
  const filteredCartData = useMemo(() => {
    if (!relatedData.cartdatas) return [];
    if (tableNumber !== 0) {
      return relatedData.cartdatas.filter((item: any) => item.tableId === tableNumber);
    }
    return relatedData.cartdatas;
  }, [relatedData.cartdatas, tableNumber]);

  // 2. ✅ คำนวณราคารวมเฉพาะของตะกร้าที่ถูกกรองแล้ว
  const totalPrice = useMemo(() => {
    return filteredCartData.reduce((sum, item: any) => sum + (item.price_sum || 0), 0);
  }, [filteredCartData]);

  const currentTableName = useMemo(() => {
    if (!tableNumber || !relatedData.tabledatas) return "-";
    const table = relatedData.tabledatas.find((t: any) => t.id === Number(tableNumber));
    return table ? table.tableName : tableNumber;
  }, [tableNumber, relatedData.tabledatas]);

  const searchFilteredItems = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return initialItems.filter((item: any) => {
      return item.menuName?.toLowerCase().includes(lowercasedFilter) || item.menuCode?.toLowerCase().includes(lowercasedFilter);
    });
  }, [searchTerm, initialItems]);

  const displayCats = useMemo(() => categories.filter(c => c !== "All"), [categories]);

  const categoryIndexPages = useMemo(() => {
    const chunks = [];
    const catsPerPage = 15;
    for (let i = 0; i < displayCats.length; i += catsPerPage) chunks.push(displayCats.slice(i, i + catsPerPage));
    return chunks;
  }, [displayCats]);

  const isEntertainerMode = activeCategory === "Entertainer";

  const booksData = useMemo(() => {
    const pagePattern = [5, 4, 3, 5, 2, 3];
    const mainPages: any[] = [];
    const mainCatStartMap: Record<string, number> = {};
    const mainPageCatMap: Record<number, string> = {};

    mainPages.push({ isMainCover: true });
    mainPageCatMap[0] = "All";

    categoryIndexPages.forEach((catChunk, index) => {
      mainPages.push({ isCategoryIndex: true, items: catChunk, pageNum: index + 1 });
      mainPageCatMap[mainPages.length - 1] = "All";
    });

    let patternIdx = 0;
    const foodCats = displayCats.filter(c => c !== "Entertainer");

    foodCats.forEach(cat => {
      const catItems = initialItems.filter((i: any) => i.category?.categoryName === cat);
      if (catItems.length > 0) {
        mainCatStartMap[cat] = mainPages.length;
        mainPages.push({ isCover: true, title: cat, items: [] });
        mainPageCatMap[mainPages.length - 1] = cat;

        let i = 0;
        while (i < catItems.length) {
          let take = pagePattern[patternIdx % pagePattern.length];
          if (catItems.length - i < take) take = catItems.length - i;
          mainPages.push({ isCover: false, title: cat, items: catItems.slice(i, i + take) });
          mainPageCatMap[mainPages.length - 1] = cat;
          i += take;
          patternIdx++;
        }
      }
    });

    if (mainPages.length === 1 + categoryIndexPages.length) {
      mainPages.push({ isCover: false, title: "No Items Found", items: [] });
      mainPageCatMap[mainPages.length - 1] = "All";
    }

    mainPages.push({ isBackCover: true });
    mainPageCatMap[mainPages.length - 1] = "All";

    if (mainPages.length % 2 !== 0) {
      const backCover = mainPages.pop();
      mainPages.push({ isCover: false, title: mainPages[mainPages.length - 1]?.title || "", items: [], isBlank: true });
      mainPageCatMap[mainPages.length - 1] = mainPageCatMap[mainPages.length - 2] || "All";
      mainPages.push(backCover);
    }
    mainPageCatMap[mainPages.length - 1] = "All";

    const entPages: any[] = [];
    const entCatStartMap: Record<string, number> = {};
    const entPageCatMap: Record<number, string> = {};

    entPages.push({ isCover: true, title: "Entertainer Selection", isEntertainerCover: true });
    entPageCatMap[0] = "Entertainer";

    const entItems = initialItems.filter((i: any) => i.category?.categoryName === "Entertainer");
    let j = 0;
    while (j < entItems.length) {
      let take = 2;
      if (entItems.length - j < take) take = entItems.length - j;
      entPages.push({ isCover: false, title: "Entertainer", items: entItems.slice(j, j + take) });
      entPageCatMap[entPages.length - 1] = "Entertainer";
      j += take;
    }

    entPages.push({ isBackCover: true });
    entPageCatMap[entPages.length - 1] = "Entertainer";

    if (entPages.length % 2 !== 0) {
      const backCover = entPages.pop();
      entPages.push({ isCover: false, title: "Blank", items: [], isBlank: true });
      entPageCatMap[entPages.length - 1] = "Entertainer";
      entPages.push(backCover);
    }
    entPageCatMap[entPages.length - 1] = "Entertainer";

    return {
      main: { pages: mainPages, catStartMap: mainCatStartMap, pageCatMap: mainPageCatMap },
      ent: { pages: entPages, catStartMap: entCatStartMap, pageCatMap: entPageCatMap }
    };
  }, [initialItems, displayCats, categoryIndexPages]);

  const activeBookData = isEntertainerMode ? booksData.ent : booksData.main;

  const [pendingJumpCategory, setPendingJumpCategory] = useState<string | null>(null);

  useEffect(() => {
    if (pendingJumpCategory && !isEntertainerMode) {
      const targetPage = pendingJumpCategory === "All" ? 0 : booksData.main.catStartMap[pendingJumpCategory];
      if (targetPage !== undefined) {
        const timer = setTimeout(() => {
          if (bookRef.current && bookRef.current.pageFlip) bookRef.current.pageFlip().turnToPage(targetPage);
          setPendingJumpCategory(null);
        }, 400);
        return () => clearTimeout(timer);
      } else {
        setPendingJumpCategory(null);
      }
    }
  }, [pendingJumpCategory, isEntertainerMode, booksData]);

  const stopNativeClick = (el: HTMLElement | null) => { if (el) { el.onclick = (e) => { e.stopPropagation(); }; } };
  const pointerPos = useRef({ x: 0, y: 0, time: 0 });
  const handlePointerDown = (e: React.PointerEvent) => { pointerPos.current = { x: e.clientX, y: e.clientY, time: Date.now() }; };
  const handlePointerUp = (e: React.PointerEvent, action: () => void) => {
    const dx = Math.abs(e.clientX - pointerPos.current.x);
    const dy = Math.abs(e.clientY - pointerPos.current.y);
    const dt = Date.now() - pointerPos.current.time;
    if (dx < 15 && dy < 15 && dt < 500) { e.preventDefault(); e.stopPropagation(); action(); }
  };

  const onPageFlip = useCallback((e: any) => {
    const pageIndex = e.data;
    setCurrentPage(pageIndex);
    const currentCat = activeBookData.pageCatMap[pageIndex];
    if (currentCat && !isEntertainerMode && !pendingJumpCategory) {
      setTimeout(() => {
        setActiveCategory(currentCat);
      }, 200);
    }
  }, [activeBookData, isEntertainerMode, pendingJumpCategory]);

  const handelOpendetail = useCallback((id_for_detail: any) => {
    const itemToDetail = initialItems.find((item: any) => item.id === id_for_detail);
    const isPackageSelected = packageSelections[id_for_detail] || false;
    setItemnDetail({ ...itemToDetail, isPackageSelected });
    setIsOpenDetail(true);
  }, [initialItems, packageSelections]);

  const handleTogglePackage = useCallback((itemId: number) => {
    setPackageSelections((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const handleAddToCart = async (cartItem: CartItem) => {
    cartItem.organizationId = organizationId ?? 1;
    if (tableNumber != 0) cartItem.tableId = tableNumber;
    const callBlack = await createMenuToCart(cartItem);
    if (callBlack.success) router.refresh();
  };

  const handleUpdateCartQuantity = async (cartId: number, menuId: number, newQuantity: number, priceSum: number) => {
    const cartItem = { id: cartId, menuId: menuId, quantity: newQuantity, price_sum: priceSum };
    const callBlack = await updateMenuInCart(cartItem);
    if (callBlack.success) router.refresh();
  };

  const handleRemoveFromCart = async (cartId: number, menuId: number) => {
    const cartItem = { id: cartId, menuId: menuId };
    const callBlack = await deleteMenuInCart(cartItem);
    if (callBlack.success) router.refresh();
  };

  const handleConfirmOrder = async () => {
    try {
      // 3. ✅ ส่งออเดอร์เฉพาะรายการที่อยู่ในตะกร้าของโต๊ะนั้นๆ เท่านั้น
      if (filteredCartData.length === 0) return toast.warning("ไม่มีรายการในตะกร้า");
      const cartDataWithEmployee = filteredCartData.map((item: any) => ({
        ...item, employeeId: employeeId ? String(employeeId) : null,
      }));
      const result = await createOrder(cartDataWithEmployee);
      if (result.success) {
        await updateCartStatusNEW(filteredCartData);
        await updateTableStatus(filteredCartData, "OCCUPIED");
        toast.success("ส่งออเดอร์สำเร็จ!", { position: "bottom-center" });
        setIsCartOpen(false);
        router.refresh();
      } else toast.error(`ผิดพลาด! ${result.message || "ไม่สามารถส่งออเดอร์ได้"}`);
    } catch (error) { toast.error(`ติดต่อพนักงาน! ${error}`); }
  };

  useEffect(() => {
    // 4. ✅ ใช้ filteredCartData คำนวณจำนวนชิ้นบนปุ่มตะกร้า
    const totalItemsQty = filteredCartData.reduce((sum, item: any) => sum + (item.quantity || 1), 0);
    setCartCount(totalItemsQty);
  }, [filteredCartData]);


  const renderItemCard = (item: any, isEntertainer: boolean, isRightPage: boolean, isBottomPlacement: boolean = false, isNearby: boolean = false) => {
    return (
      <MemoizedMenuCard
        item={item}
        isEntertainer={isEntertainer}
        isRightPage={isRightPage}
        isBottomPlacement={isBottomPlacement}
        isPkgChecked={item ? packageSelections[item.id] || false : false}
        isNearby={isNearby}
        onOpenDetail={handelOpendetail}
        onTogglePackage={handleTogglePackage}
      />
    );
  };

  return (
    <div
      className="fixed inset-0 bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center font-sans select-none"
      style={{ overscrollBehavior: 'none' }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        body, html { 
          overscroll-behavior-x: none !important; 
          overscroll-behavior-y: none !important;
        }
        body { top: 0 !important; position: static !important; }
        .goog-te-banner-frame { display: none !important; }
        .skiptranslate { display: none !important; }
        #goog-gt-tt { display: none !important; }
        .goog-tooltip { display: none !important; }
        .goog-tooltip:hover { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
      `}} />

      <Suspense fallback={null}><OrderHandler setTableNumber={setTableNumber} /></Suspense>

      {/* ================= TOP BAR ================= */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-start pt-4 px-4 sm:px-6 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-white/90 text-[10px] sm:text-xs font-bold tracking-widest uppercase">Table <span className="text-orange-500 notranslate">{currentTableName}</span></span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <button onClick={() => setIsSearchOpen(true)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
            <Search size={16} strokeWidth={2} />
          </button>

          <button onClick={() => setIsSidebarOpen(true)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
            <Menu size={18} strokeWidth={2} />
          </button>

          <div className="w-[1px] h-4 bg-white/20 mx-0.5 sm:mx-1" />

          <LanguageSwitcher />
        </div>
      </div>

      {/* ================= BOTTOM ACTION BAR ================= */}
      <div className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <div className="pointer-events-auto flex items-center p-1.5 sm:p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

          <button onClick={() => setIsShoutoutOpen(true)} className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-95">
            <MonitorUp size={20} strokeWidth={1.5} />
          </button>

          <button onClick={() => setIsHistoryOpen(true)} className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-95">
            <ClipboardList size={20} strokeWidth={1.5} />
          </button>

          <div className="w-[1px] h-6 sm:h-7 bg-white/20 mx-1 sm:mx-1.5" />

          <button
            onClick={() => setIsCartOpen(true)}
            className={`relative flex items-center justify-center gap-2 h-11 sm:h-12 px-5 sm:px-6 ml-1 rounded-full transition-all duration-300 active:scale-95 ${cartCount > 0
              ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_4px_20px_rgba(234,88,12,0.4)] border border-orange-500/50"
              : "bg-white/10 hover:bg-white/20 text-white/90 border border-white/5"
              }`}
          >
            <ShoppingCart size={18} strokeWidth={2} />
            <span className="text-[13px] sm:text-sm font-medium tracking-wide">ตะกร้า</span>

            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-white text-orange-600 text-[10px] sm:text-[11px] font-black min-w-[20px] sm:min-w-[24px] h-5 sm:h-6 px-1.5 rounded-full flex items-center justify-center shadow-lg border-2 border-orange-100 notranslate animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:w-[380px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[60vh] sm:max-h-[70vh]"
          >
            <div className="relative shrink-0 border-b border-white/10 bg-black/20">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <Input
                autoFocus
                type="text"
                placeholder="ค้นหาชื่อ หรือ รหัสเมนู..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-12 bg-transparent border-none h-14 w-full text-white placeholder:text-stone-500 focus-visible:ring-0 text-sm notranslate"
              />
              <button
                onClick={() => { setIsSearchOpen(false); setSearchTerm(""); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {searchTerm && (
              <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                {searchFilteredItems.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {searchFilteredItems.map((item) => {
                      const isPkgChecked = packageSelections[item.id] || false;
                      const displayPrice = isPkgChecked ? item.price_package || 0 : item.price_sale;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchTerm("");
                            handelOpendetail(item.id);
                          }}
                          className="w-full text-left flex items-center gap-3 p-2.5 hover:bg-white/10 rounded-xl transition-all group active:scale-[0.98]"
                        >
                          <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden relative shrink-0 border border-white/10 group-hover:border-orange-500/50 transition-colors">
                            {item.img ? (
                              <Image src={item.img} alt={item.menuName} fill className="object-cover" sizes="48px" quality={30} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/20">
                                <UtensilsCrossed size={20} />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <span className="text-white font-medium text-sm truncate group-hover:text-orange-400 transition-colors">
                              {item.menuName}
                            </span>
                            <span className="text-stone-400 text-[11px] flex items-center gap-2 mt-0.5">
                              <span className="bg-white/10 px-1.5 py-0.5 rounded text-white/70 notranslate">{item.menuCode || "-"}</span>
                              <span className="truncate">{item.category?.categoryName}</span>
                            </span>
                          </div>

                          <div className="text-orange-500 font-bold text-sm shrink-0 notranslate">
                            {displayPrice.toLocaleString()}.-
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center text-stone-500 py-10 flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 opacity-20" />
                    <span className="text-sm">ไม่พบเมนู &quot;{searchTerm}&quot;</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full h-full absolute inset-0 flex items-center justify-center pt-6 pb-4 sm:pt-10 sm:pb-6">
        <HTMLFlipBook
          key={isEntertainerMode ? "entertainer-secret-book" : "main-food-book"}
          width={400} height={750}
          size="stretch"
          minWidth={300} maxWidth={2500} minHeight={500} maxHeight={3000}
          showCover={false}
          mobileScrollSupport={false}
          className="w-full h-full drop-shadow-xl"
          ref={bookRef}
          flippingTime={450}
          usePortrait={true}
          autoSize={true}
          drawShadow={isDesktop}
          showPageCorners={true}
          maxShadowOpacity={isDesktop ? 0.3 : 0.1}
          disableFlipByClick={isDesktop}
          swipeDistance={15}
          clickEventForward={true}
          useMouseEvents={true}
          onFlip={onPageFlip}
          style={{ touchAction: 'pan-y' }}
          startPage={0}
          startZIndex={0}
        >
          {activeBookData.pages.map((page, pIndex) => {
            const itemCount = page.items?.length || 0;
            const isRightPage = (pIndex + 1) % 2 === 0;
            const isNearby = Math.abs(pIndex - currentPage) <= 2;

            if (page.isMainCover) {
              return (
                <div key={`page-${pIndex}`} className="bg-[#12100E] w-full h-full relative overflow-hidden flex flex-col items-center justify-center shadow-inner p-4 sm:p-6 border-[12px] sm:border-[16px] border-[#1C1816]">
                  <div className={`absolute top-0 bottom-0 w-16 pointer-events-none z-10 ${isRightPage ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/80 to-transparent`} />

                  <div className="absolute inset-4 sm:inset-6 border border-[#D4AF37]/40 z-20 flex flex-col items-center justify-center p-8">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#D4AF37]"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#D4AF37]"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#D4AF37]"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#D4AF37]"></div>

                    <div className="mb-8 text-[#D4AF37] opacity-80"><UtensilsCrossed size={48} strokeWidth={1} /></div>
                    <h1 className="text-5xl sm:text-6xl font-serif text-[#D4AF37] font-bold tracking-[0.25em] text-center mb-6 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)] notranslate">MENU</h1>
                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-6"></div>
                    <p className="text-[#A38A75] text-[10px] sm:text-[11px] tracking-[0.5em] font-medium uppercase text-center notranslate">Premium Selection</p>
                  </div>
                </div>
              );
            }

            if (page.isBackCover) {
              return (
                <div key={`page-${pIndex}`} className="bg-[#12100E] w-full h-full relative overflow-hidden flex flex-col items-center justify-center shadow-inner p-4 sm:p-6 border-[12px] sm:border-[16px] border-[#1C1816]">
                  <div className={`absolute top-0 bottom-0 w-16 pointer-events-none z-10 ${isRightPage ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/80 to-transparent`} />
                  <div className="absolute inset-4 sm:inset-6 border border-[#D4AF37]/20 z-20 flex flex-col items-center justify-center p-8">
                    <div className="mb-6 text-[#D4AF37] opacity-40"><UtensilsCrossed size={40} strokeWidth={1} /></div>
                    <h2 className="text-3xl font-serif text-[#D4AF37] font-bold tracking-[0.2em] mb-4 uppercase drop-shadow-md">Thank You</h2>
                    <p className="text-[#A38A75] text-xs tracking-[0.2em] mb-12">ขอบคุณที่ใช้บริการ</p>
                    <div className="mt-16 w-16 h-[1px] bg-[#D4AF37]/20"></div>
                    <p className="mt-4 text-[9px] text-[#A38A75]/40 tracking-widest uppercase notranslate">END OF MENU</p>
                  </div>
                </div>
              );
            }

            if (page.isCategoryIndex) {
              return (
                <div key={`page-${pIndex}`} className="bg-[#F5F2EB] w-full h-full relative overflow-hidden flex flex-col shadow-inner p-6 sm:p-10">
                  <div className={`absolute top-0 bottom-0 w-12 pointer-events-none z-10 ${isRightPage ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/10 to-transparent`} />

                  <div className="text-center mb-6 sm:mb-8 relative z-20 shrink-0 mt-2">
                    <h2 className="text-2xl sm:text-3xl font-serif text-[#5C4A3D] font-bold tracking-[0.2em] uppercase">
                      {page.pageNum === 1 ? 'Contents' : 'Contents (Cont.)'}
                    </h2>
                    <div className="w-16 h-[2px] bg-[#5C4A3D] mx-auto mt-4 rounded-full"></div>
                  </div>

                  <div className="flex-1 w-full relative z-20 overflow-y-auto pb-6 custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div className="flex flex-col gap-3 sm:gap-4 px-2">
                      {page.items.map((cat: any, idx: number) => {
                        const isActive = activeCategory === cat;
                        return (
                          <button
                            key={idx}
                            ref={stopNativeClick}
                            style={{ touchAction: 'pan-y' }}
                            onPointerDown={handlePointerDown}
                            onPointerUp={(e) => handlePointerUp(e, () => {
                              if (cat === "Entertainer") {
                                setBookStartPage(0);
                                setActiveCategory("Entertainer");
                              } else {
                                const targetPage = booksData.main.catStartMap[cat] || 0;
                                setBookStartPage(targetPage);
                                setActiveCategory(cat);
                                if (!isEntertainerMode) {
                                  setTimeout(() => bookRef.current?.pageFlip().turnToPage(targetPage), 150);
                                }
                              }
                            })}
                            className="flex items-end justify-between w-full group cursor-pointer text-left py-1"
                          >
                            <span className={`pointer-events-none font-bold font-serif tracking-widest uppercase text-[13px] sm:text-sm transition-colors ${isActive ? "text-orange-600" : "text-[#5C4A3D] group-hover:text-orange-600"}`}>
                              {cat === "All" ? "หน้าแรก" : cat}
                            </span>
                            <div className={`pointer-events-none flex-1 border-b-[2px] border-dotted mx-4 relative top-[-6px] transition-colors ${isActive ? "border-orange-600/40" : "border-[#5C4A3D]/20 group-hover:border-orange-600/30"}`}></div>
                            <ChevronRight size={16} className={`pointer-events-none transition-colors shrink-0 ${isActive ? "text-orange-600" : "text-[#A38A75] group-hover:text-orange-600"}`} strokeWidth={2} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            if (page.isEntertainerCover) {
              return (
                <div key={`page-${pIndex}`} className="bg-[#1A1615] w-full h-full relative overflow-hidden flex flex-col items-center justify-center shadow-inner p-4 border-[12px] border-[#26201E]">
                  <div className="absolute inset-4 border border-[#D4AF37]/30 z-20 flex flex-col items-center justify-center p-8">
                    <div className="mb-4 text-[#D4AF37] opacity-80 text-xl">✦</div>
                    <h2 className="text-3xl sm:text-4xl text-[#D4AF37] font-serif font-bold text-center uppercase tracking-widest notranslate">{page.title}</h2>
                    <div className="w-12 h-[1px] bg-[#D4AF37]/50 my-4" />
                    <p className="text-[#A38A75] text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-center mb-8">Exclusive Lounge Mode</p>
                    <button
                      ref={stopNativeClick}
                      style={{ touchAction: 'pan-y' }}
                      onPointerDown={handlePointerDown}
                      onPointerUp={(e) => handlePointerUp(e, () => {
                        setBookStartPage(0);
                        setActiveCategory("All");
                      })}
                      className="px-5 py-2 bg-white/5 border border-white/10 hover:bg-orange-600 hover:border-orange-500 text-white/70 hover:text-white text-xs rounded-xl transition-all pointer-events-auto shadow-md"
                    >
                      กลับหน้าเมนูหลัก
                    </button>
                  </div>
                </div>
              );
            }

            if (page.isCover && !page.isBlank) {
              return (
                <div key={`page-${pIndex}`} className="bg-[#F5F2EB] w-full h-full relative overflow-hidden flex flex-col items-center justify-center shadow-inner p-4">
                  <div className={`absolute top-0 bottom-0 w-12 pointer-events-none z-10 ${isRightPage ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/10 to-transparent`} />
                  <div className="absolute inset-6 border border-[#B8A495]/40 z-0">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-[#5C4A3D]"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-[#5C4A3D]"></div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-[#5C4A3D]"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[#5C4A3D]"></div>
                  </div>
                  <div className="z-20 flex flex-col items-center justify-center text-center px-8">
                    <div className="mb-6 text-[#5C4A3D]/60 text-xl">✦</div>
                    <h2 className="text-4xl sm:text-5xl text-[#5C4A3D] font-serif font-bold leading-tight drop-shadow-sm uppercase tracking-wider">{page.title}</h2>
                    <div className="mt-8 w-24 h-[1px] bg-gradient-to-r from-transparent via-[#5C4A3D] to-transparent" />
                    <span className="text-[#A38A75] text-[10px] tracking-[0.4em] uppercase mt-4 font-semibold notranslate">Signature Menu</span>
                  </div>
                </div>
              );
            }

            if (page.isBlank) {
              return (
                <div key={`page-${pIndex}`} className="bg-[#EBEBEB] w-full h-full relative shadow-inner">
                  <div className={`absolute top-0 bottom-0 w-8 pointer-events-none z-10 ${isRightPage ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/10 to-transparent`} />
                </div>
              );
            }

            return (
              <div key={`page-${pIndex}`} className="bg-[#EBEBEB] w-full h-full relative overflow-hidden flex flex-col shadow-inner">
                <div className={`absolute top-0 bottom-0 w-8 pointer-events-none z-10 ${isRightPage ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/10 to-transparent`} />
                <div className="flex-1 w-full h-full p-2.5 sm:p-3 pb-8 flex flex-col gap-2.5 sm:gap-3 z-20">

                  {isEntertainerMode ? (
                    <>
                      {itemCount >= 1 && <div className={`${itemCount === 1 ? 'h-full' : 'h-1/2'} w-full`}>{renderItemCard(page.items[0], true, isRightPage, false, isNearby)}</div>}
                      {itemCount >= 2 && <div className="h-1/2 w-full">{renderItemCard(page.items[1], true, isRightPage, false, isNearby)}</div>}
                    </>
                  ) : (
                    <>
                      {itemCount === 5 && pIndex % 2 === 0 && (
                        <>
                          <div className="h-[40%] w-full">{renderItemCard(page.items[0], false, isRightPage, false, isNearby)}</div>
                          <div className="grid grid-cols-2 grid-rows-2 gap-2.5 sm:gap-3 h-[60%] w-full">
                            <div>{renderItemCard(page.items[1], false, isRightPage, false, isNearby)}</div>
                            <div>{renderItemCard(page.items[2], false, isRightPage, false, isNearby)}</div>
                            <div>{renderItemCard(page.items[3], false, isRightPage, true, isNearby)}</div>
                            <div>{renderItemCard(page.items[4], false, isRightPage, true, isNearby)}</div>
                          </div>
                        </>
                      )}

                      {itemCount === 5 && pIndex % 2 !== 0 && (
                        <>
                          <div className="grid grid-cols-2 grid-rows-2 gap-2.5 sm:gap-3 h-[60%] w-full">
                            <div>{renderItemCard(page.items[0], false, isRightPage, false, isNearby)}</div>
                            <div>{renderItemCard(page.items[1], false, isRightPage, false, isNearby)}</div>
                            <div>{renderItemCard(page.items[2], false, isRightPage, true, isNearby)}</div>
                            <div>{renderItemCard(page.items[3], false, isRightPage, true, isNearby)}</div>
                          </div>
                          <div className="h-[40%] w-full">{renderItemCard(page.items[4], false, isRightPage, true, isNearby)}</div>
                        </>
                      )}

                      {itemCount === 4 && (
                        <div className="grid grid-cols-2 grid-rows-2 gap-2.5 sm:gap-3 h-full w-full">
                          <div>{renderItemCard(page.items[0], false, isRightPage, false, isNearby)}</div>
                          <div>{renderItemCard(page.items[1], false, isRightPage, false, isNearby)}</div>
                          <div>{renderItemCard(page.items[2], false, isRightPage, true, isNearby)}</div>
                          <div>{renderItemCard(page.items[3], false, isRightPage, true, isNearby)}</div>
                        </div>
                      )}

                      {itemCount === 3 && pIndex % 2 === 0 && (
                        <>
                          <div className="h-[55%] w-full">{renderItemCard(page.items[0], false, isRightPage, false, isNearby)}</div>
                          <div className="flex gap-2.5 sm:gap-3 h-[45%] w-full">
                            <div className="flex-1 h-full">{renderItemCard(page.items[1], false, isRightPage, true, isNearby)}</div>
                            <div className="flex-1 h-full">{renderItemCard(page.items[2], false, isRightPage, true, isNearby)}</div>
                          </div>
                        </>
                      )}

                      {itemCount === 3 && pIndex % 2 !== 0 && (
                        <>
                          <div className="flex gap-2.5 sm:gap-3 h-[45%] w-full">
                            <div className="flex-1 h-full">{renderItemCard(page.items[0], false, isRightPage, false, isNearby)}</div>
                            <div className="flex-1 h-full">{renderItemCard(page.items[1], false, isRightPage, false, isNearby)}</div>
                          </div>
                          <div className="h-[55%] w-full">{renderItemCard(page.items[2], false, isRightPage, true, isNearby)}</div>
                        </>
                      )}

                      {itemCount === 2 && (
                        <>
                          <div className="h-1/2 w-full">{renderItemCard(page.items[0], false, isRightPage, false, isNearby)}</div>
                          <div className="h-1/2 w-full">{renderItemCard(page.items[1], false, isRightPage, true, isNearby)}</div>
                        </>
                      )}

                      {itemCount === 1 && (
                        <div className="h-full w-full">{renderItemCard(page.items[0], false, isRightPage, false, isNearby)}</div>
                      )}

                      {itemCount === 0 && (
                        <div className="h-full w-full flex items-center justify-center">
                          <span className="text-[#333]/20 font-serif tracking-widest text-lg uppercase notranslate">{page.title || "Blank Page"}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[#333]/40 font-serif text-[10px] tracking-widest z-40 pointer-events-none notranslate">
                  - {String(pIndex + 1).padStart(2, '0')} -
                </div>
              </div>
            );
          })}
        </HTMLFlipBook>
      </div>

      {/* Sidebar ซ้าย */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[300px] bg-[#1a1a1a] border-r border-white/5 p-0 flex flex-col">
          <SheetHeader className="p-6 pb-4 text-left border-b border-white/5">
            <SheetTitle className="text-xl font-serif font-medium text-white/90 tracking-widest uppercase">Categories</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
            <div className="flex flex-col gap-1 pb-24">
              {categories.map((cat: any) => (
                <button
                  key={cat}
                  onClick={() => {
                    setIsSidebarOpen(false);
                    if (cat === "All") {
                      setBookStartPage(0);
                      setActiveCategory("All");
                      if (!isEntertainerMode) bookRef.current?.pageFlip().turnToPage(0);
                    } else if (cat === "Entertainer") {
                      setBookStartPage(0);
                      setActiveCategory("Entertainer");
                      if (isEntertainerMode) bookRef.current?.pageFlip().turnToPage(0);
                    } else {
                      const targetPage = booksData.main.catStartMap[cat] || 0;
                      setBookStartPage(targetPage);
                      setActiveCategory(cat);
                      if (!isEntertainerMode) {
                        setTimeout(() => bookRef.current?.pageFlip().turnToPage(targetPage), 150);
                      }
                    }
                  }}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeCategory === cat ? "bg-white/10 text-orange-500 font-medium" : "text-white/60 hover:bg-white/5 hover:text-white/90"}`}
                >
                  <span className="text-sm tracking-wide">{cat === "All" ? "หน้าแรก" : cat}</span>
                  <ChevronRight size={16} className={activeCategory === cat ? "text-orange-500 opacity-100" : "opacity-0"} />
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ปุ่มเลื่อนหน้าซ้าย (แสดงทุกหน้าจอแล้ว) */}
      <div className="fixed top-1/2 left-2 sm:left-6 -translate-y-1/2 z-30 pointer-events-auto">
        <button
          onClick={() => bookRef.current?.pageFlip().flipPrev()}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-black/20 sm:bg-white/10 hover:bg-black/40 sm:hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 sm:text-white/80 hover:text-white transition-all shadow-lg border border-white/10"
        >
          <ChevronLeft strokeWidth={1.5} className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* ปุ่มเลื่อนหน้าขวา (แสดงทุกหน้าจอแล้ว) */}
      <div className="fixed top-1/2 right-2 sm:right-6 -translate-y-1/2 z-30 pointer-events-auto">
        <button
          onClick={() => bookRef.current?.pageFlip().flipNext()}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-black/20 sm:bg-white/10 hover:bg-black/40 sm:hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 sm:text-white/80 hover:text-white transition-all shadow-lg border border-white/10"
        >
          <ChevronRight strokeWidth={1.5} className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="bottom" className="h-[90vh] max-h-[90vh] rounded-t-[2rem] px-0 flex flex-col bg-[#F5F5F5] border-t border-gray-200 text-[#2A2422] overflow-hidden">
          <SheetHeader className="shrink-0 px-6 py-5 border-b border-gray-200 bg-white z-10">
            <SheetTitle className="text-center text-lg font-serif font-bold tracking-[0.1em] text-[#2A2422]">YOUR CART ({cartCount})</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            {/* 5. ✅ นำ filteredCartData มา Map แสดงผลแทนอันเก่า */}
            {filteredCartData.length > 0 ? (
              <div className="flex flex-col gap-4 pb-6">
                {filteredCartData.map((item: any) => {
                  const menuItem = initialItems.find((m: any) => m.id === item.menuId);
                  return (
                    <div key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <div className="w-16 h-16 bg-gray-50 flex-shrink-0 relative overflow-hidden border border-gray-100 rounded-md">
                        {menuItem?.img ? <Image src={menuItem.img} alt={menuItem.menuName || "Menu Image"} fill className="object-cover" sizes="64px" quality={30} /> : <div className="flex items-center justify-center h-full text-xs text-gray-400">IMG</div>}
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm text-[#2A2422] line-clamp-1"><span className="text-[10px] text-[#614D43] font-sans mr-2 notranslate">{menuItem?.menuCode}</span>{menuItem?.menuName || "Unknown Item"}</h4>
                          <button onClick={() => handleRemoveFromCart(item.id, item.menuId)} className="text-[#2A2422]/30 hover:text-red-500 p-1 shrink-0"><Trash2 size={16} /></button>
                        </div>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1">{item.modifiers.map((mod: any, index: number) => (<span key={index} className="inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-medium bg-gray-100 text-gray-700">{mod.name} {mod.price > 0 && <span className="ml-1 text-[#614D43] notranslate">(+{mod.price})</span>}</span>))}</div>
                        )}
                        <div className="flex justify-between items-end mt-1">
                          <span className="font-black text-[#614D43] text-sm notranslate">{item.price_sum.toLocaleString()}.-</span>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
                            <button onClick={() => { if (item.quantity > 1) { const newQty = item.quantity - 1; const unitPrice = item.price_sum / item.quantity; handleUpdateCartQuantity(item.id, item.menuId, newQty, unitPrice * newQty); } }} className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-[#2A2422] hover:bg-gray-100 transition-colors shadow-sm"><Minus size={12} /></button>
                            <span className="text-sm font-bold min-w-[16px] text-center text-[#2A2422] notranslate">{item.quantity}</span>
                            <button onClick={() => { const newQty = item.quantity + 1; const unitPrice = item.price_sum / item.quantity; handleUpdateCartQuantity(item.id, item.menuId, newQty, unitPrice * newQty); }} className="w-6 h-6 flex items-center justify-center bg-[#614D43] text-white rounded-full hover:bg-orange-600 transition-colors shadow-sm"><Plus size={12} strokeWidth={3} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400 gap-3"><ShoppingCart size={40} strokeWidth={1} /><p className="tracking-[0.1em] text-xs font-bold">CART IS EMPTY</p></div>
            )}
          </div>
          <div className="shrink-0 p-5 sm:p-6 border-t border-gray-200 bg-white safe-area-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-10">
            <div className="flex justify-between items-center mb-5"><span className="text-gray-500 text-xs tracking-widest font-bold">TOTAL AMOUNT</span><span className="text-2xl font-serif font-black text-[#2A2422] notranslate">{totalPrice.toLocaleString()}.-</span></div>
            {/* 6. ✅ เช็ค disabled ด้วย filteredCartData */}
            <Button className="w-full h-14 text-sm font-bold tracking-widest bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-600/20" onClick={handleConfirmOrder} disabled={filteredCartData.length === 0}>CONFIRM ORDER</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ของเดิมที่มีอยู่แล้ว */}
      <MenuOrderHistorySheet isOpen={isHistoryOpen} onOpenChange={setIsHistoryOpen} relatedData={relatedData} tableNumber={tableNumber} />
      <AnimatePresence>{isOpenDetail && <MenuOrderDetailDialog stateDialog={setIsOpenDetail} open={isOpenDetail} menuDetail={itemnDetail} tableNumber={tableNumber} dataTable={relatedData.tabledatas} onAddToCart={handleAddToCart} />}</AnimatePresence>
      <ShoutoutDialog isOpen={isShoutoutOpen} onClose={() => setIsShoutoutOpen(false)} organizationId={organizationId ?? 1} />

      {/* 🔴 เพิ่มส่วนนี้: ROTATE DEVICE OVERLAY (แสดงเฉพาะมือถือแนวนอนเท่านั้น) */}
      <div className="hidden [@media(max-width:950px)_and_(max-height:500px)_and_(orientation:landscape)]:flex fixed inset-0 z-[99999] bg-[#0a0a0a]/95 backdrop-blur-xl flex-col items-center justify-center text-white px-6 text-center">
        <motion.div
          initial={{ rotate: -90 }}
          animate={{ rotate: [-90, 0, 0, -90] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", times: [0, 0.4, 0.8, 1] }}
          className="mb-8"
        >
          <div className="w-16 h-28 border-[3px] border-white/20 rounded-3xl flex items-center justify-center relative bg-black shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            {/* ลำโพงบน */}
            <div className="w-5 h-1 bg-white/20 rounded-full absolute top-2.5" />
            {/* หน้าจอจำลอง */}
            <div className="w-12 h-20 border-2 border-white/10 rounded-xl flex items-center justify-center bg-white/5">
              <UtensilsCrossed size={16} className="text-white/20" />
            </div>
          </div>
        </motion.div>

        <h2 className="text-2xl font-serif text-white/90 font-bold tracking-[0.2em] mb-4 notranslate uppercase drop-shadow-lg">
          Portrait Only
        </h2>
        <p className="text-white/60 text-sm leading-relaxed tracking-wide">
          กรุณาหมุนโทรศัพท์ของคุณเป็น <span className="text-orange-500 font-bold">แนวตั้ง</span><br />
          เพื่อการแสดงผลสมุดเมนูที่สมบูรณ์
        </p>
      </div>

    </div>
  );
};

export default MenuBookPage;