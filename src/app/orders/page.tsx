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

  const relatedData = { categories: categoriesData, tabledatas: tableData };

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin h-10 w-10 text-primary mb-3" />
            <p className="text-lg text-muted-foreground">กำลังโหลด...</p>
          </div>
        </div>
      }
    >
      <MenuOrderPage
        relatedData={relatedData}
        initialItems={itemsData}
      ></MenuOrderPage>
    </Suspense>
  );
};

export default page;
