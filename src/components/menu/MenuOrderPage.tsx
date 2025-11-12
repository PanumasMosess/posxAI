"use client";

import { MenuPOSPageClientProps } from "@/lib/type";
import MenuOrderHeader from "./MenuOrderHeader";
import { MenuOrderCard } from "./MenuOrderCard";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import MenuOrderDetailDialog from "./MenuOrderDetailDialog";
import OrderHandler from "../OrderHandler";

const MenuOrderPage = ({
  relatedData,
  initialItems,
}: MenuPOSPageClientProps) => {
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

  const handelOpendetail = async (id_for_detail: any) => {
    const itemToDetail = initialItems.find(
      (item: any) => item.id === id_for_detail
    );
    setItemnDetail(itemToDetail);
    setIsOpenDetail(true);
  };

  const loadMoreItems = () => {
    const nextPage = page + 1;
    const nextItemsIndex = nextPage * itemsPerPage;

    setTimeout(() => {
      const newItems = filteredItems.slice(0, nextItemsIndex);
      setPage(nextPage);
      setHasMore(newItems.length < filteredItems.length);
    }, 500);
  };

  return (
    <>
      <OrderHandler setTableNumber={setTableNumber} />
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        <MenuOrderHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          relatedData={relatedData}
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
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default MenuOrderPage;
