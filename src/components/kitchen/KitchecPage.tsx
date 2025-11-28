"use client";

import { KitchecOrderList } from "@/lib/type";
import KitchenTicket from "./KitchenTicket";
import { useRouter } from "next/navigation";
import { updateStatusOrder } from "@/lib/actions/actionMenu";
import { UtensilsCrossed } from "lucide-react";
import { useMemo } from "react";

const KitchecPage = ({ initialItems }: KitchecOrderList) => {
  const router = useRouter();
  // 1. ฟังก์ชันเปลี่ยนสถานะ (รองรับทั้งแบบ ID เดียว และ Array ของ ID)
  const onStatusChange = async (idOrder: number | number[], status: string) => {
    if (Array.isArray(idOrder)) {
      // ถ้าส่งมาเป็นกลุ่ม (Array) ให้วนลูปอัปเดตทีละตัว
      // (หมายเหตุ: ถ้า Server Action รองรับ updateMany จะดีกว่านี้มาก)
      for (const id of idOrder) {
        await updateStatusOrder(id, status);
      }
    } else {
      await updateStatusOrder(idOrder, status);
    }
    router.refresh();
  };

  // 2. กรองเอาเฉพาะออเดอร์ที่ยังไม่จบ
  const activeOrders = initialItems.filter(
    (item) => !["COMPLETED", "CANCELLED"].includes(item.status)
  );

  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: any } = {};

    activeOrders.forEach((order: any) => {
      // สร้าง Key โดยใช้ MenuID + Status
      // (ต้องแยก Status ด้วย ไม่งั้นของใหม่จะไปปนกับของที่กำลังทำ)
      const key = `${order.menu.id}-${order.status}`;

      if (!groups[key]) {
        // ถ้ายังไม่มีกลุ่มนี้ ให้เริ่มตั้งต้นด้วยข้อมูลของออเดอร์แรกที่เจอ
        groups[key] = {
          ...order, // เอาข้อมูลพื้นฐานมา (ชื่อเมนู, รูปภาพ)
          totalQuantity: 0, // ตัวนับจำนวนรวม
          orders: [], // เก็บรายการย่อยข้างใน (เผื่ออยากดูแยกโต๊ะ)
          orderIds: [], // เก็บ ID ทั้งหมดไว้สำหรับกดปุ่มทีเดียว
        };
      }

      // บวกจำนวนเพิ่ม
      groups[key].totalQuantity += order.quantity;

      // เก็บ ID เข้ากองกลาง
      groups[key].orderIds.push(order.id);

      // เก็บรายละเอียดแยกย่อย (เช่น โต๊ะนี้สั่งกี่จาน)
      groups[key].orders.push({
        id: order.id,
        tableName: order.table.tableName,
        quantity: order.quantity,
        status: order.status,
      });
    });

    // แปลง Object กลับเป็น Array เพื่อนำไป Map
    return Object.values(groups);
  }, [activeOrders]);

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
