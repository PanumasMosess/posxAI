import { auth } from "@/auth";
import SettingTables from "@/components/settings/SettingTablesPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId;
  const itemsData = await prisma.table.findMany({
    where: {
      organizationId: organizationId,
    },
    include: {
      creator: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <SettingTables initialItems={itemsData} />
    </div>
  );
};

export default page;
