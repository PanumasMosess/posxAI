import { auth } from "@/auth";
import StockPageFormular from "@/components/stocks/StockPageFormular";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;
  const itemsData = await prisma.stock.findMany({
    where: {
      status: "ON_STOCK",
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
    where: {
      organizationId: Number(organizationId),
    },
    select: { id: true, categoryName: true },
  });
  const suppliersData = await prisma.supplier.findMany({
    where: {
      organizationId: Number(organizationId),
    },
    select: { id: true, supplierName: true },
  });

  const excludedMenus = await prisma.formularstock.findMany({
    where: {
      status: "RUN_FORMULAR",
      organizationId: Number(organizationId),
    },
    select: {
      id: true,
      menuId: true,
      stockId: true,
      pcs_update: true,
      menu: {
        select: {
          menuName: true,
        },
      },
      stock: {
        select: {
          productName: true,
        },
      },
    },
    // distinct: ["menuId"],
  });

  const excludedMenuIds = excludedMenus.map((item) => item.menuId);

  const itemsMenu = await prisma.menu.findMany({
    where: {
      status: "READY_TO_SELL",
      organizationId: Number(organizationId),
      id: {
        not: {
          in: excludedMenuIds,
        },
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  const itemsGroup = await prisma.modifiergroup.findMany({
    where: {
      organizationId: Number(organizationId),
      status: "running",
    },
    orderBy: {
      id: "desc",
    },
  });

  const itemsInGroup = await prisma.modifieritem.findMany({
    where: {
      organizationId: Number(organizationId),
    },
    include: {
      group: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  const relatedData = {
    categories: categoriesData,
    suppliers: suppliersData,
    menu: itemsMenu,
    stocks: itemsData,
    formular: excludedMenus,
    modifiergroup: itemsGroup,
    mofifieritemgroup: itemsInGroup,
  };

  return (
    <StockPageFormular
      initialItems={itemsData}
      relatedData={relatedData}
      organizationId={organizationId}
      id_user={userId}
    />
  );
};

export default page;
