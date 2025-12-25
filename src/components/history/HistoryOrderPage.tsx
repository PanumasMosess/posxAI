"use client";
import { HistoryOrderProps } from "@/lib/type";
import HistoryOrderComple from "./HistoryOrderComple";
import HistoryOrderCancel from "./HistoryOrderCancel";

const HistoryOrderPage = ({
  initialItems,
  id_user,
  organizationId,
}: HistoryOrderProps) => {
  const inActiveOrders = initialItems.filter((item) =>
    ["CANCELLED"].includes(item.status)
  );

  const inActiveOrdersFinish = initialItems.filter((item) =>
    ["COMPLETED", "PAY_COMPLETED"].includes(item.status)
  );

  return (
    <div>
      <div className="mt-4 flex flex-col gap-4">
        <div className="w-full xl:w-3/3 space-y-6">
          <div className="bg-primary-foreground p-4 rounded-lg flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              ประวิติการสั่งสินค้า/ยกเลิกสินค้า
            </div>
            <div className="flex items-center gap-2 flex-wrap"></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-4">
        <div className="w-full bg-primary-foreground p-2">
          <HistoryOrderComple
            initialItems={inActiveOrdersFinish}
            id_user={id_user}
            organizationId={organizationId}
          />
        </div>
        <div className="w-full bg-primary-foreground p-2">
          <HistoryOrderCancel
            initialItems={inActiveOrders}
            id_user={id_user}
            organizationId={organizationId}
          />
        </div>
      </div>
    </div>
  );
};

export default HistoryOrderPage;
