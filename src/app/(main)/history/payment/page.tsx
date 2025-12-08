import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId;
  const itemsData = await prisma.paymentorder.findMany({
    where: {
      organizationId: organizationId
    },
    include: {
      table: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return <div>page</div>;
};

export default page;
