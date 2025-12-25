import { auth } from "@/auth";
import KitchecPage from "@/components/kitchen/KitchecPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;
  const itemsData = await prisma.order.findMany({
    where: {
      organizationId: Number(organizationId),
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
    <div>
      <KitchecPage
        initialItems={itemsData}
        id_user={userId}
        organizationId={organizationId}
      />
    </div>
  );
};

export default page;
