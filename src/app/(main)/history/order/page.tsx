import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import HistoryOrderPage from "@/components/history/HistoryOrderPage";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;

  const rawOrders = await prisma.order.findMany({
    where: {
      status: {
        in: [ "PAY_COMPLETED"],
      },
      organizationId: organizationId,
    },
    include: {
      menu: { include: { unitPrice: true } },
      table: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const groupedMap = new Map();

  for (const order of rawOrders) {
    const code = order.order_running_code;
    if (!code) continue;

    if (!groupedMap.has(code)) {
      groupedMap.set(code, {
        id: code,
        order_running_code: code,
        table: order.table,
        updatedAt: order.updatedAt,
        price_sum: 0,
        quantity: 0,
        status: order.status,
        menusList: [],
      });
    }

    const group = groupedMap.get(code);
    group.price_sum += order.price_sum;
    group.quantity += order.quantity;

    group.menusList.push({
      name: order.menu?.menuName || "ไม่ทราบชื่อ",
      image: order.menu?.img || null, 
    });

    if (new Date(order.updatedAt) > new Date(group.updatedAt)) {
      group.updatedAt = order.updatedAt;
    }
  }

  const groupedOrders = Array.from(groupedMap.values());
  const orderRunningCodes = groupedOrders.map((o) => o.order_running_code);

  const payments = await prisma.paymentorder.findMany({
    where: { order_running_code: { in: orderRunningCodes } },
    include: {
      shift: true,
      creator: true,
    },
  });

  const itemsData = groupedOrders.map((group) => {
    const matchingPayment = payments.find(
      (p) => p.order_running_code === group.order_running_code,
    );

    return {
      ...group,
      paymentInfo: matchingPayment || null,
    };
  });

  itemsData.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <div>
      <HistoryOrderPage
        initialItems={itemsData}
        id_user={userId}
        organizationId={organizationId}
      />
    </div>
  );
};

export default page;
