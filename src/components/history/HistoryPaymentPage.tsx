"use client";
import { HistoryPaymentProps } from "@/lib/type";
import { Data_table_payment } from "./tables/data-table-payment";
import column_payment from "./tables/column_payment";

const HistoryPaymentPage = ({ initialItems }: HistoryPaymentProps) => {
  const column_payment_data = column_payment();
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 w-full mt-4">
        <div className="w-full bg-primary-foreground p-2">
          <Data_table_payment
            columns={column_payment_data}
            data={initialItems}
          />
        </div>
      </div>
    </div>
  );
};

export default HistoryPaymentPage;
