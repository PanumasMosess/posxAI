import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import AccountingRecordPage from "@/components/accounting/AccountingRecordPage";

export const dynamic = "force-dynamic";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;

  const [accountsData, categoriesData, txLogData] = await Promise.all([
    prisma.account.findMany({
      where: { organizationId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.account_category.findMany({
      where: { organizationId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.account_transaction.findMany({
      where: {
        organizationId,
        type: {
          in: ["INCOME", "EXPENSE"], 
        },
      },
      include: {
        account: { select: { accountName: true } },
        category: { select: { name: true } },
        creator: { select: { name: true, surname: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="p-4 md:p-6 w-full max-w-screen-2xl mx-auto">
      <AccountingRecordPage
        accounts={accountsData}
        categories={categoriesData}
        txLogs={txLogData}
        userId={userId}
        organizationId={organizationId}
      />
    </div>
  );
};

export default page;
