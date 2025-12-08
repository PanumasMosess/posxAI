import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId;
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
              menu: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  console.log(itemsData);

  return <div>page</div>;
};

export default page;
