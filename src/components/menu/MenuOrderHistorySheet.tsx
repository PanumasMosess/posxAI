import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { MenuOrderHistorySheetProps, OrderHistoryList } from "@/lib/type";

export const MenuOrderHistorySheet = ({
  isOpen,
  onOpenChange,
  relatedData,
  tableNumber,
}: MenuOrderHistorySheetProps) => {
  const { historyData, grandTotal, currency } = useMemo(() => {
    const rawOrders: OrderHistoryList[] = relatedData?.orders || [];

    const filteredOrders = rawOrders.filter((order) => {
      if (tableNumber === 0) return true;
      return order.tableId === tableNumber;
    });

    const groups: Record<string, { time: Date | string; items: any[] }> = {};
    let total = 0;

    filteredOrders.forEach((order) => {
      total += order.quantity * order.price_pre_unit;

      const groupKey = new Date(order.createdAt).toISOString();

      if (!groups[groupKey]) {
        groups[groupKey] = {
          time: order.createdAt,
          items: [],
        };
      }

      groups[groupKey].items.push({
        id: order.id,
        name: order.menu.menuName,
        price: order.price_pre_unit,
        lable: order.menu.unitPrice?.label,
        qty: order.quantity,
        status: order.status,
        image: order.menu.img,
      });
    });

    const sortedGroups = Object.values(groups).sort(
      (a: any, b: any) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    const formattedData = sortedGroups.map((group, index) => {
      const dateObj = new Date(group.time);
      return {
        round: sortedGroups.length - index,
        time: dateObj.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        items: group.items,
      };
    });

    const foundCurrency =
      filteredOrders.length > 0
        ? filteredOrders[0].menu?.unitPrice?.label
        : "Bath";

    return {
      historyData: formattedData,
      grandTotal: total,
      currency: foundCurrency,
    };
  }, [relatedData, tableNumber]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[100dvh] sm:h-[90vh] rounded-t-2xl px-0 flex flex-col bg-background overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <SheetTitle className="text-lg font-bold">
            รายการที่สั่ง {tableNumber !== 0 && `(โต๊ะ ${tableNumber})`}
          </SheetTitle>

          <div className="flex items-center gap-2 pr-8">
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowUpDown size={14} /> ล่าสุด
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-hidden relative bg-muted/20">
          <ScrollArea className="h-full w-full">
            <div className="p-4 flex flex-col gap-6">
              {historyData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <span>ไม่มีรายการออเดอร์</span>
                </div>
              ) : (
                historyData.map((group, gIndex) => (
                  <div key={gIndex}>
                    <div className="flex items-center gap-3 mb-3 px-1">
                      <span className="font-semibold text-sm text-foreground">
                        รอบเวลา {group.time} น.
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {group.items.length} รายการ
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {group.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="bg-card rounded-lg border border-border p-3 flex gap-3 shadow-sm"
                        >
                          <div className="w-12 h-16 bg-muted rounded flex-shrink-0 relative overflow-hidden">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
                                IMG
                              </div>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-medium text-foreground line-clamp-2 w-[80%]">
                                {item.name}
                              </h4>
                              <span className="text-sm font-bold text-foreground">
                                {item.price.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex justify-between items-end mt-2">
                              <span className="text-xs text-orange-500 font-medium bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.5 rounded">
                                {item.status}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {item.qty} x {item.price.toLocaleString()}{" "}
                                {item.lable}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="bg-background border-t border-border p-4 safe-area-bottom shrink-0 z-10">
          <div className="flex justify-between items-center mb-4 text-sm">
            <span className="text-muted-foreground">
              ยอดรวม (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)
            </span>
            <span className="font-bold text-lg">
              {grandTotal.toLocaleString()} {currency}
            </span>
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
