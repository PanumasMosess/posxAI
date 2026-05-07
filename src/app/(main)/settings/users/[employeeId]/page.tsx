import ProfileClient from "@/components/settings/users/ProfileClient";
import prisma from "@/lib/prisma";

const page = async ({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) => {
  const resolvedParams = await params;
  const targetUserId = parseInt(resolvedParams.employeeId);

  const profileData = await prisma.employeepin.findUnique({
    where: { id: targetUserId },
  });

  if (!profileData) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        ไม่พบข้อมูลโปรไฟล์
      </div>
    );
  }

  const positionData = await prisma.posiotion.findUnique({
    where: { id: profileData.position_id },
    select: { position_name: true },
  });

  let orderHistory: any[] = [];

  const posName = positionData?.position_name || "";
  const isEntertainer = posName === "Entertainer";
  const isAdmin = ["Admin", "admin", "Spadmin", "spadmin"].includes(posName);

  if (isEntertainer || isAdmin) {
    const orderWhereCondition = isAdmin
      ? { menu: { mcEmployeeId: { not: null } } }
      : { menu: { mcEmployeeId: targetUserId } };

    const involvedOrders = await prisma.order.findMany({
      where: orderWhereCondition,
      select: { order_running_code: true },
      distinct: ["order_running_code"],
    });

    const runningCodes = involvedOrders
      .map((o) => o.order_running_code)
      .filter((code) => code !== null) as string[];

    if (runningCodes.length > 0) {
      // 3.2 ดึง "ออเดอร์ทั้งหมด" ในบิลเหล่านั้น
      const fullOrders = await prisma.order.findMany({
        where: { order_running_code: { in: runningCodes } },
        include: { table: true, menu: true },
        orderBy: { createdAt: "desc" },
      });

      // 3.3 ดึงข้อมูล "Payment (การจ่ายเงิน)"
      const payments = await prisma.paymentorder.findMany({
        where: { order_running_code: { in: runningCodes } },
      });

      // สร้าง Dictionary ให้หาข้อมูลการจ่ายเงินง่ายๆ
      const paymentMap = payments.reduce((acc: any, curr) => {
        acc[curr.order_running_code] = curr;
        return acc;
      }, {});

      // 3.4 จัดกลุ่มข้อมูล
      const groupedOrders = fullOrders.reduce((acc: any, curr) => {
        const code = curr.order_running_code || `N/A`;
        const payment = paymentMap[code];

        if (!acc[code]) {
          acc[code] = {
            orderNumber: code,
            tableName: curr.table?.tableName || "ไม่ระบุโต๊ะ",
            status: payment ? "PAID" : curr.status,
            createdAt: payment ? payment.createdAt : curr.createdAt,
            totalAmount: payment ? payment.totalAmount : 0,
            discount: payment ? payment.discount : 0,
            paymentMethod: payment ? payment.paymentMethod : "ยังไม่ชำระ",
            menus: [],
            calculatedTotal: 0,
          };
        }

        acc[code].menus.push({
          id: curr.id,
          menuName: curr.menu.menuName,
          quantity: curr.quantity,
          price_sum: curr.price_sum,
          isMC: isAdmin
            ? curr.menu.mcEmployeeId !== null
            : curr.menu.mcEmployeeId === targetUserId,
          status: curr.status,
          createdAt: curr.createdAt,
          packageHours: curr.menu.package_hours || 0,
          unit: curr.menu.unit,
        });

        acc[code].calculatedTotal += curr.price_sum;

        if (!payment) {
          acc[code].totalAmount = acc[code].calculatedTotal;
        }

        return acc;
      }, {});

      orderHistory = Object.values(groupedOrders);
      orderHistory.sort(
        (a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    }
  }

  return (
    <ProfileClient
      profileData={profileData}
      positionData={positionData}
      orders={orderHistory}
    />
  );
};

export default page;
