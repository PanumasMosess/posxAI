import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { MenuOrderDetailProps } from "@/lib/type";
import Image from "next/image";
import { useState } from "react";
import { Loader2, Minus, Plus, X } from "lucide-react";

const MenuOrderDetailDialog = ({
  stateDialog,
  open,
  menuDetail,
}: MenuOrderDetailProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const onClose = () => {
    stateDialog(false);
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
        onClick={(e) => e.stopPropagation()} // ป้องกันคลิกใน card แล้วปิด
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
              <p className="text-sm text-muted-foreground text-center line-clamp-2">
                {menuDetail?.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <span className="text-xl font-bold text-primary">
                  {menuDetail?.price_sale?.toLocaleString()}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(prev => prev + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button className="w-full h-12 text-lg font-semibold mt-6" onClick={onClose}>
                เพิ่ม {quantity} รายการ - {(menuDetail?.price_sale || 0) * quantity}.00
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MenuOrderDetailDialog;
