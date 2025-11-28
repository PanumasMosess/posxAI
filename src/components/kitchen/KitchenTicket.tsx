"use client";

import { Button } from "@/components/ui/button";
import {
  Check,
  UtensilsCrossed,
  Flame,
  PackageOpen,
  X,
  Layers,
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
import { KitchecTicketProps } from "@/lib/type";

const KitchenTicket = ({
  initialItems: group,
  onStatusChange,
  isGrouped = false,
}: KitchecTicketProps) => {
  const { nextStatus, label: buttonLabel } = statusColorList.getNextStepConfig(
    group.status
  );
  const statusBadge = statusColorList.getStatusBadgeConfig(group.status);

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
        <div className="flex flex-col max-w-[70%]">
          {(group.orders?.length || 0) > 1 && (
            <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 mb-1">
              <Layers className="h-3 w-3" /> GROUPED ({group.orders?.length})
            </span>
          )}
          <span className="text-lg font-bold leading-tight line-clamp-2">
            {group.menu.menuName}
          </span>
        </div>
        <Badge variant="outline" className={`${statusBadge.color} border`}>
          {statusBadge.label}
        </Badge>
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
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  {subOrder.tableName}
                </span>
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
                  ยืนยันการลบ
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
