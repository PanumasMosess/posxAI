import KitchecPage from "@/components/kitchen/KitchecPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const itemsData = await prisma.order.findMany({
    include: {
      menu: {
        include: {
          unitPrice: true
        },
      },
      table: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return (
    <div>
      <KitchecPage initialItems={itemsData} />
    </div>
  );
};

export default page;
