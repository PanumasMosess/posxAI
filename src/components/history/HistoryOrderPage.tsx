"use client";

import { HistoryOrderProps } from "@/lib/type";
import HistoryOrderComple from "./HistoryOrderComple";
import HistoryOrderCancel from "./HistoryOrderCancel";
import { useUser } from "../providers/UserContext";

const HistoryOrderPage = ({
  initialItems,
  id_user,
  organizationId,
}: HistoryOrderProps) => {
  const { employeeId } = useUser();

  const inActiveOrders = initialItems.filter((item) =>
    ["CANCELLED"].includes(item.status),
  );

  const inActiveOrdersFinish = initialItems.filter((item) =>
    ["COMPLETED", "PAY_COMPLETED"].includes(item.status),
  );

  return (
    <div>
      <div className="mt-4 flex flex-col gap-4">
        <div className="w-full xl:w-3/3 space-y-6">
          <div className="bg-primary-foreground p-4 rounded-lg flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap font-bold text-zinc-800 dark:text-zinc-200">
              ประวัติการสั่งสินค้า/ยกเลิกสินค้า
            </div>
            <div className="flex items-center gap-2 flex-wrap"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full mt-4">
        <div className="w-full bg-primary-foreground p-4 rounded-xl border border-zinc-100 dark:border-zinc-900 shadow-sm">
          <HistoryOrderComple
            initialItems={inActiveOrdersFinish}
            id_user={Number(employeeId)}
            organizationId={organizationId}
          />
        </div>

        <div className="w-full bg-primary-foreground p-4 rounded-xl border border-zinc-100 dark:border-zinc-900 shadow-sm">
          <HistoryOrderCancel
            initialItems={inActiveOrders}
            id_user={Number(employeeId)}
            organizationId={organizationId}
          />
        </div>
      </div>
    </div>
  );
};

export default HistoryOrderPage;
