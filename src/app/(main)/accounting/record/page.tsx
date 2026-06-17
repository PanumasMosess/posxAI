import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import AccountingRecordPage from "@/components/accounting/AccountingRecordPage";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;

  // 1. ดึงข้อมูลกระเป๋าเงิน
  const accountsData = await prisma.account.findMany({
    where: { organizationId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  // 2. ดึงข้อมูลหมวดหมู่ทั้งหมด
  const categoriesData = await prisma.account_category.findMany({
    where: { organizationId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  // 3. ดึงรายการธุรกรรมประจำวันล่าสุด
  const txLogData = await prisma.account_transaction.findMany({
    where: {
      organizationId,
      type: {
        in: ["INCOME", "EXPENSE"], // ดึงเฉพาะรายรับและรายจ่ายประจำวัน
      },
    },
    include: {
      account: { select: { accountName: true } },
      category: { select: { name: true } }, // 🔥 จุดสำคัญ: ต้องโหลดตารางหมวดหมู่ตรงนี้ด้วยเพื่อให้ตารางแสดงผลได้ถูกต้อง
      creator: { select: { name: true, surname: true } },
    },
    orderBy: { createdAt: "desc" },
  });

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