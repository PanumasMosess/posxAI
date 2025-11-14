import MenuOrderPage from "@/components/menu/MenuOrderPage";
import prisma from "@/lib/prisma";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

const page = async () => {
  const itemsData = await prisma.menu.findMany({
    where: {
      status: "READY_TO_SELL",
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
    },
    orderBy: {
      id: "desc",
    },
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
