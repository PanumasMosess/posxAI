import StockPageFormular from "@/components/stocks/StockPageFormular";
import prisma from "@/lib/prisma";

const page = async () => {
  const itemsData = await prisma.stock.findMany({
    where: {
      status: "ON_STOCK",
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
  const suppliersData = await prisma.supplier.findMany({
    select: { id: true, supplierName: true },
  });

  const relatedData = { categories: categoriesData, suppliers: suppliersData };

  return <StockPageFormular initialItems={itemsData} relatedData={relatedData} />;
};

export default page;
