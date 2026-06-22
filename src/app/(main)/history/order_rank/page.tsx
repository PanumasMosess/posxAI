import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import OrderRankingDashboard from "@/components/history/OrderRankingDashboard";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;

  const paymentsData = await prisma.paymentorder.findMany({
    where: {
      organizationId: Number(organizationId),
    },
    include: {
      table: true,
      creator: true,
      shift: true,
      runningRef: {
        include: {
          order: {
            where: {
              status: "PAY_COMPLETED",
            },
            include: {
              menu: { include: { unitPrice: true, category: true } },
              table: true,
              orderitems: {
                include: {
                  menu: {
                    include: {
                      unitPrice: true,
                      category: true,
                    },
                  },
                  selectedModifiers: {
                    include: {
                      modifierItem: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const allEmployees = await prisma.employeepin.findMany({
    where: { organizationId: Number(organizationId) },
    select: { id: true, name: true, surname: true },
  });

  const employeeMap = new Map();
  for (const emp of allEmployees) {
    employeeMap.set(String(emp.id), `${emp.name} ${emp.surname}`);
  }

  const shiftSequenceCache = new Map();
  for (const payment of paymentsData) {
    if (payment.shift) {
      const shiftId = payment.shift.id;

      if (!shiftSequenceCache.has(shiftId)) {
        const startOfDay = new Date(payment.shift.createdAt);
        startOfDay.setHours(0, 0, 0, 0);

        const sequence = await prisma.shift.count({
          where: {
            organizationId: organizationId,
            createdAt: {
              gte: startOfDay,
              lte: payment.shift.createdAt,
            },
          },
        });

        shiftSequenceCache.set(shiftId, sequence);
      }
      (payment.shift as any).shiftSequence = shiftSequenceCache.get(shiftId);
    }
  }

  const groupedMap = new Map();
  const menuStatsMap = new Map<string, number>();
  const entertainerStatsMap = new Map<
    string,
    { count: number; price_sum: number; image: string | null }
  >();
  const employeeOrderCountMap = new Map<string, number>();

  const processedOrderIds = new Set<number>();

  for (const payment of paymentsData) {
    const orders = payment.runningRef?.order || [];

    for (const order of orders) {
      if (processedOrderIds.has(order.id)) continue;
      processedOrderIds.add(order.id);

      const code = order.order_running_code;
      if (!code) continue;

      if (!groupedMap.has(code)) {
        groupedMap.set(code, {
          id: code,
          order_running_code: code,
          table: order.table || payment.table,
          updatedAt: order.updatedAt,
          price_sum: 0,
          quantity: 0,
          status: order.status,
          foodList: [],
          entertainerList: [],
          currencyLabel: order.menu?.unitPrice?.label || "",
          employeeName: order.employeeId
            ? employeeMap.get(String(order.employeeId)) || "ไม่ทราบชื่อพนักงาน"
            : "สั่งผ่านระบบ",
          paymentInfo: payment, 
        });
      }

      const group = groupedMap.get(code);
      group.price_sum += order.price_sum;
      group.quantity += order.quantity;

      const isEntertainerItem = !!order.menu?.mcEmployeeId;
      const prName = isEntertainerItem
        ? employeeMap.get(String(order.menu.mcEmployeeId)) || null
        : null;

      const itemData = {
        name: order.menu?.menuName || "ไม่ทราบชื่อ",
        image: order.menu?.img || null,
        prName: prName,
        quantity: order.quantity,
        categoryName: order.menu?.category?.categoryName || "ไม่มีหมวดหมู่",
      };

      if (isEntertainerItem) {
        group.entertainerList.push(itemData);
      } else {
        group.foodList.push(itemData);
      }

      if (new Date(order.updatedAt) > new Date(group.updatedAt)) {
        group.updatedAt = order.updatedAt;
      }

      const qty = order.quantity || 0;
      const price = order.price_sum || 0;

      // สถิติพนักงานรับออเดอร์
      const takerId = order.employeeId ? String(order.employeeId) : "system";
      employeeOrderCountMap.set(
        takerId,
        (employeeOrderCountMap.get(takerId) || 0) + qty,
      );

      // สถิติ Entertainer vs อาหาร
      if (isEntertainerItem) {
        const entId = String(order.menu.mcEmployeeId);
        const currentEnt = entertainerStatsMap.get(entId) || {
          count: 0,
          price_sum: 0,
          image: null,
        };

        entertainerStatsMap.set(entId, {
          count: currentEnt.count + qty,
          price_sum: currentEnt.price_sum + price,
          image: currentEnt.image || order.menu?.img || null,
        });
      } else {
        const menuName = order.menu?.menuName || "ไม่ทราบชื่อ";
        menuStatsMap.set(menuName, (menuStatsMap.get(menuName) || 0) + qty);
      }
    }
  }

  const itemsData = Array.from(groupedMap.values());
  itemsData.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const prRankData = Array.from(entertainerStatsMap.entries())
    .map(([id, stats]) => ({
      id: id,
      name: employeeMap.get(id) || "ไม่ทราบชื่อ",
      image: stats.image,
      quantity: stats.count,
      price_sum: stats.price_sum,
    }))
    .sort((a, b) => b.quantity - a.quantity);

  const topFood =
    Array.from(menuStatsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)[0] || null;

  const topEntertainer =
    prRankData.length > 0
      ? { name: prRankData[0].name, count: prRankData[0].quantity }
      : null;

  const topEmployee =
    Array.from(employeeOrderCountMap.entries())
      .map(([id, count]) => ({
        name:
          id === "system"
            ? "สั่งผ่านระบบ (ลูกค้า)"
            : employeeMap.get(id) || "ไม่ทราบชื่อพนักงาน",
        count,
      }))
      .sort((a, b) => b.count - a.count)[0] || null;

  return (
    <div>
      <OrderRankingDashboard
        initialItems={itemsData}
        id_user={userId}
        organizationId={organizationId}
        topFood={topFood}
        topEntertainer={topEntertainer}
        topEmployee={topEmployee}
        prRankData={prRankData}
      />
    </div>
  );
};

export default page;
