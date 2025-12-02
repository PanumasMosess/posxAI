import { auth } from "@/auth";
import KitchecPage from "@/components/kitchen/KitchecPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId;
  const itemsData = await prisma.order.findMany({
    where: {
      organizationId: Number(organizationId),
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

  return (
    <div>
      <KitchecPage initialItems={itemsData} />
    </div>
  );
};

export default page;
