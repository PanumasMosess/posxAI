import { auth } from "@/auth";
import SettingTables from "@/components/settings/SettingTablesPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;
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
      <SettingTables initialItems={itemsData}  userId={userId} organizationId={organizationId} />
    </div>
  );
};

export default page;
