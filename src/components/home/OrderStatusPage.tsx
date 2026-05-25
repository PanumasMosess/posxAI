"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  PlayCircle,
  RefreshCcw,
  Ticket,
  ChefHat,
  UtensilsCrossed,
  Flame,
  BellRing,
  Printer,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusTableProps } from "@/lib/type";
import { updateStatusOrder } from "@/lib/actions/actionMenu";
import { toast } from "react-toastify";
import qz from "qz-tray";
import { printToKitchen } from "@/lib/printers/qz-service-kitchen";
import {
  getCertContentFromS3,
  signDataWithS3Key,
} from "@/lib/actions/actionIndex";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const getStatusColor = (status: string) => {
  switch (status) {
    case "NEW":
      return "bg-blue-500 text-white border-blue-200";
    case "COOKING":
      return "bg-orange-500 text-white border-orange-200";
    case "READY":
      return "bg-emerald-500 text-white border-emerald-200";
    default:
      return "bg-zinc-500 text-white border-zinc-200";
  }
};

const getStatusBorder = (status: string) => {
  switch (status) {
    case "NEW":
      return "border-l-4 border-l-blue-500";
    case "COOKING":
      return "border-l-4 border-l-orange-500 ring-1 ring-orange-500/20";
    case "READY":
      return "border-l-4 border-l-emerald-500";
    default:
      return "border-l-4 border-l-zinc-300";
  }
};

export default function OrderStatusPage({
  initialItems = [],
  userId,
  organizationId,
  relatedData,
}: StatusTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const [isAutoPrint, setIsAutoPrint] = useState(false);

  // บันทึกรหัสสินค้าที่พิมพ์เพื่อคุมเฉพาะออเดอร์ใหม่
  const printedItemsRef = useRef<Set<number>>(new Set());
  // 🟢 เพิ่มตัวแปรสำหรับป้องกันการเรียกฟังก์ชันซ้อนกันในเสี้ยววินาที (Race Condition Locker)
  const printingLockRef = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const savedAutoPrint =
      localStorage.getItem("kitchen_auto_print") === "true";
    setIsAutoPrint(savedAutoPrint);
  }, []);

  const initQZSecurity = () => {
    qz.security.setCertificatePromise((resolve: any, reject: any) => {
      getCertContentFromS3(`digital-certificate_${organizationId}.txt`)
        .then((res) => {
          if (res.success && res.data) resolve(res.data);
          else reject("Load Cert Failed");
        })
        .catch(reject);
    });

    qz.security.setSignaturePromise((toSign: string) => {
      return function (resolve: any, reject: any) {
        signDataWithS3Key(toSign, organizationId!.toString())
          .then((res) => {
            if (res.success && res.data) resolve(res.data);
            else reject("Sign Failed");
          })
          .catch(reject);
      };
    });
  };

  const rawOrders = relatedData?.orderRunning || [];
  const activeOrders = rawOrders.filter(
    (order) =>
      !["COMPLETED", "CANCELLED", "PAY_COMPLETED"].includes(order.status),
  );

  const prevOrderCountRef = useRef(activeOrders.length);
  useEffect(() => {
    if (activeOrders.length > prevOrderCountRef.current) {
      try {
        const audio = new Audio(
          "https://tvposx.sgp1.cdn.digitaloceanspaces.com/uploads/sound/notification-aero.mp3",
        );
        audio.play().catch((e) => console.error("Audio play failed", e));
      } catch (e) {
        console.error(e);
      }
    }
    prevOrderCountRef.current = activeOrders.length;
  }, [activeOrders]);

  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: any } = {};

    activeOrders.forEach((order) => {
      const groupKey = order.order_running_code || `${order.id}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          uniqueKey: groupKey,
          order_running_code: order.order_running_code,
          tableName: order.table?.tableName || "ไม่ระบุโต๊ะ",
          status: order.status,
          totalQuantity: 0,
          orderIds: [],
          items: [],
          firstCreatedAt: order.createdAt,
        };
      }

      if (!groups[groupKey].orderIds.includes(order.id)) {
        groups[groupKey].orderIds.push(order.id);
      }

      if (order.orderitems) {
        order.orderitems.forEach((item) => {
          const categoryData = (item.menu as any)?.category;
          const printerName =
            categoryData?.printerName || "ไม่ระบุเครื่องพิมพ์";
          const categoryName =
            categoryData?.name ||
            categoryData?.categoryName ||
            "ไม่ระบุหมวดหมู่";

          const modifierText = item.selectedModifiers
            ? item.selectedModifiers
                .map((m: any) => m.modifierItem.name)
                .join(", ")
            : "";

          groups[groupKey].totalQuantity += item.quantity;

          groups[groupKey].items.push({
            orderItemId: item.id,
            orderId: order.id,
            menuName: item.menu.menuName,
            quantity: item.quantity,
            category: categoryName,
            printerName: printerName,
            modifiersText: modifierText,
          });
        });
      }
    });

    return Object.values(groups).sort(
      (a: any, b: any) =>
        new Date(a.firstCreatedAt).getTime() -
        new Date(b.firstCreatedAt).getTime(),
    );
  }, [activeOrders]);

  // 🟢 ฟังก์ชันสั่งพิมพ์: ปรับปรุงระบบป้องกันพิมพ์เบิ้ลพิมพ์ซ้ำ 100%
  const handlePrint = async (
    group: any,
    isAutoPrintTrigger: boolean = false,
  ) => {
    // 🔒 1. ตรวจสอบ Lock ของออเดอร์นี้ ป้องกันเสี้ยววินาทีที่มีคำสั่งซ้อนวิ่งเข้ามา
    if (printingLockRef.current.has(group.uniqueKey)) {
      return;
    }

    // ตั้งค่าล็อกไอดีออเดอร์นี้ไว้ทันที
    printingLockRef.current.add(group.uniqueKey);

    // คัดกรองหารายการสินค้าที่ยังไม่เคยถูกสั่งพิมพ์ออกสเตชั่น
    const itemsToPrint = group.items.filter(
      (item: any) => !printedItemsRef.current.has(item.orderItemId),
    );

    // หากเป็นการกดพิมพ์เอง และไม่มีของใหม่เพิ่ม ให้ดึงรายการทั้งหมดขึ้นมาเพื่อพิมพ์ซ้ำ
    const finalItems =
      itemsToPrint.length === 0 && !isAutoPrintTrigger
        ? group.items
        : itemsToPrint;

    if (finalItems.length === 0) {
      printingLockRef.current.delete(group.uniqueKey);
      return;
    }

    // 🔒 2. มาร์คบันทึกรายการสินค้าเหล่านี้ลงประวัติพิมพ์แล้วทันที (ยึดโควตาไว้ก่อน ไม่รอประมวลผลเสร็จ เพื่อตัดปัญหาพิมพ์ซ้ำ)
    if (isAutoPrintTrigger || itemsToPrint.length > 0) {
      finalItems.forEach((item: any) => {
        printedItemsRef.current.add(item.orderItemId);
      });
    }

    setIsPrinting(true);
    try {
      initQZSecurity();

      // แยกแผนก/เครื่องพิมพ์
      const itemsByPrinter: Record<string, any[]> = {};
      finalItems.forEach((item: any) => {
        const pName = item.printerName;
        if (!pName || pName === "ไม่ระบุเครื่องพิมพ์" || pName === "NONE")
          return;

        if (!itemsByPrinter[pName]) {
          itemsByPrinter[pName] = [];
        }
        itemsByPrinter[pName].push(item);
      });

      const printerNames = Object.keys(itemsByPrinter);

      if (printerNames.length === 0) {
        setIsPrinting(false);
        printingLockRef.current.delete(group.uniqueKey);
        return;
      }

      if (!qz.websocket.isActive()) {
        try {
          await qz.websocket.connect();
        } catch (e) {
          try {
            await qz.websocket.disconnect();
          } catch (err) {}
          await qz.websocket.connect();
        }
      }

      // เริ่มส่งคำสั่งพิมพ์ไปยังเครื่องพิมพ์ต่างๆ รวบเป็นบิลเดียวต่อเครื่องพิมพ์
      const printPromises = printerNames.map(async (pName) => {
        const printerItems = itemsByPrinter[pName];
        const totalQtyForPrinter = printerItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );

        const combinedMenuNames = printerItems
          .map(
            (item) =>
              `${item.menuName} x${item.quantity}${item.modifiersText ? ` (${item.modifiersText})` : ""}`,
          )
          .join("\n");

        const combinedModifiers = printerItems
          .map((item) => item.modifiersText)
          .filter(Boolean)
          .join(" | ");

        await printToKitchen(
          {
            menuName: combinedMenuNames,
            totalQuantity: totalQtyForPrinter,
            orders: [
              {
                tableName: group.tableName,
                quantity: totalQtyForPrinter,
                status: group.status,
                order_running_code: group.order_running_code,
                createdAt: group.firstCreatedAt,
              },
            ],
            printerName: pName,
            modifiers: combinedModifiers,
            createdAt: group.firstCreatedAt,
          },
          organizationId!,
        );
      });

      await Promise.all(printPromises);

      if (!isAutoPrintTrigger) {
        toast.success("พิมพ์ใบงานรวมรายการแยกแผนกเรียบร้อยแล้ว");
      }
    } catch (error: any) {
      // 🔓 ในกรณีที่พิมพ์ล้มเหลว ลบประวัติออกเพื่อให้ระบบสามารถกดพิมพ์ซ้ำได้อีกครั้ง
      finalItems.forEach((item: any) => {
        printedItemsRef.current.delete(item.orderItemId);
      });
      toast.error("เกิดข้อผิดพลาดในการพิมพ์: " + error.message);
    } finally {
      setIsPrinting(false);
      // ปลดล็อกเพื่อให้ตัวการ์ดออเดอร์นี้รองรับคำสั่งพิมพ์ครั้งถัดไปเมื่อมีเมนูเพิ่มเข้ามาใหม่
      printingLockRef.current.delete(group.uniqueKey);
    }
  };

  useEffect(() => {
    if (isInitialLoad.current) {
      // ครั้งแรกมาร์คของเก่าค้างจอทั้งหมดว่าพิมพ์แล้ว
      groupedOrders.forEach((g) => {
        g.items.forEach((item: any) =>
          printedItemsRef.current.add(item.orderItemId),
        );
      });
      isInitialLoad.current = false;
      return;
    }

    // ตรวจจับพิมพ์อัตโนมัติเฉพาะรายการใหม่
    if (isAutoPrint) {
      groupedOrders.forEach((g) => {
        const hasNewItem = g.items.some(
          (item: any) => !printedItemsRef.current.has(item.orderItemId),
        );
        if (hasNewItem && ["NEW", "READY"].includes(g.status)) {
          handlePrint(g, true);
        }
      });
    }
  }, [groupedOrders, isAutoPrint]);

  const displayOrders =
    filter === "ALL"
      ? groupedOrders
      : groupedOrders.filter((group: any) => group.status === filter);

  const onStatusChange = async (orderIds: number[], newStatus: string) => {
    setIsRefreshing(true);
    try {
      await Promise.all(orderIds.map((id) => updateStatusOrder(id, newStatus)));
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const toggleAutoPrint = () => {
    const newState = !isAutoPrint;
    setIsAutoPrint(newState);
    localStorage.setItem("kitchen_auto_print", String(newState));
    toast.info(
      newState
        ? "เปิดพิมพ์อัตโนมัติ (NEW, READY) เฉพาะรายการใหม่"
        : "ปิดพิมพ์อัตโนมัติ",
    );
  };

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 10000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="w-full h-full flex flex-col font-sans bg-zinc-50/50 dark:bg-zinc-950/20 rounded-xl">
      <div className="flex-none p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-t-xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-500/10 text-amber-600 rounded-lg flex items-center justify-center border border-amber-500/20 shadow-sm">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                สถานะครัว
              </h1>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full text-zinc-400 hover:text-zinc-900"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
              >
                <RefreshCcw
                  className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
                />
              </Button>

              <Button
                variant={isAutoPrint ? "default" : "ghost"}
                size="icon"
                className={cn(
                  "h-6 w-6 rounded-full transition-all",
                  isAutoPrint
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "text-zinc-400 hover:text-zinc-900",
                )}
                onClick={toggleAutoPrint}
                title={isAutoPrint ? "ปิดพิมพ์อัตโนมัติ" : "เปิดพิมพ์อัตโนมัติ"}
              >
                <Printer className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Ticket className="h-3 w-3" />
              <span className="font-medium">{displayOrders.length}</span>{" "}
              ออเดอร์ค้างทำ
            </div>
          </div>
        </div>

        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg self-start sm:self-center overflow-x-auto max-w-full">
          {["ALL", "NEW", "COOKING"].map((status) => {
            const isActive = filter === status;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5",
                  isActive
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-600"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50",
                )}
              >
                {status === "COOKING" && (
                  <Flame
                    className={cn("h-3 w-3", isActive ? "text-orange-500" : "")}
                  />
                )}
                {status === "NEW" && (
                  <PlayCircle
                    className={cn("h-3 w-3", isActive ? "text-blue-500" : "")}
                  />
                )}
                {status === "ALL" ? "ทั้งหมด" : status}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {displayOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 min-h-[300px]">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-3">
              <UtensilsCrossed className="h-8 w-8 opacity-30" />
            </div>
            <p>ไม่มีรายการออเดอร์ค้างทำ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4">
            {displayOrders.map((group: any) => {
              const startTime = new Date(group.firstCreatedAt);
              const elapsedMins = Math.floor(
                (new Date().getTime() - startTime.getTime()) / 60000,
              );
              const isLate = elapsedMins > 20 && group.status !== "COMPLETED";

              const statusColor = getStatusColor(group.status);
              const borderStyle = getStatusBorder(group.status);

              return (
                <div
                  key={group.uniqueKey}
                  className={cn(
                    "flex flex-col bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all hover:shadow-md",
                    borderStyle,
                    isLate ? "ring-2 ring-red-500/30" : "",
                  )}
                >
                  <div className="p-4 flex gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide",
                            group.status === "NEW"
                              ? "bg-blue-100 text-blue-700"
                              : group.status === "COOKING"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-zinc-100 text-zinc-700",
                          )}
                        >
                          {group.status}
                        </span>
                        <div
                          className={cn(
                            "flex items-center text-xs font-mono",
                            isLate ? "text-red-600 font-bold" : "text-zinc-400",
                          )}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {elapsedMins}m
                        </div>
                      </div>
                      <h3
                        className="text-2xl font-black text-zinc-800 dark:text-zinc-100 leading-tight truncate mt-1"
                        title={group.tableName}
                      >
                        โต๊ะ {group.tableName}
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">
                        #
                        {group.order_running_code?.split("-").pop() ||
                          group.order_running_code}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-xl shrink-0 text-xl font-black shadow-inner",
                          statusColor,
                        )}
                      >
                        {group.totalQuantity}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        onClick={() => handlePrint(group)}
                        disabled={isPrinting}
                        title="พิมพ์ใบสั่งงานรวมรายการ (แยกสเตชั่นอัตโนมัติ)"
                      >
                        {isPrinting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Printer className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700 to-transparent mx-4" />

                  <div className="flex-1 px-4 py-3 max-h-[240px] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-zinc-200">
                    {group.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start text-sm group"
                      >
                        <div className="flex flex-col gap-0.5 pr-2 min-w-0 flex-1">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 leading-tight break-words">
                            {item.menuName}
                          </span>
                          {item.modifiersText && (
                            <span className="text-[11px] text-orange-600 leading-tight mt-0.5">
                              + {item.modifiersText}
                            </span>
                          )}
                          <span className="text-[9px] text-zinc-400 mt-1 font-mono">
                            🖨️{" "}
                            {item.printerName === "NONE" || !item.printerName
                              ? "ไม่ตั้งค่าพิมพ์"
                              : item.printerName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                            x{item.quantity}
                          </span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="text-zinc-300 hover:text-red-500 transition-colors"
                                title="ยกเลิกเฉพาะเมนูนี้ในบิล"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  คุณแน่ใจหรือไม่?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  การกระทำนี้จะเปลี่ยนสถานะออเดอร์ย่อยนี้เป็น
                                  "ยกเลิกรายการ"
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ปิด</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    onStatusChange([item.orderId], "CANCELLED")
                                  }
                                >
                                  ยืนยันการยกเลิก
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                    {group.status === "NEW" ? (
                      <Button
                        className="w-full h-10 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 font-bold shadow-sm"
                        onClick={() =>
                          onStatusChange(group.orderIds, "COOKING")
                        }
                      >
                        <Flame className="h-4 w-4 mr-2" /> ปรุงอาหาร
                      </Button>
                    ) : group.status === "COOKING" ? (
                      <Button
                        className="w-full h-10 border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200 font-bold shadow-sm"
                        onClick={() => onStatusChange(group.orderIds, "READY")}
                      >
                        <BellRing className="h-4 w-4 mr-2" /> เสร็จแล้ว
                      </Button>
                    ) : (
                      <Button
                        className="w-full h-10 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-200 font-bold shadow-sm"
                        onClick={() =>
                          onStatusChange(group.orderIds, "COMPLETED")
                        }
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> ส่งมอบ
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
