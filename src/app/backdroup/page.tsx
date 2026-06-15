"use server";

import { auth } from "@/auth";
import DisplayTV from "@/components/backdroup/DisplayTV";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId ?? 0;
  const itemsData = await prisma.display_backdrop.findMany({
    where: {
      organizationId: organizationId,
      isTemporary: false,
      isActive: true,
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
      <DisplayTV items={itemsData} organizationId={organizationId} />
    </main>
  );
};

export default page;
