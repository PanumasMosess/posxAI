"use client";

import { KitchecOrderList } from "@/lib/type";
import KitchenTicket from "./KitchenTicket";
import { useRouter } from "next/navigation";
import { updateStatusOrder } from "@/lib/actions/actionMenu";
import { UtensilsCrossed } from "lucide-react";
import { useEffect, useMemo } from "react";

const KitchecPage = ({ initialItems }: KitchecOrderList) => {
  const router = useRouter();

  const onStatusChange = async (idOrder: number | number[], status: string) => {
    if (Array.isArray(idOrder)) {
      for (const id of idOrder) {
        await updateStatusOrder(id, status);
      }
    } else {
      await updateStatusOrder(idOrder, status);
    }
    router.refresh();
  };

  const activeOrders = initialItems.filter(
    (item) => !["COMPLETED", "CANCELLED", "PAY_COMPLETED"].includes(item.status)
  );

  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: any } = {};

    activeOrders.forEach((order: any) => {
      const key = `${order.menu.id}-${order.status}`;
      if (!groups[key]) {
        groups[key] = {
          ...order,
          totalQuantity: 0,
          orders: [],
          orderIds: [],
        };
      }

      groups[key].totalQuantity += order.quantity;

      groups[key].orderIds.push(order.id);

      groups[key].orders.push({
        id: order.id,
        tableName: order.table.tableName,
        quantity: order.quantity,
        status: order.status,
        order_running_code: order.order_running_code,
      });
    });

    return Object.values(groups);
  }, [activeOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
      {activeOrders.length === 0 ? (
        <div className="col-span-full flex justify-center p-8">
          <div
            className="
                      flex flex-col items-center justify-center 
                      text-center space-y-4 
                      border-2 border-dashed border-zinc-200 dark:border-zinc-800 
                      rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50
                      w-full max-w-md 
                      py-16          
                      mx-auto"
          >
            <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <UtensilsCrossed className="h-10 w-10 text-zinc-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-zinc-600 dark:text-zinc-400">
                ไม่มีรายการอาหาร
              </h3>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                รอรับออเดอร์ใหม่...
              </p>
            </div>
          </div>
        </div>
      ) : (
        groupedOrders.map((group: any) => (
          <KitchenTicket
            key={`${group.menu.id}-${group.status}`}
            initialItems={group}
            onStatusChange={onStatusChange}
            isGrouped={true}
          />
        ))
      )}
    </div>
  );
};

export default KitchecPage;
