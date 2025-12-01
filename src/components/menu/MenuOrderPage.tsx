"use client";

import { CartItem, MenuPOSPageClientProps } from "@/lib/type";
import MenuOrderHeader from "./MenuOrderHeader";
import { MenuOrderCard } from "./MenuOrderCard";
import { useState, useEffect, Suspense } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2 } from "lucide-react";
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
const MenuOrderPage = ({
  relatedData,
  initialItems,
}: MenuPOSPageClientProps) => {
  const router = useRouter();
  const session = useSession();
  const organizationId = session.data?.user.organizationId;
  const itemsPerPage = 10;
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

  const handelOpendetail = async (id_for_detail: any) => {
    const itemToDetail = initialItems.find(
      (item: any) => item.id === id_for_detail
    );
    setItemnDetail(itemToDetail);
    setIsOpenDetail(true);
  };

  const handleAddToCart = async (cartItem: CartItem) => {
    // setCart((prevCart) => [...prevCart, cartItem]);
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
      // setCart((prevCart) =>
      //   prevCart.map((item) =>
      //     item.menuId === menuId
      //       ? {
      //           ...item,
      //           quantity: newQuantity,
      //           price_sum: priceSum,
      //         }
      //       : item
      //   )
      // );
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
      // setCart((prevCart) => {
      // const newCart = prevCart.filter((item) => item.menuId !== menuId);
      // setCartCount(newCart.length);
      // return newCart;
      // });
      router.refresh();
    }
  };

  const handleConfirmOrder = async () => {
    try {
      const result = await createOrder(relatedData.cartdatas);
      if (result.success) {
        await updateCartStatusNEW(relatedData.cartdatas);
        await updateTableStatus(relatedData.cartdatas, "OCCUPIED");
        toast.success("สำเร็จ!", {
          position: "bottom-center",
          className: "responsive-toast",
        });
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

  // useEffect(() => {
  //   if (relatedData.cartdatas) {
  //     setCart(relatedData.cartdatas);
  //   }
  // }, [relatedData.cartdatas]);

  return (
    <>
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin h-10 w-10 text-primary mb-3" />
              <p className="text-lg text-muted-foreground">กำลังโหลด...</p>
            </div>
          </div>
        }
      >
        <OrderHandler setTableNumber={setTableNumber} />
      </Suspense>
      <div className="min-h-screen text-black dark:text-white">
        <MenuOrderHeader
          carts={relatedData.cartdatas}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          relatedData={relatedData}
          cartCount={cartCount}
          menuItems={initialItems}
          onRemoveItem={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onConfirmOrder={handleConfirmOrder}
        />
        <main className="px-1.5 md:px-8 pt-15 pb-10 relative z-10">
          <h2 className="text-5xl text-center mb-10 tracking-wide">
            {filterCategory === "All" ? "เมนูทั้งหมด" : filterCategory}
          </h2>
          <InfiniteScroll
            dataLength={currentItems.length}
            next={loadMoreItems}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center items-center my-4 col-span-full mt-1.5">
                <Loader2 className="animate-spin h-8 w-8" />
              </div>
            }
            endMessage={
              <p className="text-center text-muted-foreground my-4 col-span-full">
                <b>คุณได้ดูสินค้าทั้งหมดแล้ว</b>
              </p>
            }
            className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6"
          >
            {currentItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: (index % itemsPerPage) * 0.1,
                }}
              >
                <MenuOrderCard
                  product={item}
                  handelOpendetail={handelOpendetail}
                />
              </motion.div>
            ))}
          </InfiniteScroll>
        </main>
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
    </>
  );
};

export default MenuOrderPage;
