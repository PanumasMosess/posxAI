"use client";

import { KitchecOrderList } from "@/lib/type";
import KitchenTicket from "./KitchenTicket";
import { useRouter } from "next/navigation";
import { updateStatusOrder } from "@/lib/actions/actionMenu";

const KitchecPage = ({ initialItems }: KitchecOrderList) => {
  const router = useRouter();
  const onStatusChange = async (idOrder: number, status: string) => {
    const result = await updateStatusOrder(idOrder, status);

    if (result.success) {
      router.refresh();
    }
  };

  const activeOrders = initialItems.filter(
    (item) => !["COMPLETED", "CANCELLED"].includes(item.status)
  );

  const inActiveOrders = initialItems.filter((item) =>
    ["COMPLETED", "CANCELLED"].includes(item.status)
  );


  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
      {activeOrders.map((order) => (
        <KitchenTicket
          key={order.id}
          initialItems={order}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default KitchecPage;
