import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import MemberPaymentPage from "@/components/accounting/MemberPaymentPage";

export const dynamic = "force-dynamic";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;

  const [members, shopAccounts] = await Promise.all([
    prisma.member.findMany({
      where: { organizationId, status: "ACTIVE" },
      include: {
        transactions: {
          where: {
            walletType: "CREDIT",
            type: { in: ["SPEND", "TOPUP"] }, 
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { firstName: "asc" },
    }),

    prisma.account.findMany({
      where: { organizationId, status: "ACTIVE" },
      orderBy: { accountName: "asc" },
    })
  ]);

  return (
    <div className="p-4 md:p-6 w-full max-w-screen-2xl mx-auto">
      <MemberPaymentPage 
        initialMembers={members} 
        shopAccounts={shopAccounts} 
        userId={userId} 
        organizationId={organizationId} 
      />
    </div>
  );
};

export default page;