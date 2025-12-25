import { auth } from "@/auth";
import HistoryPaymentPage from "@/components/history/HistoryPaymentPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;
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

  return (
    <HistoryPaymentPage
      initialItems={itemsData}
      userId={userId}
      organizationId={organizationId}
    />
  );
};

export default page;
