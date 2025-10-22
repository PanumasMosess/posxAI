import { ArrowLeftRight, ClipboardMinus, Cog } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Data_table_stock } from "../stocks/tables/data-table-stock";
import { StockColumns, Stocks } from "../stocks/tables/column_stock";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Data_table_formulat_set } from "../stocks/tables/data-table-formular-set";
import {
  FormularColumns,
  StocksFormular,
} from "../stocks/tables/column_formular_set";
import { Button } from "../ui/button";
import {
  crearteFormularStock,
  deleteFormularStock,
  updateFormularStock,
} from "@/lib/actions/actionStocks";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Data_table_formulat_running } from "../stocks/tables/data-table-formular-running";
import { FormularRunningColumns } from "../stocks/tables/column_formular_running";
import { StocksFormularRunning } from "@/lib/type";
import { Card, CardContent } from "../ui/card";
import StockMenuCard from "../stocks/StockMenuCard";

type FormularData = {
  id: number;
  menuId: number;
  stockId: number;
  pcs_update: number;
  menu: {
    menuName: string;
  };
  stock: {
    productName: string;
  };
};

const StockFormularManament = ({
  relatedData,
  currentUserId,
}: {
  relatedData?: any;
  currentUserId: number;
}) => {
  const router = useRouter();
  const { stocks, formular } = relatedData;
  const typedFormular = formular as FormularData[];

  const stocksFormularRunning: StocksFormularRunning[] = typedFormular.map(
    (item) => ({
      id: item.id,
      menuName: item.menu.menuName,
      productName: item.stock.productName,
      pcs_update: item.pcs_update || 0,
      menuId: item.menuId,
      stockId: item.stockId,
    })
  );

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

  const handleUpdatePCSFormularRunning = async (
    id: number,
    newValue: number
  ) => {
    const data = {
      id: id,
      pcs_update: newValue,
    };
    const update_status = await updateFormularStock(data);
    if (update_status.success) {
      router.refresh();
    } else {
      throw new Error("ไม่สามารถอัปเดตฐานข้อมูลได้");
    }
  };

  const handleRemoveFormularRunning = async (data: any) => {
    data.status = "CANCEL_FORMULAR";
    const delete_status = await deleteFormularStock(data);

    if (delete_status.success) {
      toast.success("ยกเลิกสำเร็จ!");
      router.refresh();
    } else {
      throw new Error("ไม่สามารถอัปเดตฐานข้อมูลได้");
    }
  };

  const columns_stock = StockColumns({});
  const formular_stock = FormularColumns({ handleUpdatePCS, handleRemoveItem });
  const formular_stock_running = FormularRunningColumns({
    handleUpdatePCSFormularRunning,
    handleRemoveFormularRunning,
  });

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
      <div className="lg:col-span-2 flex items-center mb-1 justify-center">
        <ArrowLeftRight className="h-4 w-4  mr-2" />
        <h3 className="text-lg font-semibold">เพิ่มสูตรตัดสินค้าในคลัง</h3>
        <ArrowLeftRight className="h-4 w-4 ml-2" />
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-center justify-between gap-2 flex-wrap mt-1">
          <div className="lg:col-span-2 flex items-center mb-1">
            <Cog className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">จัดการสินค้าที่ขาย</h3>
          </div>
          <StockMenuCard
            menuItems={relatedData?.menu || []}
            selectedMenu={selectedMenu}
            onSelectMenu={setSelectedMenu}
          />
        </div>
        <p className="text-sm text-muted-foreground mb-2 mt-2">
          *คลิกที่เมนูด้านบน แล้วกดเลือกสินค้าที่จะตัดที่ตารางด้านขวา
        </p>
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
      <div className="bg-muted p-4 rounded-lg">
        <Data_table_stock
          columns={columns_stock}
          data={sourceItems}
          onRowClick={handleClickToMenu}
        />
      </div>

      <div className="lg:col-span-2 flex items-center mb-1 mt-2 ">
        <ClipboardMinus className="h-6 w-6 mr-2" />
        <h3 className="text-lg font-semibold">รายการสูตรที่ถูกเพิ่ม</h3>
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <Data_table_formulat_running
          columns={formular_stock_running}
          data={stocksFormularRunning}
        />
      </div>
    </>
  );
};

export default StockFormularManament;
