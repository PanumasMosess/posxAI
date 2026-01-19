"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  QrCode,
  Receipt,
  Clock,
  ChevronRight,
  Utensils,
  Search,
  XCircle,
  Settings,
  RefreshCcw,
  Printer,
  LayoutGrid,
  ChefHat,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { KitchecOrderList } from "@/lib/type";
import PaymentOption from "@/components/payments/PaymentOption";
import { toast } from "react-toastify";
import {
  createPaymentOrder,
  updateStatusOrder,
  updateStatusTable,
} from "@/lib/actions/actionPayment";
import { useRouter } from "next/navigation";
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

import qz from "qz-tray";
import { printReceiptQZ } from "@/lib/printers/qz-service-receipt";
import {
  getCertContentFromS3,
  signDataWithS3Key,
} from "@/lib/actions/actionIndex";

const PaymentStatusPage = ({
  initialItems,
  id_user,
  organizationId,
}: KitchecOrderList) => {
  const router = useRouter();

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"QR" | "CASH" | "CARD">(
    "CASH"
  );
  const [cashReceived, setCashReceived] = useState("0");
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [printerList, setPrinterList] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const savedPrinter = localStorage.getItem("receipt_preferred_printer");
    if (savedPrinter) {
      setSelectedPrinter(savedPrinter);
    }
  }, []);

  useEffect(() => {
    setCashReceived("0");
  }, [selectedOrder]);

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

  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: any } = {};

    initialItems.forEach((order) => {
      if (order.status !== "COMPLETED") {
        return;
      }

      const key = order.order_running_code || `ORDER-${order.id}`;

      if (!groups[key]) {
        groups[key] = {
          id: key,
          firstOrderId: order.id,
          runningCode: order.order_running_code || "-",
          table: order.table.tableName,
          tableId: order.table.id,
          time: new Date(order.createdAt).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          total: 0,
          items: [],
          currency: "฿",
          allOrderIds: [],
        };
      }

      groups[key].allOrderIds.push(order.id);

      groups[key].total += order.price_sum || 0;

      if (order.orderitems && Array.isArray(order.orderitems)) {
        order.orderitems.forEach((item) => {
          if (groups[key].items.length === 0 && item.menu.unitPrice?.label) {
            groups[key].currency = item.menu.unitPrice.label;
          }

          let modifiersTotal = 0;

          const modifiersText = item.selectedModifiers
            ?.map((m: any) => {
              const price = m.price || 0;
              modifiersTotal += price;
              if (price > 0) {
                return `${m.modifierItem.name} (+${price})`;
              }
              return m.modifierItem.name;
            })
            .join(", ");

          const displayName = modifiersText
            ? `${item.menu.menuName} (${modifiersText})`
            : item.menu.menuName;

          const basePrice = item.menu.price_sale || 0;
          const finalUnitPrice = basePrice + modifiersTotal;
          const totalPriceForItem = finalUnitPrice * item.quantity;

          groups[key].items.push({
            id: item.id,
            name: displayName,
            qty: item.quantity,
            img: item.menu.img,
            price: totalPriceForItem,
          });
        });
      }
    });

    return Object.values(groups);
  }, [initialItems, organizationId]);

  const filteredOrders = groupedOrders.filter(
    (order: any) =>
      order.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.runningCode &&
        order.runningCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalAmount = selectedOrder ? selectedOrder.total : 0;
  const change = parseFloat(cashReceived || "0") - totalAmount;
  const isCashSufficient = change >= 0;

  const fetchPrinters = async () => {
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
        } catch {
          handlePrinterChange(printers[0]);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error("ไม่สามารถดึงรายชื่อเครื่องพิมพ์ได้");
    } finally {
      setIsLoadingPrinters(false);
    }
  };

  const handlePrinterChange = (value: string) => {
    setSelectedPrinter(value);
    localStorage.setItem("receipt_preferred_printer", value);
  };

  const handlePrintReceipt = async (orderData: any = selectedOrder) => {
    if (!selectedPrinter) {
      toast.warn("กรุณาเลือกเครื่องพิมพ์ก่อนพิมพ์ใบเสร็จ");
      setIsSettingsOpen(true);
      fetchPrinters();
      return;
    }
    setIsProcessing(true);
    try {
      initQZSecurity();
      const receiptData = {
        orderId: orderData.runningCode,
        table: orderData.table,
        date: new Date().toLocaleString("th-TH"),
        items: orderData.items.map((i: any) => ({
          name: i.name,
          quantity: i.qty,
          price: i.price,
        })),
        total: orderData.total,
        currency: orderData.currency,
        paymentMethod: paymentMethod,
        cashReceived:
          paymentMethod === "CASH" ? parseFloat(cashReceived) : undefined,
        change: paymentMethod === "CASH" ? change : undefined,
      };

      const result = await printReceiptQZ(
        receiptData,
        selectedPrinter,
        organizationId
      );

      if (result.success) {
        toast.success("พิมพ์ใบเสร็จเรียบร้อย");
      } else {
        toast.error("พิมพ์ไม่สำเร็จ: " + result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการพิมพ์");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedOrder) return;
    if (paymentMethod === "CASH" && !isCashSufficient) {
      toast.error("ยอดเงินไม่เพียงพอ กรุณาตรวจสอบจำนวนเงิน");
      return;
    }

    const paymentPayload = {
      orderId: selectedOrder.id,
      table: selectedOrder.table,
      tableId: selectedOrder.tableId,
      paymentMethod: paymentMethod,
      totalAmount: totalAmount,
      createdById: id_user,
      organizationId: organizationId,
      cashReceived:
        paymentMethod === "CASH" ? parseFloat(cashReceived) : totalAmount,
      change: paymentMethod === "CASH" ? change : 0,
    };

    setIsProcessing(true);
    const create_status = await createPaymentOrder(paymentPayload);

    if (create_status.success) {
      await updateStatusOrder(selectedOrder.id, "PAY_COMPLETED");
      await updateStatusTable(selectedOrder.tableId, "AVAILABLE");
      toast.success("ชำระเงินเรียบร้อย!");
      setSelectedOrder(null);
      router.refresh();
    } else {
      toast.error("ไม่สามารถบันทึกข้อมูลได้");
    }
    setIsProcessing(false);
  };

  // --- REDESIGN UI START ---

  return (
    <div className="flex h-screen bg-zinc-50/50 dark:bg-zinc-950 w-full overflow-hidden">
      {/* LEFT: Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-none">
                สถานะการชำระเงิน
              </h1>
              <p className="text-[10px] text-zinc-500 font-medium">
                Payment Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group w-64 md:w-80 transition-all">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
              <Input
                placeholder="ค้นหาโต๊ะ หรือ รหัสบิล..."
                className="pl-10 h-10 bg-zinc-100 dark:bg-zinc-800 border-transparent focus:bg-white dark:focus:bg-zinc-950 transition-all rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={fetchPrinters}
                >
                  <Settings className="h-5 w-5 text-zinc-500" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>ตั้งค่าเครื่องพิมพ์ใบเสร็จ</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="printer">เลือกเครื่องพิมพ์</Label>
                    <div className="flex gap-2 items-center">
                      <Select
                        value={selectedPrinter}
                        onValueChange={handlePrinterChange}
                        disabled={isLoadingPrinters}
                      >
                        <SelectTrigger className="w-full bg-background text-foreground">
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
                        className="h-9 w-9 shrink-0 border-input bg-background"
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
                      * ใช้สำหรับพิมพ์ใบเสร็จรับเงิน (80mm)
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Content Grid */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-400">
              <div className="h-24 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <ChefHat className="h-10 w-10 opacity-30" />
              </div>
              <p className="text-lg font-medium">ไม่พบรายการที่รอชำระเงิน</p>
              <p className="text-sm">รายการสั่งอาหารใหม่จะปรากฏที่นี่</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 pb-20">
              {filteredOrders.map((order: any) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                  >
                    <Card
                      onClick={() => setSelectedOrder(order)}
                      className={`
                        cursor-pointer h-full border-0 shadow-sm relative overflow-hidden transition-all duration-300
                        ${
                          isSelected
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 ring-2 ring-offset-2 ring-zinc-900 dark:ring-zinc-100"
                            : "bg-white hover:shadow-md dark:bg-zinc-900 dark:hover:bg-zinc-800"
                        }
                      `}
                    >
                      <div className="p-5 flex flex-col h-full justify-between gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p
                              className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${
                                isSelected
                                  ? "text-zinc-400 dark:text-zinc-500"
                                  : "text-zinc-400"
                              }`}
                            >
                              Table No.
                            </p>
                            <h3 className="text-3xl font-black leading-none tracking-tight">
                              {order.table}
                            </h3>
                          </div>
                          <Badge
                            className={`
                            font-mono font-medium
                            ${
                              isSelected
                                ? "bg-zinc-800 text-zinc-300 dark:bg-zinc-200 dark:text-zinc-700"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            }
                          `}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {order.time}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`
                              h-8 w-8 rounded-full flex items-center justify-center
                              ${
                                isSelected
                                  ? "bg-zinc-800 dark:bg-zinc-200"
                                  : "bg-blue-50 dark:bg-blue-900/20"
                              }
                            `}
                            >
                              <Utensils
                                className={`h-4 w-4 ${
                                  isSelected
                                    ? "text-white dark:text-black"
                                    : "text-blue-500"
                                }`}
                              />
                            </div>
                            <span
                              className={`text-sm font-medium ${
                                isSelected
                                  ? "text-zinc-300 dark:text-zinc-600"
                                  : "text-zinc-600 dark:text-zinc-300"
                              }`}
                            >
                              {order.items.length} รายการ
                            </span>
                          </div>
                          <Separator
                            className={
                              isSelected
                                ? "bg-zinc-700 dark:bg-zinc-300"
                                : "bg-zinc-100 dark:bg-zinc-800"
                            }
                          />
                          <div className="flex justify-between items-end">
                            <span
                              className={`text-xs ${
                                isSelected ? "text-zinc-400" : "text-zinc-400"
                              }`}
                            >
                              ยอดสุทธิ
                            </span>
                            <div className="text-right">
                              <span className="text-xl font-bold">
                                {order.total.toLocaleString()}
                              </span>
                              <span
                                className={`text-xs ml-1 ${
                                  isSelected ? "text-zinc-500" : "text-zinc-400"
                                }`}
                              >
                                {order.currency}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Decorative elements */}
                      <div
                        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-white/5 rounded-bl-full pointer-events-none`}
                      />
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* RIGHT: Payment Sidebar Drawer */}
      <AnimatePresence mode="wait">
        {selectedOrder && (
          <motion.div
            key="payment-sidebar"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="
              fixed inset-y-0 right-0 z-50 w-full sm:w-[450px]
              bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl
              flex flex-col
            "
          >
            {/* Sidebar Header */}
            <div className="h-16 px-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
                  onClick={() => setSelectedOrder(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    ชำระเงิน
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    ID: {selectedOrder.runningCode}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-zinc-500 border-zinc-200"
                >
                  โต๊ะ {selectedOrder.table}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-zinc-900"
                  onClick={() => handlePrintReceipt(selectedOrder)}
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                {/* Total Display */}
                <div className="text-center relative py-6">
                  <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-900 rounded-3xl -z-10 transform -skew-y-2" />
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mb-2">
                    Total Amount
                  </p>
                  <div className="flex items-baseline justify-center gap-2 text-zinc-900 dark:text-white">
                    <span className="text-5xl font-black tracking-tighter">
                      {selectedOrder.total.toLocaleString()}
                    </span>
                    <span className="text-xl font-medium text-zinc-400">
                      {selectedOrder.currency}
                    </span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="grid grid-cols-3 gap-3">
                  <PaymentOption
                    icon={QrCode}
                    label="QR Code"
                    active={paymentMethod === "QR"}
                    onClick={() => setPaymentMethod("QR")}
                    disabled={true}
                  />
                  <PaymentOption
                    icon={Banknote}
                    label="เงินสด"
                    active={paymentMethod === "CASH"}
                    onClick={() => setPaymentMethod("CASH")}
                  />
                  <PaymentOption
                    icon={CreditCard}
                    label="บัตรเครดิต"
                    active={paymentMethod === "CARD"}
                    onClick={() => setPaymentMethod("CARD")}
                    disabled={true}
                  />
                </div>

                {/* Dynamic Content based on Payment Method */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
                  {paymentMethod === "QR" && (
                    <div className="flex flex-col items-center justify-center space-y-4 py-4">
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
                        <div className="w-48 h-48 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-300">
                          <QrCode className="h-12 w-12 opacity-20" />
                        </div>
                      </div>
                      <p className="text-sm text-zinc-500 font-medium">
                        สแกน QR Code เพื่อชำระเงิน
                      </p>
                    </div>
                  )}

                  {paymentMethod === "CASH" && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-zinc-400 uppercase pl-1">
                          จำนวนเงินที่รับ
                        </label>
                        <div className="relative group">
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="text-right text-2xl h-14 pr-12 font-bold bg-white dark:bg-zinc-950 border-zinc-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all rounded-xl shadow-sm"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            autoFocus
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-sm">
                            {selectedOrder.currency}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 flex justify-between items-center shadow-sm">
                        <span className="text-sm font-medium text-zinc-500">
                          เงินทอน
                        </span>
                        <span
                          className={`text-xl font-bold ${
                            change < 0 ? "text-red-500" : "text-emerald-600"
                          }`}
                        >
                          {change >= 0 ? change.toLocaleString() : "-"}
                        </span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "CARD" && (
                    <div className="flex flex-col items-center justify-center py-10 text-zinc-400 space-y-3">
                      <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                        <CreditCard className="h-8 w-8 opacity-50" />
                      </div>
                      <p className="text-sm font-medium">
                        กรุณาเสียบบัตรที่เครื่อง EDC
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Summary List */}
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-xs font-bold text-zinc-400 uppercase">
                      รายการอาหาร
                    </p>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {selectedOrder.items.length} รายการ
                    </Badge>
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors group"
                      >
                        <div className="flex gap-3 items-center">
                          <Avatar className="h-10 w-10 rounded-lg border border-zinc-100 shadow-sm">
                            <AvatarImage
                              src={item.img || "/placeholder.png"}
                              className="object-cover"
                            />
                            <AvatarFallback>IMG</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 group-hover:text-primary transition-colors">
                              {item.name}
                            </p>
                            <p className="text-xs text-zinc-400">
                              จำนวน: {item.qty}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                          {item.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-6 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                    size="lg"
                    disabled={paymentMethod === "CASH" && !isCashSufficient}
                  >
                    <span>ยืนยันการชำระเงิน</span>
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>ยืนยันการชำระเงิน?</AlertDialogTitle>
                    <AlertDialogDescription>
                      ระบบจะทำการบันทึกยอดเงินและเปลี่ยนสถานะโต๊ะเป็น "ว่าง"
                      ทันที
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePayment}>
                      ยืนยัน
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentStatusPage;
