"use client";

import { KitchecOrderList } from "@/lib/type";
import KitchenTicket from "./KitchenTicket";
import { useRouter } from "next/navigation";
import { updateStatusOrder } from "@/lib/actions/actionMenu";
import { UtensilsCrossed } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

const KitchecPage = ({
  initialItems,
  id_user,
  organizationId,
}: KitchecOrderList) => {
  const router = useRouter();

  const activeOrders = initialItems.filter(
    (order) =>
      !["COMPLETED", "CANCELLED", "PAY_COMPLETED"].includes(order.status)
  );

  const prevOrderCountRef = useRef(activeOrders.length);

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

  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: any } = {};

    activeOrders.forEach((order) => {
      order.orderitems.forEach((item) => {
        const modifierKey = item.selectedModifiers
          .map((m) => m.modifierItem.name)
          .sort()
          .join("|");

        const groupKey = `${item.menu.menuName}-${order.status}-${modifierKey}`;

        if (!groups[groupKey]) {
          groups[groupKey] = {
            menu: item.menu,
            status: order.status,
            modifiers: item.selectedModifiers,
            totalQuantity: 0,
            orders: [],
            orderIds: [],
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
        });
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

  useEffect(() => {
    if (activeOrders.length > prevOrderCountRef.current) {
      playSound();
    }
    prevOrderCountRef.current = activeOrders.length;
  }, [activeOrders]);

  const playSound = () => {
    try {
      const audio = new Audio(
        "https://tvposx.sgp1.cdn.digitaloceanspaces.com/uploads/sound/notification-aero.mp3"
      );

      audio.play().catch((error) => {
        console.error("Autoplay prevented. User interaction required:", error);
      });
    } catch (e) {
      console.error("Error playing sound", e);
    }
  };

  return (
    <div className="flex flex-col gap-4">
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
          groupedOrders.map((group: any, index: number) => (
            <KitchenTicket
              key={`${group.menu.menuName}-${group.status}-${index}`}
              initialItems={group}
              onStatusChange={onStatusChange}
              isGrouped={true}
              id_user={id_user}
              organizationId={organizationId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KitchecPage;
