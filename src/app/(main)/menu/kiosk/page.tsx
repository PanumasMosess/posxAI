import { auth } from "@/auth";
import MenuOrderPage from "@/components/menu/MenuOrderPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId;
  const itemsData = await prisma.menu.findMany({
    where: {
      status: "READY_TO_SELL",
      organizationId: Number(organizationId),
    },
    include: {
      category: true,
    },
    orderBy: {
      id: "desc",
    },
  });
  const categoriesData = await prisma.categorystock.findMany({
    select: { id: true, categoryName: true },
  });

  const tableData = await prisma.table.findMany({
    where: {
      status: "WAIT_BOOKING",
    },
    orderBy: {
      id: "desc",
    },
  });

  const cartData = await prisma.cart.findMany({
    where: {
      status: "ON_CART",
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
