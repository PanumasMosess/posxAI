import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTitle, // 1. Import SheetTitle เพิ่มเข้ามา
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowUpDown} from "lucide-react";
import Image from "next/image";

// Mock Data ... (เหมือนเดิม)
const MOCK_ORDER_HISTORY = [
  {
    round: 1,
    time: "เมื่อสักครู่",
    items: [
      {
        id: 101,
        name: "เนื้อ Brisket ออสเตรเลีย (ถาดใหญ่)",
        price: 0,
        qty: 1,
        status: "ออเดอร์เข้าระบบแล้ว",
        image: null,
      },
      // ... items อื่นๆ
      {
        id: 105,
        name: "สันคอหมูสไลด์ (ถาดกลาง)",
        price: 0,
        qty: 1,
        status: "ออเดอร์เข้าระบบแล้ว",
        image: null,
      },
    ],
  },
];

interface MenuOrderHistorySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MenuOrderHistorySheet = ({
  isOpen,
  onOpenChange,
}: MenuOrderHistorySheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[100dvh] sm:h-[90vh] rounded-t-2xl px-0 flex flex-col bg-background"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <SheetTitle className="text-lg font-bold">รายการที่สั่ง</SheetTitle>

          <div className="flex items-center gap-2 pr-8">
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowUpDown size={14} /> ล่าสุด
            </button>
          </div>
        </div>

        {/* Content List */}
        <ScrollArea className="flex-1 bg-muted/20">
          <div className="p-4 flex flex-col gap-6">
            {MOCK_ORDER_HISTORY.map((group) => (
              <div key={group.round}>
                {/* Round Header */}
                <div className="flex items-center gap-3 mb-3 px-1">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {group.round}
                  </span>
                  <span className="font-semibold text-sm">
                    รอบที่ {group.round}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {group.time}
                  </span>
                </div>

                {/* Items in Round */}
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-card rounded-lg border border-border p-3 flex gap-3 shadow-sm"
                    >
                      {/* Item Image */}
                      <div className="w-12 h-16 bg-muted rounded flex-shrink-0 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
                          IMG
                        </div>
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-foreground line-clamp-2 w-[80%]">
                            {item.name}
                          </h4>
                          <span className="text-sm font-bold text-foreground">
                            {item.price} บาท
                          </span>
                        </div>

                        <div className="flex justify-between items-end mt-2">
                          <span className="text-xs text-orange-500 font-medium bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.5 rounded">
                            {item.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.qty} x {item.price} บาท
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="bg-background border-t border-border p-4 safe-area-bottom">
          <div className="flex justify-between items-center mb-4 text-sm">
            <span className="text-muted-foreground">
              ยอดรวม (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)
            </span>
            <span className="font-bold text-lg">0 บาท</span>
          </div>
          <SheetClose asChild>
            <Button
              variant="destructive"
              className="w-full h-12 text-lg font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              ปิด
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};
