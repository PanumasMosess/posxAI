import { HistoryOrderProps } from "@/lib/type";
import { Data_table_order_comple } from "./tables/data-table-order-comple";
import column_order_comple from "./tables/column_order_comple";

const HistoryOrderComple = ({ initialItems }: HistoryOrderProps) => {
  const columns_order_complate = column_order_comple();
  return (
    <Data_table_order_comple
      columns={columns_order_complate}
      data={initialItems}
    />
  );
};

export default HistoryOrderComple;
