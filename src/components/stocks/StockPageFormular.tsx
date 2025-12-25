"use client";

import { Layers, ListPlus, Truck } from "lucide-react";
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
import { StockPageFormularProps } from "@/lib/type";
import ModifierGroupForm from "../forms/ModifierGroupForm";
import ModifierItemForm from "../forms/ModifierItemForm";
import {
  ModifierGroup,
  ModifierGroupColumns,
} from "./tables/column_modifiergroup";
import { Data_table_modifiergroup } from "./tables/data-table-modifiergroup";
import {
  deleteModifierGroup,
  deleteModifierItem,
} from "@/lib/actions/actionSettings";
import { Data_table_modifieritemgroup } from "./tables/data-table-modifieritem";
import {
  ModifierItem,
  ModifierItemColumns,
} from "./tables/column_modifieritem";

const StockPageFormular = ({
  initialItems,
  relatedData,
  id_user,
  organizationId,
}: StockPageFormularProps) => {
  //state ปุ่ม เปิดหน้าเพิ่มข้อมูล แก้ไขข้อมูล
  const [openSheetCata, setOpenSheetCata] = useState(false);
  const [openSheetSupply, setOpenSheetSupply] = useState(false);
  const [openGroupSheet, setOpenGroupSheet] = useState(false);
  const [openItemSheet, setOpenItemSheet] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [openSheetCataUpdate, setOpenSheetCataUpdate] = useState(false);
  const [openSheetSupplyUpdate, setOpenSheetSupplyUpdate] = useState(false);
  const [editingItemCat, setEditingItemCat] = useState<Categories | null>(null);
  const [deleteItemCat, setDeleteItemCat] = useState<Categories | null>(null);
  const [editingItemSup, setEditingItemSup] = useState<Supplier | null>(null);
  const [deleteItemSup, setDeleteItemSup] = useState<Supplier | null>(null);
  const [openSheetGroupUpdate, setOpenSheetGroupUpdate] = useState(false);
  const [editingItemGroup, setEditingItemGroup] = useState<any | null>(null);
  const [deleteItemGroup, setDeleteItemGroup] = useState<any | null>(null);
  const [openSheetItemUpdate, setOpenSheetItemUpdate] = useState(false);
  const [editingItemItem, setEditingItemItem] = useState<any | null>(null);
  const [deleteItemItem, setDeleteItemItem] = useState<any | null>(null);

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

  const handleEditModifierGroup = (modifierGroup: ModifierGroup) => {
    setEditingItemGroup(modifierGroup);
    setOpenSheetGroupUpdate(true);
  };
  const handleDeleteModifierGroup = (data: any) => {
    setDeleteItemGroup(data);
  };

  const handelDeleteModifierGroupConfirm = async (data: any) => {
    const delete_status = await deleteModifierGroup(data);

    if (delete_status.success) {
      toast.success("ยกเลิกสำเร็จ!");
      router.refresh();
    } else {
      throw new Error("ไม่สามารถอัปเดตฐานข้อมูลได้");
    }
  };

  const handleEditItemModifierGroup = (modifierItemGroup: ModifierItem) => {
    setEditingItemItem(modifierItemGroup);
    setOpenSheetItemUpdate(true);
  };
  const handleDeleteItemModifierGroup = (data: any) => {
    setDeleteItemItem(data);
  };

  const handelDeleteItemModifierGroupConfirm = async (data: any) => {
    const delete_status = await deleteModifierItem(data);

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
  const columns_modifiergroup = ModifierGroupColumns({
    handleEdit: handleEditModifierGroup,
    handleDelete: handleDeleteModifierGroup,
  });
  const columns_modifieritemgroup = ModifierItemColumns({
    handleEdit: handleEditItemModifierGroup,
    handleDelete: handleDeleteItemModifierGroup,
  });

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
  }, [filterCategory, initialItems, organizationId]);

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
                  currentUserId={id_user}
                  organizationId={organizationId ?? 0}
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
                  currentUserId={id_user}
                  organizationId={organizationId ?? 0}
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
                currentUserId={id_user}
                organizationId={organizationId ?? 0}
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
                currentUserId={id_user}
                organizationId={organizationId ?? 0}
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
              <Sheet open={openGroupSheet} onOpenChange={setOpenGroupSheet}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Layers className="h-4 w-4" />
                    เพิ่มกลุ่มตัวเลือก
                  </Button>
                </SheetTrigger>
                <ModifierGroupForm
                  type={"create"}
                  currentUserId={id_user}
                  organizationId={organizationId ?? 0}
                  stateSheet={setOpenGroupSheet}
                  stateForm={openGroupSheet}
                />
              </Sheet>
              <Sheet open={openItemSheet} onOpenChange={setOpenItemSheet}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ListPlus className="h-4 w-4" />
                    เพิ่มตัวเลือกย่อย
                  </Button>
                </SheetTrigger>
                <ModifierItemForm
                  type={"create"}
                  relatedData={relatedData}
                  currentUserId={id_user}
                  organizationId={organizationId ?? 0}
                  stateSheet={setOpenItemSheet}
                  stateForm={openItemSheet}
                />
              </Sheet>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-primary-foreground p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <Layers className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">
              กลุ่มตัวเลือก (Modifier Groups)
            </h3>
          </div>

          <AlertDialog
            open={!!deleteItemGroup}
            onOpenChange={(isOpen) => !isOpen && setDeleteItemGroup(null)}
          >
            <div className="border rounded-md p-4 text-center text-sm text-muted-foreground">
              <Data_table_modifiergroup
                columns={columns_modifiergroup}
                data={relatedData.modifiergroup}
              />
            </div>
            <Sheet
              open={openSheetGroupUpdate}
              onOpenChange={setOpenSheetGroupUpdate}
            >
              <ModifierGroupForm
                type={"update"}
                data={editingItemGroup}
                currentUserId={id_user}
                organizationId={organizationId ?? 0}
                stateSheet={setOpenSheetGroupUpdate}
                stateForm={openSheetGroupUpdate}
              />
            </Sheet>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                <AlertDialogDescription>
                  การกระทำนี้ไม่สามารถย้อนกลับได้ จะลบกลุ่ม "
                  {deleteItemGroup?.name}" และตัวเลือกย่อยในกลุ่มนี้ทั้งหมด
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    handelDeleteModifierGroupConfirm(deleteItemGroup)
                  }
                >
                  ยืนยันการลบ
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="bg-primary-foreground p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <ListPlus className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">
              ตัวเลือกย่อย (Modifier Items)
            </h3>
          </div>

          <AlertDialog
            open={!!deleteItemItem}
            onOpenChange={(isOpen) => !isOpen && setDeleteItemItem(null)}
          >
            <div className="border rounded-md p-4 text-center text-sm text-muted-foreground">
              <Data_table_modifieritemgroup
                columns={columns_modifieritemgroup}
                data={relatedData.mofifieritemgroup}
              />
            </div>
            <Sheet
              open={openSheetItemUpdate}
              onOpenChange={setOpenSheetItemUpdate}
            >
              <ModifierItemForm
                type={"update"}
                data={editingItemItem}
                relatedData={relatedData}
                currentUserId={id_user}
                organizationId={organizationId ?? 0}
                stateSheet={setOpenSheetItemUpdate}
                stateForm={openSheetItemUpdate}
              />
            </Sheet>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                <AlertDialogDescription>
                  ต้องการลบตัวเลือก "{deleteItemItem?.name}" ใช่หรือไม่?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    handelDeleteItemModifierGroupConfirm(deleteItemItem)
                  }
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
          currentUserId={id_user}
          organizationId={organizationId ?? 1}
        />
      </div>
    </div>
  );
};

export default StockPageFormular;
