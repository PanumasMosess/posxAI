import SettingTables from "@/components/settings/SettingTablesPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const itemsData = await prisma.table.findMany({
    include: {
      creator: true
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
        <SettingTables initialItems={itemsData}/>
    </div>
  );
};

export default page;
