import { auth } from "@/auth";
import MenuOrderPage from "@/components/menu/MenuOrderPage";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId;
  const itemsData = await prisma.menu.findMany({
    where: {
      status: "READY_TO_SELL",
      organizationId: organizationId,
    },
    include: {
      category: true,
      unitPrice: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  const excludedIds = itemsData.map((item) => item.categoryMenuId);

  const categoriesData = await prisma.categorystock.findMany({
    where: {
      id: {
        in: excludedIds,
      },
      organizationId: organizationId,
    },
    orderBy: {
      id: "desc",
    },
  });

  const tableData = await prisma.table.findMany({
    where: {
      status: {
        notIn: ["RESERVED", "DIRTY"],
      },
      organizationId: organizationId,
    },
    orderBy: {
      id: "desc",
    },
  });

  const cartData = await prisma.cart.findMany({
    where: {
      status: "ON_CART",
       organizationId: organizationId,
    },
    orderBy: {
      id: "desc",
    },
  });

  const relatedData = {
    categories: categoriesData,
    tabledatas: tableData,
    cartdatas: cartData,
  };

  return (
    <MenuOrderPage
      relatedData={relatedData}
      initialItems={itemsData}
    ></MenuOrderPage>
  );
};

export default page;
