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
      id: "desc",
    },
  });

  const printerData = await prisma.printer.findFirst({
    where: {
      organizationId: organizationId,
      stationUse: "ครัว",
    },
    include: {
      creator: true,
    },
    orderBy: {
      createdAt: "desc", 
    },
  });


  return (
    <div>
      <KitchecPage initialItems={itemsData} reationdata={printerData} />
    </div>
  );
};

export default page;
