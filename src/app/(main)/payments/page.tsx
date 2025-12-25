import { auth } from "@/auth";
import PaymentPage from "@/components/payments/PaymentPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 1;
  const organizationId = session?.user.organizationId ?? 0;
  const itemsData = await prisma.order.findMany({
    where: {
      organizationId: Number(organizationId),
      status: "COMPLETED",
    },
    include: {
      table: true,
      orderitems: {
        include: {
          menu: {
            include: {
              unitPrice: true,
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
    orderBy: {
      id: "asc",
    },
  });

  return (
    <PaymentPage
      initialItems={itemsData}
      id_user={userId}
      organizationId={organizationId}
    />
  );
};

export default page;
