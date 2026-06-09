"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
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
import { updateStatusOrder, getKitchenOrders } from "@/lib/actions/actionMenu";
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

  const printedItemsRef = useRef<Set<number>>(new Set());
  const printingLockRef = useRef<Set<string>>(new Set());

  // 🟢 ตัวแปรสำคัญ: ล็อกเป้าป้องกันการปริ้นและแจ้งเตือนออเดอร์เก่าตอนเปิดหน้าจอ/รีเฟรช
  const hasInitializedBaseline = useRef(false);
  const prevOrderCountRef = useRef(0);

  const { data: kitchenData, mutate } = useSWR(
    organizationId ? `kitchen-data-${organizationId}` : null,
    () => getKitchenOrders(organizationId!),
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

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

  const rawOrders = kitchenData?.orderRunning || [];
  const activeOrders = rawOrders.filter(
    (order: any) =>
      !["COMPLETED", "CANCELLED", "PAY_COMPLETED"].includes(order.status),
  );

  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: any } = {};

    activeOrders.forEach((order: any) => {
      if (order.orderitems) {
        order.orderitems.forEach((item: any) => {
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

          const groupKey = `${item.menu.menuName}-${modifierText}-${order.status}`;

          if (!groups[groupKey]) {
            groups[groupKey] = {
              uniqueKey: groupKey,
              menuName: item.menu.menuName,
              modifiersText: modifierText,
              category: categoryName,
              printerName: printerName,
              status: order.status,
              totalQuantity: 0,
              orderIds: [],
              tables: [],
              rawItems: [],
              firstCreatedAt: order.createdAt,
            };
          }

          groups[groupKey].totalQuantity += item.quantity;

          if (!groups[groupKey].orderIds.includes(order.id)) {
            groups[groupKey].orderIds.push(order.id);
          }

          const existingTable = groups[groupKey].tables.find(
            (t: any) => t.orderId === order.id,
          );
          if (existingTable) {
            existingTable.quantity += item.quantity;
          } else {
            groups[groupKey].tables.push({
              orderId: order.id,
              tableName: order.table?.tableName || "ไม่ระบุโต๊ะ",
              order_running_code: order.order_running_code,
              quantity: item.quantity,
            });
          }

          groups[groupKey].rawItems.push({
            orderItemId: item.id,
            orderId: order.id,
            quantity: item.quantity,
            tableName: order.table?.tableName || "ไม่ระบุโต๊ะ",
            order_running_code: order.order_running_code,
            createdAt: order.createdAt,
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

  const handlePrint = async (
    group: any,
    isAutoPrintTrigger: boolean = false,
  ) => {
    if (printingLockRef.current.has(group.uniqueKey)) return;
    printingLockRef.current.add(group.uniqueKey);

    const itemsToPrint = group.rawItems.filter(
      (item: any) => !printedItemsRef.current.has(item.orderItemId),
    );

    const finalItems =
      itemsToPrint.length === 0 && !isAutoPrintTrigger
        ? group.rawItems
        : itemsToPrint;

    if (finalItems.length === 0) {
      printingLockRef.current.delete(group.uniqueKey);
      return;
    }

    if (isAutoPrintTrigger || itemsToPrint.length > 0) {
      finalItems.forEach((item: any) => {
        printedItemsRef.current.add(item.orderItemId);
      });
    }

    setIsPrinting(true);
    try {
      initQZSecurity();
      const pName = group.printerName;

      if (!pName || pName === "ไม่ระบุเครื่องพิมพ์" || pName === "NONE") {
        if (!isAutoPrintTrigger) toast.warn("เมนูนี้ไม่ได้ตั้งค่าเครื่องพิมพ์");
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

      const totalQtyForPrinter = finalItems.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0,
      );

      const menuTitle = `${group.menuName} x${totalQtyForPrinter}`;

      await printToKitchen(
        {
          menuName: menuTitle,
          totalQuantity: totalQtyForPrinter,
          orders: finalItems.map((o: any) => ({
            tableName: o.tableName,
            quantity: o.quantity,
            status: group.status,
            order_running_code: o.order_running_code,
            createdAt: o.createdAt,
          })),
          printerName: pName,
          modifiers: group.modifiersText,
          createdAt: group.firstCreatedAt,
        },
        organizationId!,
      );

      if (!isAutoPrintTrigger) {
        toast.success("พิมพ์ใบสั่งทำรวบยอดสำเร็จ");
      }
    } catch (error: any) {
      finalItems.forEach((item: any) => {
        printedItemsRef.current.delete(item.orderItemId);
      });
      toast.error("เกิดข้อผิดพลาดในการพิมพ์: " + error.message);
    } finally {
      setIsPrinting(false);
      printingLockRef.current.delete(group.uniqueKey);
    }
  };

  // 🟢 รวมศูนย์จัดการควบคุมเหตุการณ์ (เสียงเตือน + สั่งปริ้นอัตโนมัติ) ให้ปลอดภัยจากการรีเฟรช 100%
  useEffect(() => {
    // 🛠️ รอให้ SWR โหลดข้อมูลก้อนแรกเสร็จสมบูรณ์จริงๆ ก่อนทำงาน
    if (!kitchenData) return;

    // 🛠️ จังหวะเรนเดอร์ครั้งแรกหลังรีเฟรช: สั่งเก็บประวัติออเดอร์เก่าลงทะเบียนเป็น "อ่านแล้ว/พิมพ์แล้ว" ทันที ห้ามส่งเสียงหรือสั่งปริ้น
    if (!hasInitializedBaseline.current) {
      const initialActiveOrders = (kitchenData.orderRunning || []).filter(
        (order: any) =>
          !["COMPLETED", "CANCELLED", "PAY_COMPLETED"].includes(order.status),
      );

      initialActiveOrders.forEach((order: any) => {
        if (order.orderitems) {
          order.orderitems.forEach((item: any) => {
            // เอาเงื่อนไขดักบล็อก Entertainner ตรงนี้ออกด้วยเหมือนกัน จะได้ลงทะเบียนออเดอร์เก่าให้ครบทุกเมนู
            printedItemsRef.current.add(item.id);
          });
        }
      });

      // บันทึกจำนวนตั้งต้นไว้เปรียบเทียบ
      prevOrderCountRef.current = initialActiveOrders.length;
      hasInitializedBaseline.current = true;
      return; // สั่งหยุดทำงานบรรทัดนี้ในรอบแรก เพื่อเคลียร์บั๊กประมวลผลซ้ำตอนรีเฟรช
    }

    // ------------------------------------------------------------------
    // 🔥 พื้นที่ทำงานของระบบ Real-time (หลังจากโหลดโครงสร้างแรกเสร็จสิ้นแล้ว)
    // ------------------------------------------------------------------

    // 1. ตรวจสอบการยิงแจ้งเตือนระบบเสียง (จะดังเฉพาะตอนมียอดเพิ่มเข้ามาใหม่จริงๆ)
    const currentActiveCount = activeOrders.length;
    if (currentActiveCount > prevOrderCountRef.current) {
      try {
        const audio = new Audio(
          "https://tvposx.sgp1.cdn.digitaloceanspaces.com/uploads/sound/notification-aero.mp3",
        );
        audio.play().catch((e) => console.error("Audio play failed", e));
      } catch (e) {
        console.error(e);
      }
    }
    prevOrderCountRef.current = currentActiveCount;

    // 2. ตรวจสอบการทำงานพิมพ์สลิปใบสั่งงานอัตโนมัติแบบเรียงลำดับคิวปลอดภัย
    if (isAutoPrint) {
      const runSequentialAutoPrint = async () => {
        for (const g of groupedOrders) {
          const hasNewItem = g.rawItems.some(
            (item: any) => !printedItemsRef.current.has(item.orderItemId),
          );
          if (hasNewItem && ["NEW", "READY"].includes(g.status)) {
            // สั่งทำงานแบบซิงโครนัส รอให้ QZ ปริ้นใบนี้จบอย่างสวยงามก่อน ค่อยสั่งใบถัดไป
            await handlePrint(g, true);
          }
        }
      };

      runSequentialAutoPrint();
    }
  }, [kitchenData, groupedOrders, isAutoPrint, activeOrders.length]);

  const displayOrders =
    filter === "ALL"
      ? groupedOrders
      : groupedOrders.filter((group: any) => group.status === filter);

  const onStatusChange = async (orderIds: number[], newStatus: string) => {
    setIsRefreshing(true);
    try {
      await Promise.all(orderIds.map((id) => updateStatusOrder(id, newStatus)));
      await mutate();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await mutate();
    setIsRefreshing(false);
    toast.success("อัปเดตข้อมูลคิวครัวเรียบร้อย");
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
              เมนูอาหารค้างทำ
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
            <p>ไม่มีรายการอาหารค้างทำ</p>
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
                        <span className="text-[10px] text-zinc-400 ml-auto border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded-sm truncate max-w-[120px]">
                          📁 {group.category}
                        </span>
                      </div>

                      <h3
                        className="text-2xl font-black text-zinc-800 dark:text-zinc-100 leading-tight truncate mt-1"
                        title={group.menuName}
                      >
                        {group.menuName}
                      </h3>
                      {group.modifiersText && (
                        <p className="text-sm font-semibold text-orange-600 truncate mt-1">
                          + {group.modifiersText}
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-400 font-mono mt-1">
                        🖨️ เครื่องพิมพ์:{" "}
                        {group.printerName === "NONE" || !group.printerName
                          ? "ไม่ระบุ"
                          : group.printerName}
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
                        title="พิมพ์ใบสั่งงานรวม"
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
                    <p className="text-[10px] font-semibold text-zinc-400 mb-1">
                      จุดจัดส่งโต๊ะ:
                    </p>
                    {group.tables.map((table: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 group-hover:bg-zinc-500" />
                          <span className="font-bold text-zinc-700 dark:text-zinc-200">
                            โต๊ะ {table.tableName}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline-block">
                            #{table.order_running_code?.split("-").pop()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                            x{table.quantity}
                          </span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="text-zinc-400 hover:text-red-500"
                                title="ยกเลิกออเดอร์โต๊ะนี้"
                                disabled={isRefreshing}
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
                                  การกระทำนี้จะเปลี่ยนสถานะออเดอร์ของโต๊ะนี้เป็น
                                  "ยกเลิกรายการ"
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ปิด</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() =>
                                    onStatusChange([table.orderId], "CANCELLED")
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
                        disabled={isRefreshing}
                      >
                        <Flame className="h-4 w-4 mr-2" /> ปรุงอาหาร
                      </Button>
                    ) : group.status === "COOKING" ? (
                      <Button
                        className="w-full h-10 border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200 font-bold shadow-sm"
                        onClick={() => onStatusChange(group.orderIds, "READY")}
                        disabled={isRefreshing}
                      >
                        <BellRing className="h-4 w-4 mr-2" /> เสร็จแล้ว
                      </Button>
                    ) : (
                      <Button
                        className="w-full h-10 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-200 font-bold shadow-sm"
                        onClick={() =>
                          onStatusChange(group.orderIds, "COMPLETED")
                        }
                        disabled={isRefreshing}
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
