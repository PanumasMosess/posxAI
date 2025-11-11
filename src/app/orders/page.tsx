import MenuOrderPage from "@/components/menu/MenuOrderPage";
import prisma from "@/lib/prisma";

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

  const relatedData = { categories: categoriesData };
  return (
    <MenuOrderPage
      relatedData={relatedData}
      initialItems={itemsData}
    ></MenuOrderPage>
  );
};

export default page;
