import { auth } from "@/auth";
import SettingPrinterPage from "@/components/settings/printers/SettingPrinterPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 1;
  const organizationId = session?.user.organizationId ?? 0;
  const itemsData = await prisma.printer.findMany({
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

   const stationData = await prisma.station.findMany({
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
      <SettingPrinterPage initialItems={itemsData} reationData={stationData} id_user={userId} organizationId={organizationId}/>
    </div>
  );
};

export default page;
