"use client";
import { StatusTable, StatusTableProps } from "@/lib/type";
import { Data_table_status_table } from "./tables/data-table-status-table";
import column_status_table from "./tables/column_status_table";
import { useRouter } from "next/navigation";
import {
  moveTableFunction,
  updateStatusTable,
} from "@/lib/actions/actionSettings";
import TableStatusPage from "./TableStatusPage";
import { useState } from "react";
import OrderStatusPage from "./OrderStatusPage";
import PaymentStatusPage from "./PaymentStatusPage";

const MainPageComponentsHome = ({
  initialItems,
  userId,
  organizationId,
  relatedData,
}: StatusTableProps) => {
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [selectedTableToMove, setSelectedTableToMove] =
    useState<StatusTable | null>(null);
  const [activeOrderIds, setActiveOrderIds] = useState<number[]>([]);

  const router = useRouter();

  const handleStatusChange = async (id: number, status: string) => {
    const result = await updateStatusTable(id, status);

    if (result.success) {
      router.refresh();
    }
  };

  const onMoveTable = async (table: StatusTable) => {
    const activeOrders = table.order.filter(
      (o) => !["COMPLETED", "CANCELLED", "PAY_COMPLETED"].includes(o.status)
    );
    const ids = activeOrders.map((o) => o.id);
    setActiveOrderIds(ids);
    setSelectedTableToMove(table);
    setIsMoveDialogOpen(true);
  };

  const columns = column_status_table(
    handleStatusChange,
    onMoveTable,
    organizationId ?? 0
  );
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
      <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <OrderStatusPage
          initialItems={initialItems}
          userId={userId}
          organizationId={organizationId ?? 1}
          relatedData={relatedData}
        />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <Data_table_status_table
          columns={columns}
          data={initialItems}
          userId={userId}
          organizationId={organizationId ?? 0}
        />

        {selectedTableToMove && (
          <TableStatusPage
            isOpen={isMoveDialogOpen}
            onClose={() => setIsMoveDialogOpen(false)}
            currentTable={{
              id: selectedTableToMove.id,
              tableName: selectedTableToMove.tableName,
              status: selectedTableToMove.status as any,
            }}
            allTables={initialItems.map((t) => ({
              id: t.id,
              tableName: t.tableName,
              status: t.status as any,
            }))}
            onConfirm={async (fromTableId, toTableId) => {
              const result = await moveTableFunction(
                fromTableId,
                toTableId,
                activeOrderIds
              );

              if (result.success) {
                router.refresh();
                setIsMoveDialogOpen(false);
              }
            }}
          />
        )}
      </div>

      <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-4 xl:col-span-1 2xl:col-span-4">
        <PaymentStatusPage
          initialItems={relatedData.orderRunning}
          id_user={userId}
          organizationId={organizationId ?? 0}
        />
      </div>
      {/* <div className="bg-primary-foreground p-4 rounded-lg"></div> */}
      {/* <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <AppAreaChart />
      </div>
      <div className="bg-primary-foreground p-4 rounded-lg">
        <CardList title="Popular Content" />
      </div> */}
    </div>
  );
};

export default MainPageComponentsHome;
