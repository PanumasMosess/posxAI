import { auth } from "@/auth";
import ProfilleMain from "@/components/profiles/ProfilleMain";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId ?? 0;

  const itemsDataOrder = await prisma.order.findMany({
    where: {
      organizationId: Number(organizationId),
      status: {
        in: ["CANCELLED", "PAY_COMPLETED"],
      },
    },
    include: {
      orderitems: {
        include: {
          menu: {
            include: {
              unitPrice: true,
            },
          },
        },
      },
    },
  });


  const allEmployees = await prisma.employeepin.findMany({
    where: { organizationId: Number(organizationId) },
    select: { id: true, name: true, surname: true },
  });

  return <ProfilleMain orders={itemsDataOrder} allEmployees={allEmployees} />;
};

export default page;
