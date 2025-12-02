import StockPageClient from "@/components/stocks/StockPageClient";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const Page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId;
  const itemsData = await prisma.stock.findMany({
    where: {
      status: "ON_STOCK",
      organizationId: Number(organizationId),
    },
    include: {
      category: true,
      unitPrice: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  const categoriesData = await prisma.categorystock.findMany({
    where: {
      organizationId: Number(organizationId),
    },
    select: { id: true, categoryName: true },
  });
  const unitpriceData = await prisma.unitprice.findMany({
    where: {
      organizationId: Number(organizationId),
    },
    select: { id: true, label: true },
  });
  const suppliersData = await prisma.supplier.findMany({
    where: {
      organizationId: Number(organizationId),
    },
    select: { id: true, supplierName: true },
  });

  const relatedData = {
    categories: categoriesData,
    suppliers: suppliersData,
    unitprices: unitpriceData,
  };

  return <StockPageClient initialItems={itemsData} relatedData={relatedData} />;
};

export default Page;
