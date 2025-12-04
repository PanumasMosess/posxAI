"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  QrCode,
  Receipt,
  Clock,
  Users,
  ChevronRight,
  Utensils,
  Search,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { KitchecOrderList } from "@/lib/type";
import PaymentOption from "./PaymentOption";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import {
  createPaymentOrder,
  updateStatusOrder,
  updateStatusTable,
} from "@/lib/actions/actionPayment";
import { useRouter } from "next/navigation";

const PaymentPage = ({ initialItems }: KitchecOrderList) => {
  const session = useSession();
  const id_user = session.data?.user.id || "1";
  const router = useRouter();
  const organizationId = session.data?.user.organizationId;
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"QR" | "CASH" | "CARD">(
    "CASH"
  );
  const [cashReceived, setCashReceived] = useState("0");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCashReceived("0");
  }, [selectedOrder]);

  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: any } = {};

    initialItems.forEach((item: any) => {
      const key = item.order_running_code || `TABLE-${item.table.id}`;

      if (!groups[key]) {
        groups[key] = {
          id: key,
          runningCode: item.order_running_code || "-",
          table: item.table.tableName,
          tableId: item.table.id,
          guests: 0,
          time: new Date(item.createdAt).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          total: 0,
          items: [],
          currency: item.menu.unitPrice.label,
        };
      }

      groups[key].items.push({
        id: item.id,
        name: item.menu.menuName,
        qty: item.quantity,
        price:
          item.price_sum > 0
            ? item.price_sum
            : item.menu.price_sale * item.quantity,
        img: item.menu.img,
      });

      groups[key].total +=
        item.price_sum > 0
          ? item.price_sum
          : item.menu.price_sale * item.quantity;
    });

    return Object.values(groups);
  }, [initialItems]);

  const filteredOrders = groupedOrders.filter(
    (order: any) =>
      order.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.runningCode &&
        order.runningCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalAmount = selectedOrder ? selectedOrder.total : 0;
  const change = parseFloat(cashReceived || "0") - totalAmount;
  const isCashSufficient = change >= 0;

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
      createdById: parseInt(id_user),
      organizationId: organizationId,
      cashReceived:
        paymentMethod === "CASH" ? parseFloat(cashReceived) : totalAmount,
      change: paymentMethod === "CASH" ? change : 0,
    };

    const create_status = await createPaymentOrder(paymentPayload);

    if (create_status.success) {
      await updateStatusOrder(selectedOrder.id, "PAY_COMPLETED");
      await updateStatusTable(selectedOrder.tableId, "AVAILABLE");
      toast.success("ชำระเงินเรียบร้อย!");
      setSelectedOrder(null);
      router.refresh();
    } else {
      throw new Error("ไม่สามารถอัปเดตฐานข้อมูลได้");
    }
    // console.log("ข้อมูลการชำระเงินที่ได้:", paymentPayload);
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative">
      <div className="flex-1 p-4 md:p-6 flex flex-col w-full max-w-[1600px] mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              รอชำระเงิน
            </h1>
            <p className="text-zinc-500 text-xs md:text-sm">
              เลือกรายการเพื่อดำเนินการชำระเงิน
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="ค้นหาโต๊ะ หรือ รหัสบิล..."
              className="pl-9 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
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
        </div>

        <ScrollArea className="flex-1 -mr-4 pr-4">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
              <Search className="h-12 w-12 mb-4 opacity-20" />
              <p>ไม่พบรายการที่ค้นหา "{searchTerm}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-20 lg:pb-10">
              {filteredOrders.map((order: any) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full"
                  >
                    <Card
                      onClick={() => setSelectedOrder(order)}
                      className={`
    cursor-pointer border transition-all duration-200 h-full flex flex-col justify-between
    ${
      isSelected
        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-900/20 dark:border-blue-400 dark:ring-blue-400 shadow-md"
        : "border-zinc-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-800"
    }
  `}
                    >
                      <CardHeader className="p-4 flex flex-row justify-between items-start space-y-0 pb-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                            Table
                          </span>
                          <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                            {order.table}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono mt-1">
                            {order.runningCode}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 font-normal"
                        >
                          <Clock className="h-3 w-3 mr-1" /> {order.time}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center text-xs text-zinc-500 mb-4">
                          <Utensils className="h-3 w-3 mr-1" />{" "}
                          {order.items.length} รายการ
                        </div>
                        <div className="flex justify-between items-end pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                          <span className="text-sm font-medium text-zinc-500">
                            ยอดรวม
                          </span>
                          <span className="text-xl font-bold text-zinc-900 dark:text-white">
                            {order.total.toLocaleString()}{" "}
                            <span className="text-sm font-normal text-zinc-500">
                              {order.currency}
                            </span>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      <AnimatePresence mode="wait">
        {selectedOrder && (
          <motion.div
            key="payment-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 w-full h-full bg-white dark:bg-zinc-900 lg:static lg:w-[420px] lg:h-full lg:border-l lg:border-zinc-200 lg:dark:border-zinc-800 lg:shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 md:p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden -ml-2 text-zinc-500"
                  onClick={() => setSelectedOrder(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="text-lg font-bold">ชำระเงิน</h2>
                    <Badge className="bg-zinc-900 text-white dark:bg-white dark:text-black">
                      โต๊ะ {selectedOrder.table}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">
                    {selectedOrder.runningCode}
                  </p>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 md:p-6 space-y-6">
                  <div className="text-center py-4">
                    <p className="text-sm text-zinc-500 font-medium mb-1">
                      ยอดสุทธิ
                    </p>
                    <div className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                      {selectedOrder.total.toLocaleString()}{" "}
                      <span className="text-lg text-zinc-400">
                        {selectedOrder.currency}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <PaymentOption
                      icon={QrCode}
                      label="QR"
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
                      label="บัตร"
                      active={paymentMethod === "CARD"}
                      onClick={() => setPaymentMethod("CARD")}
                      disabled={true}
                    />
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800 transition-all duration-300">
                    {paymentMethod === "QR" && (
                      <div className="flex flex-col items-center justify-center space-y-4 py-2">
                        <div className="bg-white p-3 rounded-xl shadow-sm border">
                          <div className="w-40 h-40 bg-zinc-200 rounded-lg animate-pulse flex items-center justify-center text-zinc-400 text-xs">
                            QR Code
                          </div>
                        </div>
                        <p className="text-sm text-zinc-500">
                          สแกนเพื่อชำระเงิน
                        </p>
                      </div>
                    )}

                    {paymentMethod === "CASH" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium pl-1 text-zinc-600 dark:text-zinc-400">
                            รับเงินมา
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="text-right text-xl h-12 pr-12 font-bold bg-white dark:bg-zinc-950"
                              value={cashReceived}
                              onChange={(e) => setCashReceived(e.target.value)}
                              onFocus={(e) => e.target.select()}
                              autoFocus
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">
                              {selectedOrder.currency}
                            </span>
                          </div>
                        </div>
                        <Separator className="bg-zinc-200 dark:bg-zinc-700" />
                        <div className="flex justify-between items-center px-1">
                          <span className="text-sm text-zinc-500">เงินทอน</span>
                          <span
                            className={`text-xl font-bold ${
                              change < 0 ? "text-red-500" : "text-emerald-600"
                            }`}
                          >
                            {change >= 0 ? `${change.toLocaleString()}` : "-"}
                          </span>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "CARD" && (
                      <div className="flex flex-col items-center justify-center py-8 text-zinc-400 space-y-2">
                        <CreditCard className="h-10 w-10 opacity-50" />
                        <p className="text-sm">เสียบบัตรที่เครื่อง EDC</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase mb-3">
                      รายการอาหาร
                    </p>
                    <div className="space-y-3 border rounded-xl p-4">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-start text-sm"
                        >
                          <div className="flex gap-3">
                            <Avatar className="h-10 w-10 rounded-md border border-zinc-100">
                              <AvatarImage
                                src={item.img || "/placeholder.png"}
                                className="object-cover"
                              />
                              <AvatarFallback>IMG</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                                {item.name}
                              </p>
                              <p className="text-xs text-zinc-400">
                                x{item.qty}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {item.price.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 md:p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 pb-safe">
                <Button
                  className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-zinc-900/10"
                  onClick={handlePayment}
                  disabled={paymentMethod === "CASH" && !isCashSufficient}
                >
                  ยืนยันการชำระเงิน
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedOrder && (
        <div className="hidden lg:flex w-[420px] border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 items-center justify-center flex-col text-zinc-400">
          <Receipt className="h-16 w-16 mb-4 opacity-20" />
          <p>เลือกรายการทางซ้ายเพื่อชำระเงิน</p>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
