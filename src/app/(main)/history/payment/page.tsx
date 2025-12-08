import { auth } from "@/auth";
import HistoryPaymentPage from "@/components/history/HistoryPaymentPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId;
  const itemsData = await prisma.paymentorder.findMany({
    where: {
      organizationId: organizationId,
    },
    include: {
      table: true,
      runningRef: {
        include: {
          order: {
            include: {
              menu: {
                include: {
                  unitPrice: true,
                },
              },
            },
          },
        },
      },
      creator: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return <HistoryPaymentPage initialItems={itemsData} />;
};

export default page;
