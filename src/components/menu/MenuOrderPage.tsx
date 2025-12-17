"use client";

import { CartItem, MenuPOSPageClientProps } from "@/lib/type";
import { useState, useEffect, Suspense, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Loader2,
  SearchX,
  ShoppingCart,
  ClipboardList,
  Bell,
  Plus,
  Trash2,
  Minus,
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
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MenuOrderHistorySheet } from "./MenuOrderHistorySheet";

const MenuOrderPage = ({
  relatedData,
  initialItems,
}: MenuPOSPageClientProps) => {
  const router = useRouter();
  const session = useSession();
  const organizationId = session.data?.user.organizationId;
  const itemsPerPage = 10;

  // State
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filteredItems, setFilteredItems] = useState(initialItems);
  const [currentItems, setCurrentItems] = useState(
    initialItems.slice(0, itemsPerPage)
  );
  const [hasMore, setHasMore] = useState(initialItems.length > itemsPerPage);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [itemnDetail, setItemnDetail] = useState();
  const [tableNumber, setTableNumber] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Extract Categories
  const categories = useMemo(() => {
    const cats = new Set(
      initialItems.map((item: any) => item.category.categoryName)
    );
    return ["All", ...Array.from(cats)];
  }, [initialItems]);

  // Calculate Total Price
  const totalPrice = useMemo(() => {
    return relatedData.cartdatas.reduce(
      (sum, item) => sum + (item.price_sum || 0),
      0
    );
  }, [relatedData.cartdatas]);

  // --- Handlers ---

  const handelOpendetail = async (id_for_detail: any) => {
    const itemToDetail = initialItems.find(
      (item: any) => item.id === id_for_detail
    );
    setItemnDetail(itemToDetail);
    setIsOpenDetail(true);
  };

  const handleAddToCart = async (cartItem: CartItem) => {
    cartItem.organizationId = organizationId ?? 1;
    if (tableNumber != 0) {
      cartItem.tableId = tableNumber;
    }
    const callBlack = await createMenuToCart(cartItem);
    if (callBlack.success) {
      router.refresh();
    }
  };

  const loadMoreItems = () => {
    const nextPage = page + 1;
    const nextItemsIndex = nextPage * itemsPerPage;

    setTimeout(() => {
      const newItems = filteredItems.slice(0, nextItemsIndex);
      setCurrentItems(newItems);
      setPage(nextPage);
      setHasMore(newItems.length < filteredItems.length);
    }, 500);
  };

  const handleUpdateCartQuantity = async (
    cartId: number,
    menuId: number,
    newQuantity: number,
    priceSum: number
  ) => {
    const cartItem = {
      id: cartId,
      menuId: menuId,
      quantity: newQuantity,
      price_sum: priceSum,
    };

    const callBlack = await updateMenuInCart(cartItem);
    if (callBlack.success) {
      router.refresh();
    }
  };

  const handleRemoveFromCart = async (cartId: number, menuId: number) => {
    const cartItem = {
      id: cartId,
      menuId: menuId,
    };
    const callBlack = await deleteMenuInCart(cartItem);
    if (callBlack.success) {
      router.refresh();
    }
  };

  const handleConfirmOrder = async () => {
    try {
      if (relatedData.cartdatas.length === 0) {
        toast.warning("ไม่มีรายการในตะกร้า");
        return;
      }

      const result = await createOrder(relatedData.cartdatas);
      if (result.success) {
        await updateCartStatusNEW(relatedData.cartdatas);
        await updateTableStatus(relatedData.cartdatas, "OCCUPIED");
        toast.success("ส่งออเดอร์สำเร็จ!", {
          position: "bottom-center",
          className: "responsive-toast",
        });
        setIsCartOpen(false);
        router.refresh();
      } else {
        toast.error("ผิดพลาด!", {
          position: "bottom-center",
          className: "responsive-toast",
        });
      }
    } catch (error) {
      toast.error("ติดต่อพนักงาน!", {
        position: "bottom-center",
        className: "responsive-toast",
      });
    }
  };

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = initialItems
      .filter((item: any) => {
        if (filterCategory === "All") return true;
        return item.category.categoryName === filterCategory;
      })
      .filter((item: any) => {
        return (
          item.menuName?.toLowerCase().includes(lowercasedFilter) ||
          item.description?.toLowerCase().includes(lowercasedFilter)
        );
      });

    setFilteredItems(filteredData);
  }, [searchTerm, filterCategory, initialItems]);

  useEffect(() => {
    setPage(1);
    const newItems = filteredItems.slice(0, itemsPerPage);
    setCurrentItems(newItems);
    setHasMore(filteredItems.length > itemsPerPage);
  }, [filteredItems]);

  useEffect(() => {
    if (tableNumber !== 0 && relatedData.cartdatas) {
      const itemsForThisTable = relatedData.cartdatas.filter(
        (item) => item.tableId === tableNumber
      );
      setCartCount(itemsForThisTable.length);
    } else {
      setCartCount(relatedData.cartdatas.length);
    }
  }, [tableNumber, relatedData.cartdatas]);

  return (
    <div className="bg-muted/20 min-h-screen pb-24 relative">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="animate-spin h-10 w-10 text-primary mb-3" />
          </div>
        }
      >
        <OrderHandler setTableNumber={setTableNumber} />
      </Suspense>

      <div className="relative">
        <div className="h-40 w-full bg-primary relative overflow-hidden">
          <Image
            src="/banner_posx_menu.jpeg"
            alt="Banner Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40 opacity-90 z-10" />

          <div className="absolute top-4 right-4 text-primary-foreground text-xs opacity-70 z-20"></div>
        </div>

        <div className="relative -mt-16 mx-4 mb-4 z-10">
          <div className="bg-card text-card-foreground rounded-2xl shadow-lg p-4 flex flex-col gap-3 border border-border/50">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-primary overflow-hidden flex-shrink-0 bg-muted relative">
                <Image
                  src="/icon.png"
                  alt="Shop Logo"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <h1 className="font-bold text-lg text-foreground">POSX</h1>
                <p className="text-muted-foreground text-sm">
                  โต๊ะ:{" "}
                  <span className="font-bold text-primary text-lg">
                    {tableNumber || "-"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur shadow-sm border-b border-border">
        <div className="flex overflow-x-auto hide-scrollbar py-3 px-4 gap-2">
          {categories.map((cat: any) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                filterCategory === cat
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat === "All" ? "ทั้งหมด" : cat}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4 min-h-[50vh]">
        <h2 className="text-xl font-bold text-foreground mb-4 px-1">
          {filterCategory === "All" ? "เมนูแนะนำ" : filterCategory}
        </h2>

        {currentItems.length > 0 ? (
          <InfiniteScroll
            dataLength={currentItems.length}
            next={loadMoreItems}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center items-center my-4">
                <Loader2 className="animate-spin h-6 w-6 text-primary" />
              </div>
            }
            className="flex flex-col gap-4"
          >
            {currentItems.map((item: any, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-card text-card-foreground p-3 rounded-xl shadow-sm border border-border flex gap-4 items-center active:scale-[0.98] transition-transform"
                onClick={() => handelOpendetail(item.id)}
              >
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {item.img ? (
                    <Image
                      src={item.img}
                      alt={item.menuName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100px, 150px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                      <span className="text-xs">No Image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between h-24 py-1">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-2 leading-tight mb-1">
                      {item.menuName}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.description || "รายละเอียดสินค้าเพิ่มเติม"}
                    </p>
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    <span className="font-bold text-foreground text-lg">
                      {item.price_sale > 0
                        ? `${item.price_sale} ${item.unitPrice.label}`
                        : `0 ${item.unitPrice.label}`}
                    </span>

                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                      <Plus size={18} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </InfiniteScroll>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <SearchX className="w-12 h-12 mb-2 opacity-50" />
            <p>ไม่พบรายการสินค้า</p>
          </div>
        )}
      </main>

      {/* --- Bottom Navigation --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 px-6 flex justify-between items-center z-40 shadow-lg">
        <button
          className={`flex flex-col items-center justify-center gap-1 w-1/3 relative transition-colors ${
            cartCount > 0
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setIsCartOpen(true)}
        >
          <div className="relative">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">ตะกร้า</span>
        </button>

        <button
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary w-1/3"
          onClick={() => setIsHistoryOpen(true)}
        >
          <ClipboardList size={24} />
          <span className="text-[10px] font-medium">รายการ</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary w-1/3">
          <Bell size={24} />
          <span className="text-[10px] font-medium">เรียกพนักงาน</span>
        </button>
      </div>

      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent
          side="bottom"
          className="h-[90vh] rounded-t-2xl px-0 flex flex-col bg-background"
        >
          <SheetHeader className="px-6 pb-4 border-b border-border">
            <SheetTitle className="text-center text-lg font-bold text-foreground">
              ตะกร้าสินค้า ({cartCount})
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            {relatedData.cartdatas.length > 0 ? (
              <div className="flex flex-col gap-4 pb-20">
                {relatedData.cartdatas.map((item) => {
                  const menuItem = initialItems.find(
                    (m: any) => m.id === item.menuId
                  );
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 items-start bg-card p-2 rounded-lg border border-border/50"
                    >
                      {/* ส่วนแสดงรูปภาพ */}
                      <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 relative overflow-hidden">
                        {menuItem?.img ? (
                          <Image
                            src={menuItem.img}
                            alt={menuItem.menuName || "Menu Image"}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                            IMG
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                            {menuItem.menuName ||
                              menuItem?.menuName ||
                              "Unknown Item"}
                          </h4>
                          <button
                            onClick={() =>
                              handleRemoveFromCart(item.id, item.menuId)
                            }
                            className="text-muted-foreground hover:text-destructive p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-primary">
                            {item.price_sum} {menuItem.unitPrice.label}
                          </span>

                          {/* Quantity Control */}
                          <div className="flex items-center gap-3 bg-muted rounded-lg px-2 py-1">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  const newQty = item.quantity - 1;
                                  const unitPrice =
                                    item.price_sum / item.quantity;
                                  handleUpdateCartQuantity(
                                    item.id,
                                    item.menuId,
                                    newQty,
                                    unitPrice * newQty
                                  );
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background rounded shadow-sm text-foreground active:scale-95"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold min-w-[20px] text-center text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                const newQty = item.quantity + 1;
                                const unitPrice =
                                  item.price_sum / item.quantity;
                                handleUpdateCartQuantity(
                                  item.id,
                                  item.menuId,
                                  newQty,
                                  unitPrice * newQty
                                );
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-primary rounded shadow-sm text-primary-foreground active:scale-95"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <ShoppingCart size={48} className="opacity-20" />
                <p>ยังไม่มีสินค้าในตะกร้า</p>
              </div>
            )}
          </ScrollArea>

          <div className="p-6 border-t border-border bg-background safe-area-bottom">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground">ยอดรวมทั้งหมด</span>
              <span className="text-xl font-bold text-foreground">
                {totalPrice} {initialItems[0].unitPrice.label}
              </span>
            </div>
            <Button
              className="w-full h-12 text-lg font-bold"
              onClick={handleConfirmOrder}
              disabled={relatedData.cartdatas.length === 0}
            >
              ยืนยันการสั่งอาหาร
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <MenuOrderHistorySheet
        isOpen={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />

      <AnimatePresence>
        {isOpenDetail && (
          <MenuOrderDetailDialog
            stateDialog={setIsOpenDetail}
            open={isOpenDetail}
            menuDetail={itemnDetail}
            tableNumber={tableNumber}
            dataTable={relatedData.tabledatas}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuOrderPage;
