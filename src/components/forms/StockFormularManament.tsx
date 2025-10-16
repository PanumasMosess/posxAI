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
import { useActionState, useEffect, useState, useTransition } from "react";
import { Data_table_formulat_set } from "../stocks/tables/data-table-formular-set";
import {
  FormularColumns,
  StocksFormular,
} from "../stocks/tables/column_formular_set";
import { Button } from "../ui/button";
import { crearteFormularStock } from "@/lib/actions/actionStocks";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const StockFormularManament = ({
  relatedData,
  currentUserId,
}: {
  relatedData?: any;
  currentUserId: number;
}) => {
  const router = useRouter();
  const { menu, stocks } = relatedData;
  const [sourceItems, setSourceItems] = useState<any[]>(stocks);
  const [destinationItems, setDestinationItems] = useState<any[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [stateFormular, formAction] = useActionState(crearteFormularStock, {
    success: false,
    error: false,
  });

  const handleClickToMenu = (stocks: Stocks) => {
    setDestinationItems((prev) => [...prev, stocks]);
    setSourceItems((prev) => prev.filter((item) => item.id !== stocks.id));
  };

  const handleRemoveItem = (itemToRemove: StocksFormular) => {
    setDestinationItems((prev) =>
      prev.filter((item) => item.id !== itemToRemove.id)
    );
    setSourceItems((prev) => {
      const updatedSourceItems = [...prev, itemToRemove];
      return updatedSourceItems.map((item) => ({
        ...item,
        pcs_formular: "",
      }));
    });
  };

  const handleUpdatePCS = (id: number, newValue: number) => {
    setDestinationItems((oldData) =>
      oldData.map((row) => {
        if (row.id === id) {
          return { ...row, pcs_formular: newValue };
        }
        return row;
      })
    );
  };

  const handleSaveFormular = async () => {
    const simplifiedItems = destinationItems.map((item) => ({
      pcs_update: item.pcs_formular,
      status: "RUN_FORMULAR",
      stockId: item.id,
      menuId: parseInt(selectedMenu || "0"),
    }));

    const payload = {
      items: simplifiedItems,
    };

    startTransition(() => {
      formAction(payload);
    });
  };

  const columns_stock = StockColumns({});
  const formular_stock = FormularColumns({ handleUpdatePCS, handleRemoveItem });

  useEffect(() => {
    if (stateFormular.success) {
      toast.success(`สูตรตัดสินค่าในคลังถูกเพิ่ม`);
      setDestinationItems([]);
      setSourceItems(stocks);
      setSelectedMenu(null);
      router.refresh();
    }
  }, [stateFormular]);

  return (
    <>
      <div className="lg:col-span-2 flex items-center mb-1">
        <ClipboardMinus className="h-6 w-6 mr-2" />
        <h3 className="text-lg font-semibold">เพิ่มสูตรตัดสินค้าในคลัง</h3>
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <Data_table_stock
          columns={columns_stock}
          data={sourceItems}
          onRowClick={handleClickToMenu}
        />
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <Select
            value={selectedMenu || ""}
            onValueChange={(value) => {
              setSelectedMenu(value === "ALL" ? null : value);
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="เลือกเมนู" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">เลือกเมนู</SelectItem>
              {relatedData?.menu.map((menu: any) => (
                <SelectItem key={menu.id} value={menu.id}>
                  {menu.menuName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="bg-primary-foreground p-4 rounded-lg mt-4">
          <Data_table_formulat_set
            columns={formular_stock}
            data={destinationItems}
            // onRowClick={handleRemoveItem}
          />

          <div className="flex justify-end mt-4">
            {destinationItems.length > 0 && selectedMenu && (
              <Button onClick={handleSaveFormular}>บันทึกข้อมูล</Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StockFormularManament;
