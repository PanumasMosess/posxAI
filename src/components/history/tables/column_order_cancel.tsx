import { HistoryOrder } from "@/lib/type";
import { ColumnDef } from "@tanstack/react-table";

const column_order_cancel = (): ColumnDef<HistoryOrder>[] => [
  {
    id: "id",
    header: () => <div className="text-center font-bold">รหัสบิล</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-mono text-xs text-red-500 dark:text-red-400">
          {row.original.order_running_code}
        </div>
      );
    },
  },
  {
    id: "menus",
    header: () => <div className="text-left ml-2">รายการอาหาร</div>,
    cell: ({ row }) => {
      const menus = row.original.menusList || [];

      if (menus.length === 0)
        return <span className="text-zinc-400 dark:text-zinc-500 pl-2">-</span>;

      return (
        <div className="flex flex-col gap-2 my-1 ml-2 max-h-[150px] overflow-y-auto pr-2">
          {menus.map((menu, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="h-8 w-8 shrink-0 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-hidden shadow-sm opacity-60">
                {menu.image ? (
                  <img
                    src={menu.image}
                    alt={menu.name}
                    className="h-full w-full object-cover grayscale"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-400 dark:text-zinc-600">
                    รูป
                  </div>
                )}
              </div>

              <span
                className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-[160px] line-through"
                title={menu.name}
              >
                {menu.name}
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "quantity",
    header: () => <div className="text-center">รวมจำนวน</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium text-zinc-500">
          {row.original.quantity}
        </div>
      );
    },
  },
  {
    id: "table",
    header: () => <div className="text-center">ชื่อโต๊ะ</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center text-zinc-500">
          {row.original.table?.tableName || "-"}
        </div>
      );
    },
  },
  {
    id: "price_sum",
    header: () => <div className="text-center">ยอดสุทธิ</div>,
    cell: ({ row }) => {
      const currency = (row.original as any).currencyLabel || "";
      return (
        <div className="text-center font-bold text-amber-600 dark:text-amber-500">
          {row.original.price_sum.toLocaleString()}{" "}
          <span className="text-xs text-zinc-400 font-normal ml-1">
            {currency}
          </span>
        </div>
      );
    },
  },
  {
    id: "shift",
    accessorFn: (row) => {
      const shift = row.paymentInfo?.shift;
      const displaySeq = shift?.shiftSequence || shift?.id;
      return displaySeq ? `กะที่ ${displaySeq}` : "";
    },
    header: () => <div className="text-center">กะการทำงาน</div>,
    cell: ({ row }) => {
      const shift = row.original.paymentInfo?.shift;
      const displaySeq = shift?.shiftSequence || shift?.id;

      return (
        <div className="text-center">
          {displaySeq ? (
            <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded-md text-xs font-medium border dark:border-zinc-800">
              กะที่ {displaySeq}
            </span>
          ) : (
            <span className="text-zinc-400">-</span>
          )}
        </div>
      );
    },
  },
  // 🟢 เพิ่มคอลัมน์ คนรับออเดอร์ ตรงนี้
  {
    id: "orderTaker",
    accessorFn: (row) => row.employeeName,
    header: () => <div className="text-center">คนรับออเดอร์</div>,
    cell: ({ row }) => {
      const orderTakerName = row.original.employeeName;
      return (
        <div className="text-center text-sm font-medium">
          {orderTakerName || (
            <span className="text-zinc-400">สั่งผ่านระบบ</span>
          )}
        </div>
      );
    },
  },
  {
    id: "cashier",
    accessorFn: (row) => row.paymentInfo?.creator?.name,
    header: () => <div className="text-center">คนรับชำระ/คนยกเลิก</div>,
    cell: ({ row }) => {
      const cashierName = row.original.paymentInfo?.creator?.name;
      return (
        <div className="text-center text-sm font-medium text-zinc-500">
          {cashierName || <span className="text-zinc-400">ไม่ระบุ</span>}
        </div>
      );
    },
  },
  {
    id: "updatedAt",
    header: () => <div className="text-center">วัน/เวลายกเลิก</div>,
    cell: ({ row }) => {
      const amount = new Date(row.original.updatedAt);
      const formatted = amount.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return (
        <div className="text-center text-xs text-red-500 dark:text-red-400">
          {formatted}
        </div>
      );
    },
  },
];

export default column_order_cancel;
