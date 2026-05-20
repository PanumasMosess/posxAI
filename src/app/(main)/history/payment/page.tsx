import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import HistoryPaymentPage from "@/components/history/HistoryPaymentPage";

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
      creator: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
      shift: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const shiftSequenceCache = new Map();

  for (const payment of itemsData) {
    if (payment.shift) {
      const shiftId = payment.shift.id;

      if (!shiftSequenceCache.has(shiftId)) {
        const startOfDay = new Date(payment.shift.createdAt);
        startOfDay.setHours(0, 0, 0, 0);

        const sequence = await prisma.shift.count({
          where: {
            organizationId: organizationId,
            createdAt: {
              gte: startOfDay,
              lte: payment.shift.createdAt,
            },
          },
        });

        shiftSequenceCache.set(shiftId, sequence);
      }

      (payment.shift as any).shiftSequence = shiftSequenceCache.get(shiftId);
    }
  }

  return (
    <HistoryPaymentPage
      initialItems={itemsData}
      userId={userId}
      organizationId={organizationId}
    />
  );
};

export default page;
