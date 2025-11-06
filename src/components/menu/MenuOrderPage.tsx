"use client";

import { MenuPOSPageClientProps } from "@/lib/type";
import MenuOrderHeader from "./MenuOrderHeader";
import { MenuOrderCard } from "./MenuOrderCard";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2 } from "lucide-react";

const MenuOrderPage = ({
  relatedData,
  initialItems,
}: MenuPOSPageClientProps) => {
  const itemsPerPage = 10;
  const [page, setPage] = useState(1);
  const [currentItems, setCurrentItems] = useState(
    initialItems.slice(0, itemsPerPage)
  );
 
  const [hasMore, setHasMore] = useState(initialItems.length > itemsPerPage);

  const loadMoreItems = () => {
    const nextPage = page + 1;
    const nextItemsIndex = nextPage * itemsPerPage;

    setTimeout(() => {
      const newItems = initialItems.slice(0, nextItemsIndex);
      setCurrentItems(newItems);
      setPage(nextPage);
      setHasMore(newItems.length < initialItems.length);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <MenuOrderHeader />
      <main className="px-4 md:px-8 pt-15 pb-10 relative z-10">
        <h2 className="text-5xl text-center mb-10 tracking-wide">
          สินค้าทั้งหมด
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
          {currentItems.map((initialItems) => (
            <MenuOrderCard product={initialItems} key={initialItems.id} />
          ))}
        </InfiniteScroll>
      </main>
    </div>
  );
};

export default MenuOrderPage;
