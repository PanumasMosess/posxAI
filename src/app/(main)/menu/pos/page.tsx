import { auth } from "@/auth";
import MenuPOSPage from "@/components/menu/MenuPOSPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;

  const itemsData = await prisma.menu.findMany({
    where: {
      organizationId: organizationId,
    },
    include: {
      category: true,
      unitPrice: true,
      modifiers: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  const categoriesData = await prisma.categorystock.findMany({
    where: {
      organizationId: organizationId,
    },
    select: { id: true, categoryName: true },
  });

  const unitpriceData = await prisma.unitprice.findMany({
    where: {
      organizationId: organizationId,
    },
    select: { id: true, label: true },
  });

  const tableData = await prisma.table.findMany({
    where: {
      status: "WAIT_BOOKING",
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
    include: {
      modifiers: true,
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

  const entertainerPosition = await prisma.posiotion.findFirst({
    where: {
      position_name: "Entertainer",
      organizationId: organizationId,
    },
  });

  const employeeData = await prisma.employeepin.findMany({
    where: {
      organizationId: organizationId,
      status: "ACTIVE",
      position_id: entertainerPosition ? entertainerPosition.id : -1,
    },
    select: {
      id: true,
      name: true,
      surname: true,
      img: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const relatedData = {
    categories: categoriesData,
    unitprices: unitpriceData,
    tabledatas: tableData,
    cartdatas: cartData,
    modifierGroups: itemsGroup,
    employees: employeeData,
  };

  return (
    <div>
      <MenuPOSPage
        initialItems={itemsData}
        relatedData={relatedData}
        id_user={userId}
        organizationId={organizationId}
      />
    </div>
  );
};

export default page;
