"use client";

import { KitchecOrderList } from "@/lib/type";
import KitchenTicket from "./KitchenTicket";

const KitchecPage = ({ initialItems }: KitchecOrderList) => {

  const onStatusChange = (idOrder: number, status: string) => {};

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
      {initialItems.map((order) => (
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
