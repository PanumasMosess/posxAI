"use client";

import { useEffect, useState } from "react";
import MenuPOSItemCard from "./MenuPOSItemCard";
import { Sheet, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import {
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Utensils,
} from "lucide-react";
import MenuFormPOS from "../forms/MenuFormPOS";
import { useSession } from "next-auth/react";
import MunuDetailForm from "../forms/MunuDetailForm";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface MenuPOSPageClientProps {
  initialItems: any[];
  relatedData: {
    categories: { id: number; categoryName: string }[];
  };
}

const MenuPOSPage = ({ initialItems, relatedData }: MenuPOSPageClientProps) => {
  const session = useSession();
  const id_user = session.data?.user.id || "1";

  // initialItems
  const [menuItems, setOrderItems] = useState(initialItems);

  const [loadingItemId, setLoadingItemId] = useState<number | null>(null);
  const router = useRouter();

  const [openSheet, setOpenSheet] = useState(false);
  const [openSheetUpdate, setOpenSheetUpdate] = useState(false);
  const [openSheetDetail, setOpenSheetDetail] = useState(false);
  const [itemDetail, setItemDetail] = useState();
  const [displayItems, setDisplayItems] = useState(initialItems);

  // State สำหรับจัดการการแสดงผลและการค้นหา
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  //ทำ page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(displayItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayItems.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    if (filterCategory === "All") {
      setDisplayItems(initialItems);
    } else {
      const filtered = initialItems.filter(
        (item) => item.category.categoryName === filterCategory
      );
      setDisplayItems(filtered);
    }
    setCurrentPage(1);
  }, [filterCategory, initialItems]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = initialItems.filter((item: any) => {
      return (
        item.menuName?.toLowerCase().includes(lowercasedFilter) ||
        item.description?.toLowerCase().includes(lowercasedFilter) ||
        item.category?.categoryName?.toLowerCase().includes(lowercasedFilter)
      );
    });
    setDisplayItems(filteredData);
    setCurrentPage(1);
  }, [searchTerm, initialItems]);

  return (
    <div className="">
      {/* CONTAINER */}
      <div className="mt-4 flex flex-col gap-4">
        <div className="w-full xl:w-3/3 space-y-6">
          <div className="bg-primary-foreground p-4 rounded-lg flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={filterCategory}
                onValueChange={(value) => setFilterCategory(value)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="กรองตามหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">ทั้งหมด</SelectItem>
                  {relatedData?.categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.categoryName}>
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <PackageSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="ค้นหาสินค้า, รายละเอียด..."
                  className="pl-8 w-full sm:w-auto"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Utensils /> เพิ่มเมนู
                  </Button>
                </SheetTrigger>
                <MenuFormPOS
                  type={"create"}
                  relatedData={relatedData}
                  currentUserId={parseInt(id_user)}
                  stateSheet={setOpenSheet}
                  stateForm={openSheet}
                />
              </Sheet>

              <Sheet open={openSheetUpdate} onOpenChange={setOpenSheetUpdate}>
                <MenuFormPOS
                  type={"update"}
                  relatedData={relatedData}
                  currentUserId={parseInt(id_user)}
                  stateSheet={setOpenSheetUpdate}
                  stateForm={openSheetUpdate}
                />
              </Sheet>
            </div>
          </div>
        </div>
        <div className="w-full h-full xl:w-3/3 space-y-6">
          <div className="relative bg-primary-foreground p-4 pb-16 rounded-lg">
            {currentItems.length === 0 ? (
              <div className="h-[40vh] flex flex-col items-center justify-center text-muted-foreground">
                <PackageSearch className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold">ไม่พบข้อมูล</h3>
                <p>ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {currentItems.map((item: any) => {
                  const isLoading = loadingItemId === item.id;
                  return (
                    <MenuPOSItemCard
                      key={item.menuName}
                      item={item}
                      stateSheet={setOpenSheetDetail}
                    />
                  );
                })}
              </div>
            )}
            {totalPages > 1 && (
              <div className="absolute bottom-4 right-4 flex items-center justify-end space-x-2">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPOSPage;
