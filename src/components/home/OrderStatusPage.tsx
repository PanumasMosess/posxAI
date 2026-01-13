"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  MoreHorizontal,
  PlayCircle,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ConfigStyle from "@/lib/data_temp";
import {  StatusTableProps } from "@/lib/type";

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

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const allOrders = relatedData?.orderRunning || [];
  const filteredOrders =
    filter === "ALL"
      ? allOrders
      : allOrders.filter((o) => o.status === filter);

  return (
    <div className="w-full h-full font-sans space-y-4">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              สถานะครัว
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw
                className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
              />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {filteredOrders.length} active
          </p>
        </div>

        <div className="flex p-1 bg-background rounded-md border shadow-sm overflow-x-auto max-w-full">
          {["ALL", "NEW", "COOKING", "READY"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-3 py-1 text-[10px] font-semibold rounded-sm transition-all whitespace-nowrap",
                filter === status
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {status === "ALL" ? "All" : status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4 items-start">
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
                "relative flex flex-col rounded-lg border transition-all duration-300 shadow-sm",
                "bg-background text-foreground", 
                styles.cardBorder,
                isLate ? "!border-red-500 ring-1 ring-red-500/20" : "border-border"
              )}
            >
  
              <div className="p-4 pb-2 flex justify-between items-start">
                <div className="min-w-0"> 
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
                    {order.order_running_code ? "Ticket" : "Table"}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-bold leading-none truncate" title={order.order_running_code || ""}>
                         {order.order_running_code || `Order #${order.id}`}
                    </h3>
                  </div>
                  {order.table?.tableName && (
                     <span className="text-xs text-muted-foreground mt-1 block truncate">
                        Table: {order.table.tableName}
                     </span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border",
                      styles.badge
                    )}
                  >
                    {order.status === "COOKING" ? (
                      <Icon className="w-2.5 h-2.5 animate-spin" />
                    ) : (
                      <Icon className="w-2.5 h-2.5" />
                    )}
                    {styles.label}
                  </div>
                  <div
                    className={cn(
                      "text-[10px] font-mono font-medium flex items-center gap-1",
                      isLate ? "text-red-500 font-bold" : "text-muted-foreground"
                    )}
                  >
                    <Clock className="w-3 h-3 opacity-70" />
                    {elapsedMins}m
                  </div>
                </div>
              </div>

              <div className="w-full px-4">
                <div className="h-px w-full bg-border/40 border-b border-dashed border-border/60 my-2" />
              </div>
              <div className="px-4 pt-0 pb-2 h-[140px] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {order.orderitems && order.orderitems.length > 0 ? (
                  order.orderitems.map((item) => (
                    <div key={item.id} className="flex items-start gap-2.5 group pr-1">
                      <div className="flex items-center justify-center w-4 h-4 rounded-[4px] bg-muted text-[10px] font-bold text-muted-foreground shrink-0 mt-0.5">
                        {item.quantity}
                      </div>

                      <div className="flex flex-col min-w-0 w-full">
                        <div className="flex justify-between items-start w-full gap-2">
                          <span
                            className={cn(
                              "text-sm font-medium leading-tight truncate",
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

                        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedModifiers.map((mod) => (
                                <span
                                  key={mod.id}
                                  className="text-[9px] text-orange-600 bg-orange-50 px-1 rounded-sm whitespace-nowrap"
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
                    Empty
                  </div>
                )}
              </div>

              <div className="p-3 pt-0 mt-auto border-t border-transparent">
                {order.status === "READY" ? (
                  <Button className="w-full h-8 rounded-md text-xs font-bold shadow-none bg-emerald-600 hover:bg-emerald-700 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                    Complete
                  </Button>
                ) : order.status === "NEW" ? (
                  <Button className="w-full h-8 rounded-md text-xs font-bold shadow-none bg-blue-600 hover:bg-blue-700 text-white">
                    <PlayCircle className="w-3.5 h-3.5 mr-2" />
                    Cooking
                  </Button>
                ) : order.status === "COMPLETED" ? (
                  <div className="w-full h-8 flex items-center justify-center text-xs text-muted-foreground font-medium bg-muted/30 rounded-md">
                    Done
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full h-8 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}