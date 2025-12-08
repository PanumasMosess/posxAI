import { auth } from "@/auth";
import HistoryOrderPage from "@/components/history/HistoryOrderPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId;
  const itemsData = await prisma.order.findMany({
    where: {
      status: {
        in: ["COMPLETED", "CANCELLED", "PAY_COMPLETED"],
      },
      organizationId: organizationId,
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
