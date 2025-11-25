import { HistoryOrderProps } from "@/lib/type";
import column_order_cancel from "./tables/column_order_cancel";
import { Data_table_order_cancel } from "./tables/data-table-order-cencel";

const HistoryOrderCancel = ({ initialItems }: HistoryOrderProps) => {
  const columns_order_cancel = column_order_cancel();
  return (
    <Data_table_order_cancel
      columns={columns_order_cancel}
      data={initialItems}
    />
  );
};

export default HistoryOrderCancel;
