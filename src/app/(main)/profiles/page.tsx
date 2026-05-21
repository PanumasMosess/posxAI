import { auth } from "@/auth";
import ProfilleMain from "@/components/profiles/ProfilleMain";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId ?? 0;

  const itemsDataOrder = await prisma.order.findMany({
    where: {
      organizationId: Number(organizationId),
      status: "PAY_COMPLETED",
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
      createdAt: "desc",
    },
  });

  const allEmployees = await prisma.employeepin.findMany({
    where: { organizationId: Number(organizationId) },
    select: { id: true, name: true, surname: true }, 
  });

  const employeeMap = new Map();
  for (const emp of allEmployees) {
    employeeMap.set(String(emp.id), `${emp.name} ${emp.surname}`);
  }

  const ordersWithEmployee = itemsDataOrder.map((order) => {
    return {
      ...order,
      employeeName: order.employeeId
        ? employeeMap.get(String(order.employeeId)) || "ไม่ทราบชื่อพนักงาน"
        : "สั่งผ่านระบบ",
    };
  });

  return (
    <ProfilleMain
      orders={ordersWithEmployee}
      allEmployees={allEmployees} 
    />
  );
};

export default page;
