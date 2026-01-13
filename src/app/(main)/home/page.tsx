import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import MainPageComponanceHome from "@/components/home/MainPageComponentsHome";

const Home = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;
  const itemsData = await prisma.table.findMany({
    where: {
      organizationId: organizationId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
      order: {
        where: {
          status: {
            notIn: ["COMPLETED", "CANCELLED", "PAY_COMPLETED"],
          },
        },
        include: {
          orderitems: {
            include: {
              menu: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const itemsDataOrder = await prisma.order.findMany({
    where: {
      organizationId: Number(organizationId),
      status: {
        notIn: ["COMPLETED", "CANCELLED", "PAY_COMPLETED"],
      },
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

  const relatedData = { orderRunning: itemsDataOrder };

  return (
    <MainPageComponanceHome
      initialItems={itemsData}
      userId={userId}
      organizationId={organizationId}
      relatedData={relatedData}
    />
  );
};

export default Home;
