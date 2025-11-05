"use client";

import { useEffect, useState } from "react";
import StockForm from "@/components/forms/StockForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CommandDialog } from "@/components/ui/command";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  DatabaseBackup,
  FileBox,
  Loader2,
  PackagePlus,
  PackageSearch,
  Settings,
  Trash2,
} from "lucide-react";
import StockFormBill from "../forms/StockFormBill";
import StockPageSearch from "./StockPageSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generationImage } from "@/lib/ai/geminiAI";
import { deleteStock, updateImageStock } from "@/lib/actions/actionStocks";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Input } from "../ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useSession } from "next-auth/react";
import { deleteFileS3 } from "@/lib/actions/actionIndex";
import { StockPageClientProps } from "@/lib/type";

const StockPageClient = ({
  initialItems,
  relatedData,
}: StockPageClientProps) => {
  const session = useSession();
  const id_user = session.data?.user.id || "1";
  //reload data
  const [loadingItemId, setLoadingItemId] = useState<number | null>(null);
  const router = useRouter();

  //state ปุ่ม เปิดหน้าเพิ่มข้อมูล แก้ไขข้อมูล
  const [openSheet, setOpenSheet] = useState(false);
  const [openSheetBill, setOpenSheetBill] = useState(false);
  const [openSheetUpdate, setOpenSheetUpdate] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  // State สำหรับจัดการการแสดงผลและการค้นหา
  const [displayItems, setDisplayItems] = useState(initialItems);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<any | null>(null);

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

  const handleGenerateImage = async (
    description: string,
    stock_id: number,
    create_id: number,
    img_link: string | null
  ) => {
    setLoadingItemId(stock_id);

    try {
      if (img_link) {
        const bucketName = "tvposx";
        const urlObject = new URL(img_link);
        const pathname = urlObject.pathname;
        const key = pathname.substring(`/${bucketName}/`.length);
        await deleteFileS3(key);
      }

      const result = await generationImage(description);

      if (result.success && result.answer) {
        const data = {
          id: stock_id,
          img_stock: result.answer,
          creator_id: create_id,
        };

        const update_status = await updateImageStock(data);

        if (update_status.success) {
          toast.success("สร้างและอัปเดตรูปภาพสำเร็จ!");
          setDisplayItems((prevItems) =>
            prevItems.map((item) =>
              item.id === stock_id ? update_status.data : item
            )
          );
        } else {
          throw new Error("ไม่สามารถอัปเดตฐานข้อมูลได้");
        }
      } else {
        throw new Error("ไม่สามารถสร้างรูปภาพได้: " + result.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleDeleteStockItem = async (
    id: number,
    img_link: string | null,
    create_id: number
  ) => {
    if (img_link) {
      const bucketName = "tvposx";
      const urlObject = new URL(img_link);
      const pathname = urlObject.pathname;
      const key = pathname.substring(`/${bucketName}/`.length);
      await deleteFileS3(key);
    }
    const data = {
      id: id,
      status: "CANCEL",
      creator_id: create_id,
    };

    const delete_status = await deleteStock(data);

    if (delete_status.success) {
      toast.success("ยกเลิกสำเร็จ!");
      router.refresh();
    } else {
      throw new Error("ไม่สามารถอัปเดตฐานข้อมูลได้");
    }
  };

  const handleOpenUpdateForm = async (item: any) => {
    setEditingItem(item);
    setOpenSheetUpdate(true);
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
        item.productName?.toLowerCase().includes(lowercasedFilter) ||
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenSearch(!openSearch)}
              >
                <Brain /> AI วิเคราห์ STOCK
              </Button>
              <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
                <StockPageSearch
                  stateSheet={setOpenSheet}
                  initialItems={initialItems}
                />
              </CommandDialog>
              <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PackagePlus /> เพิ่มรายการเอง
                  </Button>
                </SheetTrigger>
                <StockForm
                  type={"create"}
                  relatedData={relatedData}
                  currentUserId={parseInt(id_user)}
                  stateSheet={setOpenSheet}
                  stateForm={openSheet}
                />
              </Sheet>
              <Sheet open={openSheetBill} onOpenChange={setOpenSheetBill}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileBox /> เพิ่มรายการจากใบเสร็จ
                  </Button>
                </SheetTrigger>
                <StockFormBill
                  type={"create"}
                  relatedData={relatedData}
                  currentUserId={parseInt(id_user)}
                  stateSheet={setOpenSheetBill}
                  stateForm={openSheetBill}
                />
              </Sheet>
            </div>
          </div>
        </div>
        <div className="w-full h-full xl:w-3/3 space-y-6">
          <div className="relative bg-primary-foreground p-4 pb-16 rounded-lg grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {currentItems.length === 0 ? (
              <div className="col-span-full h-[40vh] flex flex-col items-center justify-center text-muted-foreground">
                <PackageSearch className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold">ไม่พบข้อมูล</h3>
                <p>ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่</p>
              </div>
            ) : (
              currentItems.map((item: any) => {
                const isLoading = loadingItemId === item.id;

                return (
                  <div className="w-full" key={item.id}>
                    <Card
                      className={`relative h-full flex flex-col transition-opacity ${
                        isLoading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-lg">
                          <Loader2 className="animate-spin text-primary h-12 w-12" />
                        </div>
                      )}

                      <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full z-20">
                        {item.category.categoryName}
                      </div>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 z-20"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenUpdateForm(item)}
                            >
                              <DatabaseBackup className="mr-2 h-4 w-4" /> UPDATE
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> DELETE
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <DropdownMenuItem
                              onClick={() =>
                                handleGenerateImage(
                                  item.description,
                                  item.id,
                                  parseInt(id_user),
                                  item.img
                                )
                              }
                            >
                              <Brain className="mr-2 h-4 w-4" />
                              AI IMAGE GENERATOR
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              คุณแน่ใจหรือไม่?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              การกระทำนี้ไม่สามารถย้อนกลับได้
                              มันจะเปลี่ยนสถานะของ "{item.productName}" เป็น
                              "ยกเลิกรายการ" และลบรูปภาพที่เกี่ยวข้องอย่างถาวร
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteStockItem(
                                  item.id,
                                  item.img,
                                  item.createdById
                                )
                              }
                            >
                              ยืนยันการลบ
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <CardHeader className="flex flex-col items-center pt-12">
                        <Avatar className="size-40 mb-4 ">
                          <AvatarImage
                            src={item.img || "default-image-url.png"}
                          />
                          <AvatarFallback>Loading...</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-center">
                          {item.productName}
                        </CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">ยอดคงเหลือ:</span>
                          <Badge>{item.quantity}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">ราคาปัจจุบัน:</span>
                          <Badge>{item.price}</Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                );
              })
            )}

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
          </div>
        </div>
        <Sheet open={openSheetUpdate} onOpenChange={setOpenSheetUpdate}>
          <StockForm
            type={"update"}
            relatedData={relatedData}
            currentUserId={parseInt(id_user)}
            data={editingItem}
            stateSheet={setOpenSheetUpdate}
            stateForm={openSheetUpdate}
          />
        </Sheet>
      </div>
    </div>
  );
};

export default StockPageClient;
