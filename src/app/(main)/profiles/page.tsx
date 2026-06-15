import { auth } from "@/auth";
import ProfilleMain from "@/components/profiles/ProfilleMain";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId ?? 0;

  const rawPaymentsData = await prisma.paymentorder.findMany({
    where: {
      organizationId: Number(organizationId),
    },
    include: {
      table: true,
      creator: true,
      shift: true,
      runningRef: {
        include: {
          order: {
            where: {
              status: "PAY_COMPLETED",
            },
            include: {
              orderitems: {
                include: {
                  menu: {
                    include: {
                      unitPrice: true,
                      category: true,
                    },
                  },
                  selectedModifiers: {
                    include: {
                      modifierItem: true,
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
  });

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
      runningRef: {
        ...payment.runningRef,
        order: uniqueOrders, 
      },
    };
  });

  const allEmployees = await prisma.employeepin.findMany({
    where: { organizationId: Number(organizationId) },
    select: { id: true, name: true, surname: true },
  });

  return (
    <ProfilleMain orders={cleanPaymentsData} allEmployees={allEmployees} />
  );
};

export default page;
