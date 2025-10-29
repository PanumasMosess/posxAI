
import MenuOrderPage from "@/components/menu/MenuOrderPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const itemsData = await prisma.menu.findMany({
    where: {
      status: "READY_TO_SELL",
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

  const relatedData = { categories: categoriesData };
  return (
    <MenuOrderPage 
      relatedData={relatedData}
      initialItems={itemsData}
    ></MenuOrderPage>
  );
};

export default page;
