"use client";

import { Button } from "@/components/ui/button";
import {
  Check,
  UtensilsCrossed,
  Flame,
  PackageOpen,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import statusColorList from "@/lib/data_temp";
import { KitchecTicketProps } from "@/lib/type";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
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


const KitchenTicket = ({
  initialItems: order,
  onStatusChange,
}: KitchecTicketProps) => {
  const { nextStatus, label: buttonLabel } = statusColorList.getNextStepConfig(
    order.status
  );
  const statusBadge = statusColorList.getStatusBadgeConfig(order.status);
  return (
    <Card
      key={order.id}
      className={`
   w-full p-0 
    rounded-xl overflow-hidden
    border
    bg-white dark:bg-zinc-900 
    text-zinc-950 dark:text-zinc-50 
    transition-all duration-300 ease-in-out
    hover:shadow-lg hover:-translate-y-1
    ${statusColorList.statusColor(order.status)}
  `}
    >
      <CardHeader className="flex flex-row justify-between items-start px-4 pt-5 pb-2">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
            Table No.
          </span>
          <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 leading-none mt-1">
            {order.table.tableName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`
        px-2 py-1 rounded-md text-[10px] font-bold border 
        ${statusBadge.color}
      `}
          >
            {statusBadge.label}
          </span>

          <AlertDialog>
            {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
              <AlertDialogTrigger asChild>
                <button
                  className="
                p-1.5 rounded-full 
                text-zinc-400 hover:text-red-500 
                hover:bg-red-50 dark:hover:bg-red-900/20
                transition-all duration-200
                border border-transparent hover:border-red-200 dark:hover:border-red-800
              "
                  title="ยกเลิกรายการ"
                >
                  <X className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
            )}

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
                  onClick={() => onStatusChange(order.id, "CANCELLED")}
                >
                  ยืนยันการลบ
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
            <Clock className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <span className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-300">
              10:00
            </span>
          </div> */}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 overflow-hidden">
            <Avatar className="h-16 w-16 rounded-lg shadow-sm border border-border/50 flex-shrink-0">
              <AvatarImage
                src={order.menu.img || "/placeholder-menu.png"}
                alt={order.menu.menuName}
                className="object-cover"
              />
              <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium rounded-lg">
                {order.menu.menuName?.slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col justify-center min-h-[64px] space-y-1">
              <span className="text-lg font-bold text-foreground leading-tight line-clamp-2">
                {order.menu.menuName}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">
                  {order.menu.unitPrice.label}
                </span>
                <span>
                  @ {(order.price_sum / order.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-lg h-16 w-14 flex-shrink-0 border border-primary/20">
            <span className="text-xs font-medium uppercase tracking-wider opacity-70">
              QTY
            </span>
            <span className="text-2xl font-extrabold leading-none">
              {order.quantity}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-dashed border-border/60">
          <span className="text-sm text-muted-foreground font-medium">
            Total Amount
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">
              {order.price_sum?.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground font-medium uppercase">
              {order.menu.unitPrice.label}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2">
        {nextStatus ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className={`
        w-full h-10 rounded-lg text-sm font-semibold
        transition-all duration-200
        active:scale-[0.98]
        ${statusColorList.getButtonActionColor(order.status)}
      `}
              >
                <div className="flex items-center justify-center gap-2">
                  {order.status === "NEW" && (
                    <UtensilsCrossed className="h-4 w-4" />
                  )}
                  {order.status === "PREPARING" && (
                    <PackageOpen className="h-4 w-4" />
                  )}
                  {order.status === "COOKING" && <Flame className="h-4 w-4" />}
                  {order.status === "READY" && <Check className="h-4 w-4" />}

                  {buttonLabel}
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
                  onClick={() => onStatusChange(order.id, nextStatus)}
                >
                  ยืนยันการลบ
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <div className="w-full h-10 flex items-center justify-center text-sm text-zinc-400 font-medium bg-zinc-100 rounded-lg dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed">
            {order.status === "CANCELLED" ? "ยกเลิกแล้ว" : "เสร็จสิ้นกระบวนการ"}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default KitchenTicket;
