import HistoryOrderPage from "@/components/history/HistoryOrderPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const itemsData = await prisma.order.findMany({
    where: {
      status: {
        in: ["COMPLETED", "CANCELLED"],
      },
    },
    include: {
      menu: {
        include: {
          unitPrice: true,
        },
      },
      table: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div>
      <HistoryOrderPage initialItems={itemsData} />
    </div>
  );
};

export default page;
