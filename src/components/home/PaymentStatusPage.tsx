"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
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
  Trash2,
  Receipt,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { KitchecOrderList } from "@/lib/type";
import { toast } from "react-toastify";
import {
  createPaymentOrder,
  getMemberByPhone,
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
import PaymentMethodsPanel from "../payments/PaymentMethodsPanel";
import { useUser } from "../providers/UserContext";
import { checkActiveShift } from "@/lib/actions/actionShift";
import { OpenShiftModal } from "../forms/OpenShiftModal";

const PaymentStatusPage = ({
  initialItems,
  id_user,
  organizationId,
}: KitchecOrderList) => {
  const router = useRouter();
  const { employeeId, employeeName } = useUser();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // State สำหรับเก็บรายการอาหารที่ถูกเลือกเพื่อชำระเงิน
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const [paymentMethod, setPaymentMethod] = useState<
    "QR" | "CASH" | "CARD" | "MEMBER"
  >("CASH");
  const [qrType, setQrType] = useState<"THAI" | "LAO">("LAO");
  const [cashReceived, setCashReceived] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberData, setMemberData] = useState<any>(null);
  const [isLoadingMember, setIsLoadingMember] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [printerList, setPrinterList] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isAutoPrint, setIsAutoPrint] = useState(false);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);

  useEffect(() => {
    const savedPrinter = localStorage.getItem("receipt_preferred_printer");
    if (savedPrinter) {
      setSelectedPrinter(savedPrinter);
    }
    const savedAutoPrint =
      localStorage.getItem("receipt_auto_print") === "true";
    setIsAutoPrint(savedAutoPrint);
  }, []);

  // เมื่อเลือกบิลใหม่ ให้ Default เป็นการ "เลือกทุกรายการ" เพื่อจ่ายทั้งหมด
  useEffect(() => {
    setCashReceived("0");
    setDiscount("0");
    setMemberPhone("");
    setMemberData(null);
    if (selectedOrder) {
      setSelectedItemIds(selectedOrder.items.map((i: any) => i.id));
    } else {
      setSelectedItemIds([]);
    }
  }, [selectedOrder, paymentMethod]);

  // คำนวณยอดเงินเฉพาะรายการที่ "ถูกเลือก (ติ๊กถูก)" เท่านั้น
  const originalTotal = useMemo(() => {
    if (!selectedOrder) return 0;
    return selectedOrder.items
      .filter((i: any) => selectedItemIds.includes(i.id))
      .reduce((sum: number, item: any) => sum + item.price, 0);
  }, [selectedOrder, selectedItemIds]);

  const discountAmount = parseFloat(discount) || 0;
  const finalTotal = Math.max(0, originalTotal - discountAmount);

  const change = parseFloat(cashReceived || "0") - finalTotal;
  const isCashSufficient = change >= 0;

  // ฟังก์ชันสำหรับสลับการเลือกรายการอาหาร
  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const toggleAutoPrint = () => {
    const newState = !isAutoPrint;
    setIsAutoPrint(newState);
    localStorage.setItem("receipt_auto_print", String(newState));
    toast.info(
      newState
        ? "เปิดใช้งาน: พิมพ์ใบเสร็จอัตโนมัติ"
        : "ปิดใช้งาน: พิมพ์ใบเสร็จอัตโนมัติ",
    );
  };

  const handleCheckMember = async () => {
    if (memberPhone.length < 9) {
      toast.warn("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
      return;
    }

    setIsLoadingMember(true);
    const result = await getMemberByPhone(memberPhone, organizationId);

    if (result && result.success) {
      setMemberData(result.data);
      toast.success("พบข้อมูลสมาชิก");
    } else {
      setMemberData(null);
      toast.error(result?.message || "ไม่พบข้อมูลสมาชิก");
    }
    setIsLoadingMember(false);
  };

  const handleNumpadClick = (value: string) => {
    if (value === "C") {
      setCashReceived("0");
    } else if (value === "BACKSPACE") {
      setCashReceived((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (value === ".") {
      if (!cashReceived.includes(".")) {
        setCashReceived((prev) => prev + ".");
      }
    } else {
      setCashReceived((prev) => (prev === "0" ? value : prev + value));
    }
  };

  const handleQuickAmount = (amount: number) => {
    setCashReceived((prev) => String((Number(prev) || 0) + amount));
  };

  const handleExactAmount = () => {
    if (selectedOrder) {
      setCashReceived(finalTotal.toString());
    }
  };

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

    initialItems.forEach((order: any) => {
      if (order.status !== "COMPLETED") {
        return;
      }

      const key =
        order.table?.tableName || order.tableId || `ORDER-${order.id}`;

      if (!groups[key]) {
        groups[key] = {
          id: key,
          firstOrderId: order.id,
          runningCode: order.order_running_code || "-",
          table: order.table?.tableName || "-",
          tableId: order.tableId,
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

      if (order.orderitems && Array.isArray(order.orderitems)) {
        order.orderitems.forEach((item: any) => {
          if (groups[key].items.length === 0 && item.menu?.unitPrice?.label) {
            groups[key].currency = item.menu.unitPrice.label;
          }

          let modifiersTotal = 0;

          const modifiersText = item.selectedModifiers
            ?.map((m: any) => {
              const price = m.price || 0;
              modifiersTotal += price;
              if (price > 0) {
                return `${m.modifierItem?.name} (+${price})`;
              }
              return m.modifierItem?.name;
            })
            .join(", ");

          const displayName = modifiersText
            ? `${item.menu?.menuName} (${modifiersText})`
            : item.menu?.menuName;

          const basePrice = item.menu?.price_sale || 0;
          const finalUnitPrice = basePrice + modifiersTotal;
          const totalPriceForItem = finalUnitPrice * item.quantity;
          groups[key].total += totalPriceForItem;

          groups[key].items.push({
            id: item.id,
            name: displayName,
            qty: item.quantity,
            img: item.menu?.img,
            price: totalPriceForItem,
            note: item.note || order.note || null,
            price_package: item.menu?.price_package || 0,
            orderId: order.id,
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
        order.runningCode.toLowerCase().includes(searchTerm.toLowerCase())),
  );

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
      const itemsToPrint = orderData.items.filter((i: any) =>
        selectedItemIds.includes(i.id),
      );

      const receiptData = {
        orderId: orderData.runningCode,
        table: orderData.table,
        date: new Date().toLocaleString("th-TH"),
        items: itemsToPrint.map((i: any) => ({
          name: i.name,
          quantity: i.qty,
          price: i.price,
        })),
        total: finalTotal,
        subTotal: originalTotal,
        discount: discountAmount,
        currency: orderData.currency,
        paymentMethod: paymentMethod,
        cashReceived:
          paymentMethod === "CASH" ? parseFloat(cashReceived) : undefined,
        change: paymentMethod === "CASH" ? change : undefined,
      };

      const result = await printReceiptQZ(
        receiptData,
        selectedPrinter,
        organizationId,
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
    if (selectedItemIds.length === 0) {
      toast.warn("กรุณาเลือกรายการที่ต้องการชำระเงิน");
      return;
    }

    if (paymentMethod === "CASH" && !isCashSufficient) {
      toast.error("ยอดเงินไม่เพียงพอ กรุณาตรวจสอบจำนวนเงิน");
      return;
    }

    if (paymentMethod === "MEMBER") {
      if (!memberData) {
        toast.warn("กรุณาตรวจสอบข้อมูลสมาชิกก่อนทำรายการ");
        return;
      }
      if (memberData.creditBalance < finalTotal) {
        toast.error("เครดิตร้านค้าของสมาชิกไม่เพียงพอ");
        return;
      }
    }

    setIsProcessing(true);
    const activeShift = await checkActiveShift(organizationId);

    if (!activeShift) {
      toast.error("กรุณาเปิดกะ (Shift) ก่อนรับชำระเงินครับ!");
      setIsProcessing(false);
      setShowOpenShiftModal(true);
      return;
    }

    // 🟢 ดึงเฉพาะ Order ID ของรายการที่คุณ "ติ๊กเลือก" เท่านั้น
    const paidOrderIds = selectedOrder.items
      .filter((i: any) => selectedItemIds.includes(i.id))
      .map((i: any) => i.orderId);

    const paymentPayload = {
      orderId: selectedOrder.runningCode,
      table: selectedOrder.table,
      tableId: selectedOrder.tableId,
      paymentMethod: paymentMethod,
      totalAmount: finalTotal,
      discount: discountAmount,
      createdById: employeeId,
      organizationId: organizationId,
      cashReceived:
        paymentMethod === "CASH" ? parseFloat(cashReceived) : finalTotal,
      change: paymentMethod === "CASH" ? change : 0,
      memberPhone: paymentMethod === "MEMBER" ? memberPhone : undefined,
      shiftId: activeShift.id,
      // 🟢 ส่ง Array ของ Order ID ไปให้หลังบ้านเปลี่ยนสถานะ
      paidOrderIds: Array.from(new Set(paidOrderIds)),
    };

    const create_status = await createPaymentOrder(paymentPayload);

    if (create_status.success) {
      try {
        const isPayingAllItems =
          selectedItemIds.length === selectedOrder.items.length;

        if (isPayingAllItems) {
          await updateStatusTable(selectedOrder.tableId, "AVAILABLE");
          toast.success("ชำระเงินครบถ้วน เคลียร์โต๊ะเรียบร้อย!");
        } else {
          toast.success(
            "ชำระเงินบางส่วนสำเร็จ! (รายการที่จ่ายแล้วจะถูกซ่อนไว้)",
          );
        }

        if (isAutoPrint) {
          handlePrintReceipt(selectedOrder);
        }

        setSelectedOrder(null);
        setSelectedItemIds([]);
        setCashReceived("0");
        setDiscount("0");
        router.refresh();
      } catch (updateError) {
        console.error("เกิดข้อผิดพลาดตอนอัปเดตสถานะ:", updateError);
        toast.error("บันทึกเงินสำเร็จ แต่อัปเดตสถานะโต๊ะล้มเหลว");
      }
    } else {
      toast.error(
        create_status.message || "ไม่สามารถบันทึกข้อมูลการรับเงินได้",
      );
    }

    setIsProcessing(false);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    try {
      for (const orderId of selectedOrder.allOrderIds) {
        await updateStatusOrder(orderId, "CANCELLED");
      }

      await updateStatusTable(selectedOrder.tableId, "AVAILABLE");

      toast.success("ยกเลิกบิลเรียบร้อยแล้ว");
      setSelectedOrder(null);
      router.refresh();
    } catch (error) {
      console.error("Cancel Order Error:", error);
      toast.error("ไม่สามารถยกเลิกบิลได้");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50/50 dark:bg-zinc-950 w-full overflow-hidden">
      {/* LEFT: Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0">
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

            <Button
              variant={isAutoPrint ? "default" : "outline"}
              size="icon"
              className={`h-10 w-10 rounded-xl transition-colors ${
                isAutoPrint
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                  : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              }`}
              onClick={toggleAutoPrint}
              title={
                isAutoPrint
                  ? "เปิดใช้งาน: พิมพ์ใบเสร็จอัตโนมัติ"
                  : "ปิดใช้งาน: พิมพ์ใบเสร็จอัตโนมัติ"
              }
            >
              <Printer className="h-5 w-5" />
            </Button>

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

      <AnimatePresence mode="wait">
        {selectedOrder && (
          <motion.div
            key="payment-sidebar"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="
              fixed inset-y-0 right-0 z-50 w-full sm:w-[500px]
              bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl
              flex flex-col
            "
          >
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
                    ชำระเงิน (แยกจ่ายได้)
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

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-5 space-y-5 pb-10">
                <div className="text-center relative pt-2 pb-4">
                  <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-900 rounded-3xl -z-10 transform -skew-y-2" />
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mb-1">
                    ยอดที่เลือกชำระ (Total)
                  </p>
                  <div className="flex flex-col items-center justify-center gap-1 text-zinc-900 dark:text-white">
                    {discountAmount > 0 && (
                      <span className="text-sm text-zinc-400 line-through decoration-red-500">
                        {originalTotal.toLocaleString()}
                      </span>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black tracking-tighter">
                        {finalTotal.toLocaleString()}
                      </span>
                      <span className="text-lg font-medium text-zinc-400">
                        {selectedOrder.currency}
                      </span>
                    </div>
                  </div>
                </div>

                <PaymentMethodsPanel
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  qrType={qrType}
                  setQrType={setQrType}
                  finalTotal={finalTotal}
                  change={change}
                  cashReceived={cashReceived}
                  setCashReceived={setCashReceived}
                  discount={discount}
                  setDiscount={setDiscount}
                  memberPhone={memberPhone}
                  setMemberPhone={setMemberPhone}
                  currency={selectedOrder.currency}
                  handleNumpadClick={handleNumpadClick}
                  handleExactAmount={handleExactAmount}
                  handleQuickAmount={handleQuickAmount}
                  memberData={memberData}
                  setMemberData={setMemberData}
                  isLoadingMember={isLoadingMember}
                  handleCheckMember={handleCheckMember}
                />

                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">
                      เลือกรายการอาหารที่ต้องการจ่าย
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px]"
                        onClick={() =>
                          setSelectedItemIds(
                            selectedOrder.items.map((i: any) => i.id),
                          )
                        }
                      >
                        เลือกทั้งหมด
                      </Button>
                      <Badge
                        variant="secondary"
                        className="text-[9px] h-6 flex items-center justify-center"
                      >
                        เลือก {selectedItemIds.length}/
                        {selectedOrder.items.length}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar border rounded-xl p-2 bg-zinc-50 dark:bg-zinc-900/50">
                    {selectedOrder.items.map((item: any, idx: number) => {
                      const isChecked = selectedItemIds.includes(item.id);
                      return (
                        <div
                          key={item.id || idx}
                          onClick={() => toggleItemSelection(item.id)}
                          className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all ${
                            isChecked
                              ? "bg-white dark:bg-zinc-800 shadow-sm border border-emerald-500/30"
                              : "hover:bg-white dark:hover:bg-zinc-800 opacity-60"
                          }`}
                        >
                          <div className="flex gap-3 items-center">
                            {isChecked ? (
                              <CheckSquare className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Square className="h-5 w-5 text-zinc-300" />
                            )}
                            <Avatar className="h-8 w-8 rounded-md border border-zinc-100 shadow-sm">
                              <AvatarImage
                                src={item.img || "/placeholder.png"}
                                className="object-cover"
                              />
                              <AvatarFallback>IMG</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <p
                                className={`text-xs font-semibold ${isChecked ? "text-zinc-900 dark:text-white" : "text-zinc-500"}`}
                              >
                                {item.name}
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                x{item.qty}
                              </p>
                              {item.note && (
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 leading-tight">
                                  * {item.note}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-xs font-medium ${isChecked ? "text-zinc-900 dark:text-white" : "text-zinc-500"}`}
                          >
                            {item.note && item.price_package
                              ? item.price_package.toLocaleString()
                              : item.price.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 shrink-0 z-10">
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-12 h-12 shrink-0 rounded-xl border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                      disabled={isProcessing}
                      title="ยกเลิกบิลนี้"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>ต้องการยกเลิกบิลนี้?</AlertDialogTitle>
                      <AlertDialogDescription>
                        การกระทำนี้จะเปลี่ยนสถานะรายการอาหารในบิลนี้เป็น{" "}
                        <strong className="text-red-500">"ยกเลิก"</strong>{" "}
                        ทั้งหมด และเปลี่ยนโต๊ะเป็นสถานะ <strong>"ว่าง"</strong>{" "}
                        คุณไม่สามารถย้อนกลับได้
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ปิด</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleCancelOrder}
                      >
                        ยืนยันการยกเลิก
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="flex-1 h-12 text-base font-bold rounded-xl shadow-lg shadow-zinc-900/10"
                      disabled={
                        selectedItemIds.length === 0 ||
                        (paymentMethod === "CASH" && !isCashSufficient) ||
                        isProcessing ||
                        (paymentMethod === "MEMBER" &&
                          (!memberData ||
                            memberData.creditBalance < finalTotal))
                      }
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          กำลังชำระเงิน...
                        </>
                      ) : (
                        <>
                          {selectedItemIds.length < selectedOrder.items.length
                            ? "ชำระเงินบางส่วน"
                            : "ยืนยันการชำระเงิน"}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>ยืนยันการชำระเงิน?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {selectedItemIds.length < selectedOrder.items.length
                          ? `คุณกำลังชำระเงินแยกจ่าย (${selectedItemIds.length} รายการ) ระบบจะบันทึกยอดเงิน แต่โต๊ะจะยังไม่ว่างจนกว่าจะจ่ายครบ`
                          : `ระบบจะทำการบันทึกยอดเงินและเปลี่ยนสถานะโต๊ะเป็น "ว่าง" ทันที`}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedOrder && (
        <div className="hidden lg:flex w-[500px] border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 items-center justify-center flex-col text-zinc-400">
          <Receipt className="h-16 w-16 mb-4 opacity-20" />
          <p>เลือกรายการทางซ้ายเพื่อชำระเงิน</p>
        </div>
      )}

      <OpenShiftModal
        isOpen={showOpenShiftModal}
        organizationId={organizationId}
        employeeId={Number(employeeId)}
        employeeName={employeeName || "พนักงานทั่วไป"}
        onSuccess={() => {
          setShowOpenShiftModal(false);
          window.dispatchEvent(new Event("shift-updated"));
          toast.info("เปิดกะเรียบร้อยแล้ว กรุณากดยืนยันการชำระเงินอีกครั้ง");
        }}
        onClose={() => {
          setShowOpenShiftModal(false);
          window.dispatchEvent(new Event("shift-updated"));
        }}
      />
    </div>
  );
};

export default PaymentStatusPage;
