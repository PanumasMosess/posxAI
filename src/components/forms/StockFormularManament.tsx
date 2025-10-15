import { ClipboardMinus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Data_table_stock } from "../stocks/tables/data-table-stock";
import { StockColumns, Stocks } from "../stocks/tables/column_stock";

const StockFormularManament = ({
  relatedData,
  currentUserId,
}: {
  relatedData?: any;
  currentUserId: number;
}) => {
  const { menu, stocks } = relatedData;
  const handleClickToMenu = (stocks: Stocks) => {
    console.log(stocks);
    
  };
  const columns_stock = StockColumns({});
  return (
    <>
      <div className="lg:col-span-2 flex items-center mb-1">
        <ClipboardMinus className="h-6 w-6 mr-2" />
        <h3 className="text-lg font-semibold">เพิ่มสูตรตัดสินค้าในคลัง</h3>
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <Data_table_stock
          columns={columns_stock}
          data={stocks}
          onRowClick={handleClickToMenu}
        />
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <Select
          // value={filterCategory}
          // onValueChange={(value) => setFilterCategory(value)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="เลือกเมนู" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">ทั้งหมด</SelectItem>
              {relatedData?.menu.map((menu: any) => (
                <SelectItem key={menu.id} value={menu.menuName}>
                  {menu.menuName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="bg-primary-foreground p-4 rounded-lg mt-4">
          กำลัง DEV 
        </div>
      </div>
    </>
  );
};

export default StockFormularManament;
