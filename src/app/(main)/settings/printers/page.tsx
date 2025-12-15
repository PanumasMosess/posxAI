import { auth } from "@/auth";
import SettingPrinterPage from "@/components/settings/printers/SettingPrinterPage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const organizationId = session?.user.organizationId;
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
      <SettingPrinterPage initialItems={itemsData} reationData={stationData}/>
    </div>
  );
};

export default page;
