"use client";

import { useSession } from "next-auth/react";
import { Layers, Truck } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetTrigger } from "../ui/sheet";
import { useEffect, useState } from "react";
import StockFormCategories from "../forms/StockFormCategories";
import StockFormSupplier from "../forms/StockFormSupplier";

import { Data_table_categories } from "./tables/data-table-categories";
import { Categories, CategoriesColumns } from "./tables/column_categories";

import { Data_table_suppliers } from "./tables/data-table-supplier";
import { Supplier, SupplierColumns } from "./tables/culumn_supplier";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { deleteCategories, deleteSupplier } from "@/lib/actions/actionStocks";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import StockFormularManament from "../forms/StockFormularManament";

interface StockPageFormularProps {
  initialItems: any[];
  relatedData: {
    categories: { id: number; categoryName: string }[];
    suppliers: { id: number; supplierName: string }[];
    menu: { id: number; menuName: string }[];
  };
}

const StockPageFormular = ({
  initialItems,
  relatedData,
}: StockPageFormularProps) => {
  const session = useSession();
  const id_user = session.data?.user.id || "1";

  //state ปุ่ม เปิดหน้าเพิ่มข้อมูล แก้ไขข้อมูล
  const [openSheetCata, setOpenSheetCata] = useState(false);
  const [openSheetSupply, setOpenSheetSupply] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [openSheetCataUpdate, setOpenSheetCataUpdate] = useState(false);
  const [openSheetSupplyUpdate, setOpenSheetSupplyUpdate] = useState(false);
  const [editingItemCat, setEditingItemCat] = useState<Categories | null>(null);
  const [deleteItemCat, setDeleteItemCat] = useState<Categories | null>(null);
  const [editingItemSup, setEditingItemSup] = useState<Supplier | null>(null);
  const [deleteItemSup, setDeleteItemSup] = useState<Supplier | null>(null);

  const router = useRouter();

  const handleEditCat = (category: Categories) => {
    setEditingItemCat(category);
    setOpenSheetCataUpdate(true);
  };

  const handleDeleteCat = (category: Categories) => {
    setDeleteItemCat(category);
  };

  const handleDeleteCatConfirm = async (data: any) => {
    const delete_status = await deleteCategories(data);

    if (delete_status.success) {
      toast.success("ยกเลิกสำเร็จ!");
      router.refresh();
    } else {
      throw new Error("ไม่สามารถอัปเดตฐานข้อมูลได้");
    }
  };

  const handleEditSup = (supplier: Supplier) => {
    setEditingItemSup(supplier);
    setOpenSheetSupplyUpdate(true);
  };

  const handleDeleteSup = (supplier: Supplier) => {
    setDeleteItemSup(supplier);
  };

  const handleDeleteSupConfirm = async (data: any) => {
    const delete_status = await deleteSupplier(data);

    if (delete_status.success) {
      toast.success("ยกเลิกสำเร็จ!");
      router.refresh();
    } else {
      throw new Error("ไม่สามารถอัปเดตฐานข้อมูลได้");
    }
  };

  const columns_categories = CategoriesColumns({
    handleEditCat,
    handleDeleteCat,
  });
  const columns_supplier = SupplierColumns({ handleEditSup, handleDeleteSup });

  useEffect(() => {
    if (filterCategory === "All") {
      //   setDisplayItems(initialItems);
    } else {
      const filtered = initialItems.filter(
        (item) => item.category.categoryName === filterCategory
      );
      //   setDisplayItems(filtered);
    }
    // setCurrentPage(1);
  }, [filterCategory, initialItems]);

  return (
    <div className="">
      <div className="mt-4 flex flex-col gap-4">
        <div className="w-full xl:w-3/3 space-y-6">
          <div className="bg-primary-foreground p-4 rounded-lg flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {/* <Select
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
              </Select> */}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Sheet open={openSheetCata} onOpenChange={setOpenSheetCata}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Layers /> เพิ่มหมวดหมู่
                  </Button>
                </SheetTrigger>
                <StockFormCategories
                  type={"create"}
                  relatedData={relatedData}
                  currentUserId={parseInt(id_user)}
                  stateSheet={setOpenSheetCata}
                  stateForm={openSheetCata}
                />
              </Sheet>
              <Sheet open={openSheetSupply} onOpenChange={setOpenSheetSupply}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Truck /> เพิ่มซัพพลายเออร์
                  </Button>
                </SheetTrigger>
                <StockFormSupplier
                  type={"create"}
                  relatedData={relatedData}
                  currentUserId={parseInt(id_user)}
                  stateSheet={setOpenSheetSupply}
                  stateForm={openSheetSupply}
                />
              </Sheet>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-primary-foreground p-4 rounded-lg">
          <div className="flex items-center">
            <Layers className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">หมวดหมู่</h3>
          </div>
          <AlertDialog
            open={!!deleteItemCat}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setDeleteItemCat(null);
              }
            }}
          >
            <Data_table_categories
              columns={columns_categories}
              data={relatedData.categories}
            />

            <Sheet
              open={openSheetCataUpdate}
              onOpenChange={setOpenSheetCataUpdate}
            >
              <StockFormCategories
                type={"update"}
                relatedData={relatedData}
                currentUserId={parseInt(id_user)}
                data={editingItemCat}
                stateSheet={setOpenSheetCataUpdate}
                stateForm={openSheetCataUpdate}
              />
            </Sheet>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                <AlertDialogDescription>
                  การกระทำนี้ไม่สามารถย้อนกลับได้ มันจะเปลี่ยนสถานะของ "
                  {deleteItemCat?.categoryName}" เป็น "ยกเลิกหมวกหมู่" อย่างถาวร
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteCatConfirm(deleteItemCat)}
                >
                  ยืนยันการลบ
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="bg-primary-foreground p-4 rounded-lg">
          <div className="flex items-center">
            <Truck className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">ซัพพลายเออร์</h3>
          </div>
          <AlertDialog
            open={!!deleteItemSup}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setDeleteItemSup(null);
              }
            }}
          >
            <Data_table_suppliers
              columns={columns_supplier}
              data={relatedData.suppliers}
            />

            <Sheet
              open={openSheetSupplyUpdate}
              onOpenChange={setOpenSheetSupplyUpdate}
            >
              <StockFormSupplier
                type={"update"}
                relatedData={relatedData}
                data={editingItemSup}
                currentUserId={parseInt(id_user)}
                stateSheet={setOpenSheetSupplyUpdate}
                stateForm={openSheetSupplyUpdate}
              />
            </Sheet>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                <AlertDialogDescription>
                  การกระทำนี้ไม่สามารถย้อนกลับได้ มันจะเปลี่ยนสถานะของ "
                  {deleteItemSup?.supplierName}" เป็น "ยกเลิกซัพพลายเออร์"
                  อย่างถาวร
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteSupConfirm(deleteItemSup)}
                >
                  ยืนยันการลบ
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 bg-primary-foreground p-4 rounded-lg">
        <StockFormularManament
          relatedData={relatedData}
          currentUserId={parseInt(id_user)}
        />
      </div>
    </div>
  );
};

export default StockPageFormular;
