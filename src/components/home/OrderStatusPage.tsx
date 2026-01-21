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
  Settings,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const [printerList, setPrinterList] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const savedPrinter = localStorage.getItem("kitchen_preferred_printer");
    if (savedPrinter) {
      setSelectedPrinter(savedPrinter);
    }
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

  const fetchPrinters = async () => {
    if (isLoadingPrinters) return;
    setIsLoadingPrinters(true);

    try {
      initQZSecurity();

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

      const printers = await qz.printers.find();
      setPrinterList(printers);

      if (!selectedPrinter && printers.length > 0) {
        try {
          const def = await qz.printers.getDefault();
          handlePrinterChange(def);
        } catch (e) {
          handlePrinterChange(printers[0]);
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("sendData is not a function")) {
        try {
          if (qz.websocket.isActive()) await qz.websocket.disconnect();
          await qz.websocket.connect();
          const printers = await qz.printers.find();
          setPrinterList(printers);
        } catch (retryErr) {
          console.error("Retry failed", retryErr);
        }
      } else {
        toast.error("ไม่สามารถดึงรายชื่อเครื่องพิมพ์ได้");
      }
    } finally {
      setIsLoadingPrinters(false);
    }
  };

  const handlePrinterChange = (value: string) => {
    setSelectedPrinter(value);
    localStorage.setItem("kitchen_preferred_printer", value);
  };

  const handlePrint = async (group: any) => {
    if (!selectedPrinter) {
      toast.warn("กรุณาเลือกเครื่องพิมพ์ก่อน");
      setIsSettingsOpen(true);
      fetchPrinters();
      return;
    }

    setIsPrinting(true);
    try {
      const modifiersText = group.modifiers
        ?.map((m: any) => m.modifierItem.name)
        .join(", ");

      const result = await printToKitchen(
        {
          menuName: group.menu.menuName,
          totalQuantity: group.totalQuantity,
          orders: group.orders || [],
          printerName: selectedPrinter,
          modifiers: modifiersText,
          createdAt: group.firstCreatedAt,
        },
        organizationId!
      );

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("QZ Tray Error: " + result.message);
      }
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsPrinting(false);
    }
  };

  const rawOrders = relatedData?.orderRunning || [];
  const activeOrders = rawOrders.filter(
    (order) =>
      !["COMPLETED", "CANCELLED", "PAY_COMPLETED"].includes(order.status)
  );

  const prevOrderCountRef = useRef(activeOrders.length);
  useEffect(() => {
    if (activeOrders.length > prevOrderCountRef.current) {
      try {
        const audio = new Audio(
          "https://tvposx.sgp1.cdn.digitaloceanspaces.com/uploads/sound/notification-aero.mp3"
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
      if (order.orderitems) {
        order.orderitems.forEach((item) => {
          const modifierKey = item.selectedModifiers
            ? item.selectedModifiers
                .map((m) => m.modifierItem.name)
                .sort()
                .join("|")
            : "";
          const groupKey = `${item.menu.menuName}-${order.status}-${modifierKey}`;

          if (!groups[groupKey]) {
            groups[groupKey] = {
              uniqueKey: groupKey,
              menu: item.menu,
              status: order.status,
              modifiers: item.selectedModifiers || [],
              totalQuantity: 0,
              orders: [],
              orderIds: [],
              firstCreatedAt: order.createdAt,
            };
          }
          groups[groupKey].totalQuantity += item.quantity;
          if (!groups[groupKey].orderIds.includes(order.id)) {
            groups[groupKey].orderIds.push(order.id);
          }
          groups[groupKey].orders.push({
            id: order.id,
            tableName: order.table.tableName,
            quantity: item.quantity,
            status: order.status,
            order_running_code: order.order_running_code,
            createdAt: order.createdAt,
          });
        });
      }
    });
    return Object.values(groups).sort(
      (a: any, b: any) =>
        new Date(a.firstCreatedAt).getTime() -
        new Date(b.firstCreatedAt).getTime()
    );
  }, [activeOrders]);

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
              {/* Printer Settings Button */}
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full text-zinc-400 hover:text-zinc-900"
                    onClick={fetchPrinters}
                    title="ตั้งค่าเครื่องพิมพ์"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>ตั้งค่าการพิมพ์</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="printer">เลือกเครื่องพิมพ์</Label>
                      <div className="flex gap-2">
                        <Select
                          value={selectedPrinter}
                          onValueChange={handlePrinterChange}
                          disabled={isLoadingPrinters}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="เลือกเครื่องพิมพ์..." />
                          </SelectTrigger>
                          <SelectContent>
                            {printerList.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={fetchPrinters}
                          disabled={isLoadingPrinters}
                        >
                          <RefreshCcw
                            className={`h-4 w-4 ${
                              isLoadingPrinters ? "animate-spin" : ""
                            }`}
                          />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        * การตั้งค่านี้จะถูกบันทึกไว้ในเครื่องนี้
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Ticket className="h-3 w-3" />
              <span className="font-medium">{displayOrders.length}</span> รายการ
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
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
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
            <p>ไม่มีรายการอาหารค้าง</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4">
            {displayOrders.map((group: any) => {
              const startTime = new Date(group.firstCreatedAt);
              const elapsedMins = Math.floor(
                (new Date().getTime() - startTime.getTime()) / 60000
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
                    isLate ? "ring-2 ring-red-500/30" : ""
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
                              : "bg-zinc-100 text-zinc-700"
                          )}
                        >
                          {group.status}
                        </span>
                        <div
                          className={cn(
                            "flex items-center text-xs font-mono",
                            isLate ? "text-red-600 font-bold" : "text-zinc-400"
                          )}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {elapsedMins}m
                        </div>
                      </div>
                      <h3
                        className="text-lg font-bold text-zinc-800 dark:text-zinc-100 leading-tight line-clamp-2"
                        title={group.menu.menuName}
                      >
                        {group.menu.menuName}
                      </h3>
                      {group.modifiers && group.modifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {group.modifiers.map((mod: any, i: number) => (
                            <span
                              key={i}
                              className="text-[10px] bg-orange-50 text-orange-700 border border-orange-100 px-1.5 py-0.5 rounded-sm"
                            >
                              + {mod.modifierItem.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-xl shrink-0 text-xl font-black shadow-inner",
                          statusColor
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
                        title={`พิมพ์ใบออเดอร์ (${
                          selectedPrinter || "ยังไม่เลือก"
                        })`}
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

                  <div className="flex-1 px-4 py-3 max-h-[150px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-zinc-200">
                    {group.orders.map((orderItem: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 group-hover:bg-zinc-500" />
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                            {orderItem.tableName}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline-block">
                            #{orderItem.order_running_code?.split("-").pop()}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          x{orderItem.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ✅ --- FOOTER ACTIONS (UPDATED) --- */}
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
