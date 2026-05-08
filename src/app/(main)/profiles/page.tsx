import { auth } from "@/auth";
import ProfilleMain from "@/components/profiles/ProfilleMain";
import prisma from "@/lib/prisma";
import React from "react";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId ?? 0;

  const itemsDataOrder = await prisma.order.findMany({
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
      createdAt: "desc",
    },
  });

  // ส่งออเดอร์ทั้งหมดไปให้ Client Component จัดการต่อ
  return <ProfilleMain orders={itemsDataOrder} />;
};

export default page;
