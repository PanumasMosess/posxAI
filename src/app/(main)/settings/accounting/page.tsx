import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import SettingAccountingPage from "@/components/settings/accounting/SettingAccountingPage";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;
  const accountsData = await prisma.account.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
  const categoriesData = await prisma.account_category.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
  const txLogData = await prisma.account_transaction.findMany({
    where: {
      organizationId,
      type: {
        in: ["ADJUSTMENT_UP", "ADJUSTMENT_DOWN", "OVERRIDE_BALANCE", "TRANSFER_IN", "TRANSFER_OUT"],
      },
    },
    include: {
      account: { select: { accountName: true } },
      creator: { select: { name: true, surname: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <SettingAccountingPage
      accounts={accountsData}
      categories={categoriesData}
      txLogs={txLogData}
      userId={userId}
      organizationId={organizationId}
    />
  );
};

export default page;