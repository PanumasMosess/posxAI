"use server";

import { auth } from "@/auth";
import SettingBackdropPage from "@/components/settings/backdroup/SettingBackDroupPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId ?? 0;
  const itemsData = await prisma.display_backdrop.findMany({
    where: {
      organizationId: organizationId,
    },

    orderBy: [
      {
        sequence: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return (
    <div>
      <SettingBackdropPage
        initialItems={itemsData}
        organizationId={organizationId}
      />
    </div>
  );
};

export default page;
