import { Dispatch, SetStateAction, useEffect } from "react";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

const MunuDetailForm = ({
  stateSheet,
  item,
}: {
  stateSheet: Dispatch<SetStateAction<boolean>>;
  item: any;
}) => {
  const handleDetailCat = () => {
    stateSheet(true);
  };
  return (
    <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 bg-background text-foreground">
      <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50 relative">
        <SheetTitle className="text-2xl font-bold">{item?.menuName}</SheetTitle>
        <SheetDescription className="text-muted-foreground">
          {item?.description || item?.menuName}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg border border-border/50">
          <Image
            src={item?.img || "/placeholder.png"}
            alt={item?.menuName}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-base">
            <span className="text-muted-foreground">หมวดหมู่</span>
            <span className="font-medium text-foreground">
              {item?.category?.categoryName || "ไม่ระบุ"}
            </span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="text-muted-foreground">ราคาปัจจุบัน</span>
            <span className="font-semibold text-foreground">
              {item?.price_sale.toFixed(2)} / {item?.unit}
            </span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="text-muted-foreground">ราคาต้นทุน</span>
            <span className="font-semibold text-foreground">
              {item?.price_cost.toFixed(2)} / {item?.unit}
            </span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="text-muted-foreground">สถานะ</span>
            <span
              className={`font-semibold ${
                item?.status === "READY_TO_SELL"
                  ? "text-green-500"
                  : "text-red-600"
              }`}
            >
              {item?.status === "READY_TO_SELL" ? "พร้อมขาย" : item?.status}
            </span>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button variant="outline" className="flex-1" onClick={() => {}}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" className="flex-1" onClick={() => {}}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </SheetContent>
  );
};

export default MunuDetailForm;
