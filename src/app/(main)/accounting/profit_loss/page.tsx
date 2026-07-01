import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ProfitLossPage from "@/components/accounting/ProfitLossPage";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;

  const accountsData = await prisma.account.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const formatDate = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000; 
    return new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
  };
  
  const initialStartDate = formatDate(startOfMonth);
  const initialEndDate = formatDate(now);
  const start = new Date(`${initialStartDate}T00:00:00+07:00`);
  const end = new Date(`${initialEndDate}T23:59:59+07:00`);

  const defaultTxLogs = await prisma.account_transaction.findMany({
    where: {
      organizationId,
      OR: [
        { date: { gte: start, lte: end } },
        { date: null, createdAt: { gte: start, lte: end } }
      ]
    },
    include: {
      account: { select: { accountName: true } },
      category: { select: { name: true } },
      creator: { select: { name: true, surname: true } },
    },
    orderBy: [
      { date: "desc" },
      { createdAt: "desc" }
    ],
  });

  return (
    <div className="p-4 md:p-6 w-full max-w-screen-2xl mx-auto space-y-6">
      <ProfitLossPage
        accounts={accountsData}
        defaultTxLogs={defaultTxLogs}
        organizationId={organizationId}
        initialStartDate={initialStartDate}
        initialEndDate={initialEndDate}
      />
    </div>
  );
};

export default page;