import MenuPOSPage from "@/components/menu/MenuPOSPage";
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
    unitprices: unitpriceData,
    tabledatas: tableData,
    cartdatas: cartData,
  };
  return (
    <div>
      <MenuPOSPage initialItems={itemsData} relatedData={relatedData} />
    </div>
  );
};

export default page;
