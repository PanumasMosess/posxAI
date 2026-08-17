import { auth } from "@/auth";
import StaffCheckInPage from "@/components/tablebooking/StaffCheckInPage";
import prisma from "@/lib/prisma";
import { PropsUrl } from "@/lib/type";
import { Building2 } from "lucide-react";


export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const page = async (props: PropsUrl) => {
  const session = await auth();
  const searchParams = await props.searchParams;
  const urlOrgId = searchParams.organizationId;
  const sessionOrgId = session?.user.organizationId;
  const organizationId = urlOrgId ? parseInt(urlOrgId) : sessionOrgId;

  if (!organizationId) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="flex flex-col items-center space-y-6 text-center max-w-sm">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-red-100 dark:bg-red-900/20 blur-sm opacity-50" />
            <div className="relative rounded-full bg-white dark:bg-zinc-900 p-4 shadow-sm border border-zinc-100 dark:border-zinc-800">
              <Building2 className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              ไม่พบข้อมูลองค์กร
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              ดูเหมือนบัญชีของคุณยังไม่ได้ระบุ Organization ID <br />
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                กรุณาออกจากระบบแล้วเข้าใหม่อีกครั้ง
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const initialOccupiedTables = await prisma.table.findMany({
    where: {
      organizationId: organizationId,
      status: { in: ["OCCUPIED", "DIRTY"] },
    },
    orderBy: { tableName: "asc" },
  });

  return (
    <StaffCheckInPage
      organizationId={organizationId}
      initialOccupiedTables={initialOccupiedTables}
    />
  );
};

export default page;
