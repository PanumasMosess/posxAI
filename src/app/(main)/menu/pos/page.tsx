import MenuPOSPage from "@/components/menu/MenuPOSPage";
import memuTemp from "@/lib/data_temp";
import prisma from "@/lib/prisma";

const page = async () => {
  const itemsData = await prisma.menu.findMany({
    include: {
      category: true,
      unitPrice: true,
    },
    orderBy: {
      id: "desc",
    },
  });
  const categoriesData = await prisma.categorystock.findMany({
    select: { id: true, categoryName: true },
  });

  const unitpriceData = await prisma.unitprice.findMany({
    select: { id: true, label: true },
  });

  const relatedData = { categories: categoriesData, unitprices: unitpriceData };
  return (
    <div>
      <MenuPOSPage initialItems={itemsData} relatedData={relatedData} />
    </div>
  );
};

export default page;
