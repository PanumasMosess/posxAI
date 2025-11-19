import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { CartDetailItem, CartItem, MenuOrderDetailProps } from "@/lib/type";
import Image from "next/image";
import { useState } from "react";
import { Loader2, Minus, Plus, X, Table } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "react-toastify";

const MenuOrderDetailDialog = ({
  stateDialog,
  open,
  menuDetail,
  tableNumber,
  dataTable,
  onAddToCart,
}: MenuOrderDetailProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [tableNumberSelect, setTableNumberSelect] = useState(0);

  const onClose = () => {
    stateDialog(false);
  };

  const onTableChange = (val: any) => {
    setTableNumberSelect(parseInt(val));
  };

  const handleAddToCartClick = () => {
    if (tableNumber == 0 && tableNumberSelect == 0) {
      toast.error(`กรุณาเลือกโต๊ะ!`, {
        position: "bottom-center",
        className: "responsive-toast",      
      });
    } else {
      if (!menuDetail) return;
      const cartItem: CartItem = {
        id: menuDetail.id,
        menuId: menuDetail.id,
        tableId: tableNumberSelect,
        price_pre_unit: menuDetail.price_sale,
        quantity: quantity,
        price_sum: menuDetail.price_sale * quantity,
      };
      onAddToCart(cartItem);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-xl shadow-2xl bg-background text-foreground overflow-hidden md:max-w-md lg:max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-white bg-black/30 hover:bg-black/50 rounded-full"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-80 p-6">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
            <p className="mt-4 text-muted-foreground">กำลังโหลด...</p>
          </div>
        ) : (
          <>
            <div className="relative w-full h-56 sm:h-72 lg:h-80 overflow-hidden bg-muted flex items-center justify-center">
              <Image
                src={menuDetail?.img || "/placeholder.png"}
                alt={menuDetail?.menuName || "Menu Item"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-3xl font-extrabold text-center tracking-tight leading-tight">
                {menuDetail?.menuName}
              </h3>
              <p className="text-sm text-muted-foreground text-center ">
                {menuDetail?.description}
              </p>
              <span className="text-xl font-bold text-primary text-center line-clamp-2">
                {menuDetail?.price_sale?.toLocaleString()}{" "}
                {menuDetail.unitPrice.label.toLocaleString()}
              </span>

              <div
                className={`flex items-center pt-4 border-t border-border/60 ${
                  tableNumber == 0 ? "justify-between" : "justify-center"
                }`}
              >
                {tableNumber == 0 && (
                  <Select
                    // value={tableNumber || ""}
                    onValueChange={(value) =>
                      onTableChange(value === "ALL" ? null : value)
                    }
                  >
                    <SelectTrigger className="w-full p-2 mr-2 ml-2">
                      <Table className="h-4 w-4 mr-0.1" />
                      <SelectValue
                        placeholder="เลือกโต๊ะ"
                        className="flex-1 text-left"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTable?.map((table) => (
                        <SelectItem key={table.id} value={String(table.id)}>
                          {table.tableName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium w-8 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                className="w-full h-12 text-lg font-semibold mt-6"
                onClick={handleAddToCartClick}
              >
                เพิ่ม {quantity} รายการ -{" "}
                {((menuDetail?.price_sale || 0) * quantity).toLocaleString()}{" "}
                {menuDetail.unitPrice.label.toLocaleString()}
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MenuOrderDetailDialog;
