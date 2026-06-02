import { auth } from "@/auth";
import ProfilleMain from "@/components/profiles/ProfilleMain";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId ?? 0;

  const paymentsData = await prisma.paymentorder.findMany({
    where: {
      organizationId: Number(organizationId),
    },
    include: {
      table: true,
      creator: true,
      shift: true,
      runningRef: {
        include: {
          order: {
            where: {
              status: "PAY_COMPLETED",
            },
            include: {
              orderitems: {
                include: {
                  menu: {
                    include: {
                      unitPrice: true,
                      category: true,
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
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const allEmployees = await prisma.employeepin.findMany({
    where: { organizationId: Number(organizationId) },
    select: { id: true, name: true, surname: true },
  });

  return <ProfilleMain orders={paymentsData} allEmployees={allEmployees} />;
};

export default page;
