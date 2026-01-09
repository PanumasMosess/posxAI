import { Button } from "@/components/ui/button";
import { StatusTable } from "@/lib/type";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRightLeft, ArrowUpDown, Receipt, Utensils } from "lucide-react";
import status from "@/lib/data_temp";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const tableStatuses = status.tableStatuses;

const column_status_table = (
  onUpdateStatus: (id: number, newStatus: string) => void,
  onMoveTable: (table: StatusTable) => void,
  organizationId: number
): ColumnDef<StatusTable>[] => [
  {
    id: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        # <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-left font-medium ml-4">{row.index + 1}</div>
    ),
  },
  {
    accessorKey: "tableName",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ชื่อโต๊ะ <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <span className="font-bold text-lg">{row.getValue("tableName")}</span>
      </div>
    ),
  },
  {
    id: "orders",
    header: () => <div className="text-center">ออเดอร์ปัจจุบัน</div>,
    cell: ({ row }) => {
      const orders = (row.original as any).order || [];

      const activeOrders = orders.filter(
        (o: any) =>
          !["COMPLETED", "CANCELLED", "PAY_COMPLETED"].includes(o.status)
      );

      if (activeOrders.length === 0) {
        return (
          <div className="text-center text-zinc-400 text-sm">- ว่าง -</div>
        );
      }

      return (
        <div className="flex justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative h-9 px-4 border-orange-200 bg-orange-50/50 text-orange-400 hover:bg-orange-100 hover:text-orange-600 hover:border-orange-300 transition-all shadow-sm"
              >
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border border-white"></span>
                </span>

                <Receipt className="w-4 h-4 mr-2" />
                <span className="font-bold text-base">
                  {activeOrders.length}
                </span>
                <span className="ml-1 text-xs font-normal opacity-80">
                  รายการ
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4 shadow-lg border-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                  โต๊ะ {row.getValue("tableName")}
                </h4>
                <span className="text-xs text-zinc-400">
                  {activeOrders.length} รายการ
                </span>
              </div>

              <ScrollArea className="h-[280px] -mr-3 pr-3">
                <div className="space-y-5">
                  {activeOrders.map((order: any, i: number) => (
                    <div key={order.id} className="relative pl-3">
                      <div className="absolute left-0 top-1 bottom-0 w-[2px] bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              order.status === "COOKING"
                                ? "bg-orange-500"
                                : order.status === "SERVED"
                                ? "bg-green-500"
                                : "bg-zinc-300"
                            }`}
                          />
                          <span className="font-mono text-xs text-zinc-400">
                            #{order.order_running_code || `ORD-${i + 1}`}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {order.orderitems?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-baseline justify-between text-sm group"
                          >
                            <div className="flex items-baseline gap-2 text-zinc-700 dark:text-zinc-300">
                              <span className="font-semibold text-xs text-zinc-400 w-4 text-right">
                                {item.quantity}x
                              </span>
                              <span className="group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                {item.menu?.menuName || "Unknown"}
                              </span>
                            </div>
                          </div>
                        ))}
                        {(!order.orderitems ||
                          order.orderitems.length === 0) && (
                          <span className="text-xs text-zinc-300 pl-6">
                            Empty
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <div className="text-center">สถานะ</div>,
    cell: ({ row }) => {
      const currentStatus = row.getValue("status") as string;
      const tableId = row.original.id;
      const statusMeta = tableStatuses.find((s) => s.value === currentStatus);

      return (
        <div className="flex justify-center items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              statusMeta?.color || "bg-gray-300"
            }`}
          />
          <select
            className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={currentStatus}
            onChange={(e) => {
              if (onUpdateStatus) onUpdateStatus(tableId, e.target.value);
            }}
          >
            {tableStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">จัดการ</div>,
    cell: ({ row }) => {
      const table = row.original;
      return (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="text-zinc-600 border-zinc-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
            onClick={() => onMoveTable(table)}
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            ย้ายโต๊ะ
          </Button>
        </div>
      );
    },
  },
];

export default column_status_table;
