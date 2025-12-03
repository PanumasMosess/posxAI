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
  return <PaymentPage initialItems={itemsData} />;
};

export default page;
