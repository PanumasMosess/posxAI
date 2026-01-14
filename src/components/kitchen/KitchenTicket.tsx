"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  UtensilsCrossed,
  X,
  Layers,
  Printer,
  Loader2,
  Settings,
  RefreshCcw,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import statusColorList from "@/lib/data_temp";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "@/components/ui/badge";
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
} from "../ui/alert-dialog";
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

import { KitchecTicketProps } from "@/lib/type";
import { toast } from "react-toastify";
import { printToKitchen } from "@/lib/printers/qz-service-kitchen";
import qz from "qz-tray";
import {
  getCertContentFromS3,
  signDataWithS3Key,
} from "@/lib/actions/actionIndex";

const KitchenTicket = ({
  initialItems: group,
  onStatusChange,
  isGrouped = false,
  printerName: defaultPrinterName,
  id_user,
  organizationId,
}: KitchecTicketProps) => {
  const { nextStatus, label: buttonLabel } = statusColorList.getNextStepConfig(
    group.status
  );
  const statusBadge = statusColorList.getStatusBadgeConfig(group.status);

  const [isPrinting, setIsPrinting] = useState(false);

  const [printerList, setPrinterList] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);


  useEffect(() => {
    const savedPrinter = localStorage.getItem("kitchen_preferred_printer");
    if (savedPrinter) {
      setSelectedPrinter(savedPrinter);
    } else if (defaultPrinterName) {
      setSelectedPrinter(defaultPrinterName);
    }
  }, [defaultPrinterName]);

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
        signDataWithS3Key(toSign, organizationId.toString())
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

  const handlePrint = async () => {
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
          createdAt: group.createdAt,
        },
        organizationId
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
  // ----------------------------------------------------

  return (
    <Card
      className={`
        w-full p-0 rounded-xl overflow-hidden border
        bg-white dark:bg-zinc-900 
        text-zinc-950 dark:text-zinc-50 
        transition-all duration-300 hover:shadow-lg
        ${statusColorList.statusColor(group.status)}
      `}
    >
      <CardHeader className="flex flex-row justify-between items-start px-4 pt-5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col max-w-[60%]">
          {(group.orders?.length || 0) > 1 && (
            <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 mb-1">
              <Layers className="h-3 w-3" /> GROUPED ({group.orders?.length})
            </span>
          )}
          <span className="text-lg font-bold leading-tight line-clamp-2">
            {group.menu.menuName}
          </span>
          {group.modifiers && group.modifiers.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {group.modifiers.map((mod: any, index: number) => (
                <span
                  key={index}
                  className="text-xs font-semibold text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded"
                >
                  + {mod.modifierItem.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-300 hover:text-zinc-500"
                onClick={fetchPrinters}
                title="ตั้งค่าเครื่องพิมพ์"
              >
                <Settings className="h-4 w-4" />
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

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            onClick={handlePrint}
            disabled={isPrinting}
            title={`พิมพ์ใบออเดอร์ (${selectedPrinter || "ยังไม่เลือก"})`}
          >
            {isPrinting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
          </Button>

          <Badge
            variant="outline"
            className={`${statusBadge.color} border ml-1`}
          >
            {statusBadge.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="p-4 flex items-center gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Avatar className="h-16 w-16 rounded-lg border border-border/50">
            <AvatarImage
              src={group.menu.img || "/placeholder-menu.png"}
              className="object-cover"
            />
            <AvatarFallback>IMG</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-right">
            <div className="text-xs text-muted-foreground font-bold uppercase">
              Total Qty
            </div>
            <div className="text-4xl font-extrabold text-primary leading-none">
              x{group.totalQuantity}
            </div>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-zinc-100 dark:border-zinc-800">
          {group.orders?.map((subOrder: any, idx: number) => (
            <div
              key={subOrder.id}
              className="flex items-center justify-between px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  {subOrder.tableName}
                </span>
                {subOrder.order_running_code && (
                  <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                    #{subOrder.order_running_code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                  x{subOrder.quantity}
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="text-zinc-400 hover:text-red-500"
                      title="ยกเลิกเฉพาะรายการนี้"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                      <AlertDialogDescription>
                        การกระทำนี้จะเปลี่ยนสถานะเป็น "ยกเลิกรายการ"
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onStatusChange(subOrder.id, "CANCELLED")}
                      >
                        ยืนยันการลบ
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {nextStatus ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className={`w-full h-10 rounded-lg font-bold shadow-sm ${statusColorList.getButtonActionColor(
                  group.status
                )}`}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  {group.status === "NEW" ? (
                    <UtensilsCrossed className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ) : (
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  )}
                  <span>
                    {buttonLabel}
                    <span className="hidden sm:inline">ทั้งหมด</span>
                  </span>
                  <span className="opacity-90">({group.totalQuantity})</span>
                </div>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                <AlertDialogDescription>
                  การกระทำนี้ไม่สามารถย้อนกลับได้ มันจะเปลี่ยนสถานะเป็น "
                  {buttonLabel}" อย่างถาวร
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    onStatusChange(group.orderIds || [], nextStatus)
                  }
                >
                  ยืนยัน
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <div className="w-full text-center text-xs text-muted-foreground py-2">
            เสร็จสิ้นกระบวนการ
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default KitchenTicket;
