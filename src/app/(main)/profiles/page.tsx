import { auth } from "@/auth";
import ProfilleMain from "@/components/profiles/ProfilleMain";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId ?? 0;

  const [rawPaymentsData, allEmployees] = await Promise.all([
    prisma.paymentorder.findMany({
      where: {
        organizationId: Number(organizationId),
      },
      select: {
        id: true,
        createdAt: true,
        totalAmount: true,
        createdById: true,
        shift: {
          select: { openedAt: true },
        },
        runningRef: {
          select: {
            order: {
              where: {
                status: "PAY_COMPLETED",
              },
              select: {
                id: true,
                employeeId: true,
                orderitems: {
                  select: {
                    price: true,
                    quantity: true,
                    menu: {
                      select: {
                        mcEmployeeId: true,
                        unitPrice: {
                          select: { label: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    prisma.employeepin.findMany({
      where: { organizationId: Number(organizationId) },
      select: { id: true, name: true, surname: true },
    }),
  ]);

  const processedOrderIds = new Set<number>();
  const cleanPaymentsData = rawPaymentsData.map((payment) => {
    if (!payment.runningRef?.order) return payment;

    const uniqueOrders = payment.runningRef.order.filter((order) => {
      if (processedOrderIds.has(order.id)) {
        return false;
      }
      processedOrderIds.add(order.id);
      return true;
    });

    return {
      ...payment,
      shift: payment.shift
        ? {
            startTime: payment.shift.openedAt,
          }
        : null,
      runningRef: {
        ...payment.runningRef,
        order: uniqueOrders,
      },
    };
  });

  return (
    <ProfilleMain orders={cleanPaymentsData} allEmployees={allEmployees} />
  );
};

export default page;
