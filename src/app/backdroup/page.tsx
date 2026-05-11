"use server";

import { auth } from "@/auth";
import DisplayTV from "@/components/backdroup/DisplayTV";
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
    <main className="w-full h-screen bg-black overflow-hidden">
      <DisplayTV items={itemsData} />
    </main>
  );
};

export default page;
