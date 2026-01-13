"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  MoreHorizontal,
  PlayCircle,
  BellRing,
  ChefHat,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ConfigStyle from "@/lib/data_temp";
import { KitchenOrder, StatusTableProps } from "@/lib/type";

export default function OrderStatusPage({
  initialItems = [],
  userId,
  organizationId,
  relatedData,
}: StatusTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  const allOrders = relatedData?.orderRunning || [];

  const filteredOrders =
    filter === "ALL" ? allOrders : allOrders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen p-6 md:p-8 font-sans">
      <div className="flex flex-col sm:flex-row items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            รายการสถานะในครัว
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredOrders.length} active
          </p>
        </div>

        <div className="flex p-1 bg-background/50 rounded-lg border shadow-sm backdrop-blur-sm overflow-x-auto">
          {["ALL", "NEW", "PREPARING", "COOKING", "READY"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap",
                filter === status
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {status === "ALL" ? "All Status" : status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
        {filteredOrders.map((order) => {
          const styles = ConfigStyle.getStatusStylesCardDashboard(order.status);
          const Icon = styles.icon || MoreHorizontal;

          const startTime = new Date(order.createdAt);
          const elapsedMins = Math.floor(
            (new Date().getTime() - startTime.getTime()) / 60000
          );

          const isLate =
            elapsedMins > 20 &&
            order.status !== "COMPLETED" &&
            order.status !== "READY" &&
            order.status !== "CANCELLED";

          return (
            <div
              key={order.id}
              className={cn(
                "relative flex flex-col rounded-xl border-2 transition-all duration-300",
                "bg-primary-foreground text-primary",
                styles.cardBorder,
                isLate ? "!border-red-500 ring-2 ring-red-500/20" : ""
              )}
            >
              <div className="p-5 pb-3 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1 block">
                    {order.order_running_code ? "Ticket No." : "Table"}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight leading-none text-foreground truncate max-w-[140px]">
                    {order.order_running_code ||
                      order.table?.tableName ||
                      `Order #${order.id}`}
                  </h3>
                  {order.order_running_code && (
                    <span className="text-xs text-muted-foreground mt-1 block">
                      Table: {order.table?.tableName}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                      styles.badge
                    )}
                  >
                    {order.status === "COOKING" ? (
                      <Icon className="w-3 h-3 animate-spin" />
                    ) : (
                      <Icon className="w-3 h-3" />
                    )}
                    {styles.label}
                  </div>

                  <div
                    className={cn(
                      "text-[10px] font-mono font-medium flex items-center gap-1.5",
                      isLate
                        ? "text-red-500 font-bold"
                        : "text-muted-foreground"
                    )}
                  >
                    <Clock className="w-3 h-3 opacity-70" />
                    {elapsedMins}m
                  </div>
                </div>
              </div>

              <div className="w-full px-5">
                <div className="h-px w-full bg-border/40 border-b border-dashed border-border/60 my-2" />
              </div>

              <div className="px-5 pt-1 pb-2 h-[160px] overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {order.orderitems && order.orderitems.length > 0 ? (
                  order.orderitems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 group pr-2"
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded-md bg-muted text-[11px] font-bold text-muted-foreground shrink-0 mt-0.5">
                        {item.quantity}
                      </div>

                      <div className="flex flex-col w-full">
                        <div className="flex justify-between items-start w-full">
                          <span
                            className={cn(
                              "text-sm font-medium leading-snug",
                              order.status === "COMPLETED"
                                ? "text-muted-foreground line-through"
                                : "text-foreground/90"
                            )}
                          >
                            {item.menu.menuName}
                          </span>
                        </div>
                        {item.menu.unitPrice?.label && (
                          <span className="text-[10px] text-muted-foreground">
                            ({item.menu.unitPrice.label})
                          </span>
                        )}

                        {item.selectedModifiers &&
                          item.selectedModifiers.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedModifiers.map((mod) => (
                                <span
                                  key={mod.id}
                                  className="text-[10px] text-orange-600 bg-orange-50 px-1.5 rounded-sm"
                                >
                                  + {mod.modifierItem.name}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No items
                  </div>
                )}
              </div>

              {/* <div className="p-4 pt-0 mt-auto border-t border-transparent">
                {order.status === "READY" ? (
                  <Button className="w-full h-9 rounded-lg text-xs font-bold shadow-none bg-emerald-600 hover:bg-emerald-700 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                    Complete
                  </Button>
                ) : order.status === "NEW" ? (
                  <Button className="w-full h-9 rounded-lg text-xs font-bold shadow-none bg-blue-600 hover:bg-blue-700 text-white">
                    <PlayCircle className="w-3.5 h-3.5 mr-2" />
                    Start Cooking
                  </Button>
                ) : order.status === "COMPLETED" ? (
                  <div className="w-full h-9 flex items-center justify-center text-xs text-muted-foreground font-medium bg-muted/50 rounded-lg">
                    History
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full h-9 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                )}
              </div> */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
