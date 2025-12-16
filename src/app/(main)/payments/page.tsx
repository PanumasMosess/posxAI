import { auth } from "@/auth";
import PaymentPage from "@/components/payments/PaymentPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId;
  const itemsData = await prisma.order.findMany({
    where: {
      organizationId: Number(organizationId),
      status: "COMPLETED",
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
      id: "asc",
    },
  });

  const printerData = await prisma.printer.findFirst({
      where: {
        organizationId: organizationId,
        stationUse: "แคชเชียร์",
      },
      include: {
        creator: true,
      },
      orderBy: {
        createdAt: "desc", 
      },
    });

  return <PaymentPage initialItems={itemsData} reationdata={printerData}/>;
};

export default page;
