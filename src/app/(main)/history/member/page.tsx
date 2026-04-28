import { auth } from "@/auth";
import MemberTransection from "@/components/payments/MemberTransection";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;

  const transactionLogs = await prisma.membertransaction.findMany({
    where: {
      organizationId: organizationId,
    },
    include: {
      member: true,
      employee: true,
      order: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <MemberTransection data={transactionLogs} />;
};

export default page;
