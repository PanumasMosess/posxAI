"use client";

import { useSession } from "next-auth/react";
import { ChartColumnStacked, Container, Layers, Truck } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetTrigger } from "../ui/sheet";
import { useEffect, useState } from "react";
import StockFormCategories from "../forms/StockFormCategories";
import StockFormSupplier from "../forms/StockFormSupplier";
import { Data_table_categories } from "./tables/data-table-categories";
import { CategoriesColumns } from "./tables/column_categories";
import { Data_table_suppliers } from "./tables/data-table-supplier";
import { SupplierColumns } from "./tables/culumn_supplier";

interface StockPageFormularProps {
  initialItems: any[];
  relatedData: {
    categories: { id: number; categoryName: string }[];
    suppliers: { id: number; supplierName: string }[];
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
          <div className="flex items-center mb-4">
            <Layers className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">หมวดหมู่</h3>
          </div>
          <Data_table_categories
            columns={CategoriesColumns}
            data={relatedData.categories}
          />
        </div>
        <div className="bg-primary-foreground p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <Truck className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">ซัพพลายเออร์</h3>
          </div>
          <Data_table_suppliers
            columns={SupplierColumns}
            data={relatedData.suppliers}
          />
        </div>
      </div>
    </div>
  );
};

export default StockPageFormular;
