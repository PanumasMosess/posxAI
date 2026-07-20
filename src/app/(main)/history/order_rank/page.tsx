import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import OrderRankingDashboard from "@/components/history/OrderRankingDashboard";

export const dynamic = "force-dynamic";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;

  // 🟢 1. รีดไขมัน + ใช้ Promise.all ดึงพร้อมกันทีเดียว (ไม่ติด N+1 Query)
  const [allEmployees, allShifts, paymentsData] = await Promise.all([
    prisma.employeepin.findMany({
      where: { organizationId: Number(organizationId) },
      select: { id: true, name: true, surname: true },
    }),

    // ดึง Shift ทั้งหมดมาคำนวณ Sequence ข้างนอก Loop
    prisma.shift.findMany({
      where: { organizationId: Number(organizationId) },
      select: { id: true, openedAt: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),

    prisma.paymentorder.findMany({
      where: {
        organizationId: Number(organizationId),
      },
    
      select: {
        id: true,
        createdAt: true,
        table: true,
        shift: {
          select: { id: true, createdAt: true, openedAt: true },
        },
        runningRef: {
          select: {
            order: {
              where: {
                status: "PAY_COMPLETED",
              },
              select: {
                id: true,
                order_running_code: true,
                updatedAt: true,
                price_sum: true,
                quantity: true,
                status: true,
                employeeId: true,
                table: true,
                menu: {
                  select: {
                    menuName: true,
                    img: true,
                    mcEmployeeId: true,
                    unitPrice: { select: { label: true } },
                    category: { select: { categoryName: true } },
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
    }),
  ]);

  const employeeMap = new Map();
  for (const emp of allEmployees) {
    employeeMap.set(String(emp.id), `${emp.name} ${emp.surname}`);
  }

  const shiftSequenceCache = new Map();
  const shiftsGroupedByDate = new Map();

  for (const s of allShifts) {
    const refDate = s.openedAt || s.createdAt;
    if (!refDate) continue;
    const dateStr = new Date(refDate).setHours(0, 0, 0, 0);
    if (!shiftsGroupedByDate.has(dateStr)) {
      shiftsGroupedByDate.set(dateStr, []);
    }
    shiftsGroupedByDate.get(dateStr).push(s);
  }

  shiftsGroupedByDate.forEach((shiftsInDay) => {
    shiftsInDay.forEach((s: any, index: number) => {
      shiftSequenceCache.set(s.id, index + 1);
    });
  });

  const groupedMap = new Map();
  const menuStatsMap = new Map<string, number>();
  const entertainerStatsMap = new Map<
    string,
    { count: number; price_sum: number; image: string | null }
  >();
  const employeeOrderCountMap = new Map<string, number>();

  const prRawData: any[] = [];
  const processedOrderIds = new Set<number>();

  for (const payment of paymentsData) {
    const orders = payment.runningRef?.order || [];
    const shiftSeq = payment.shift?.id
      ? shiftSequenceCache.get(payment.shift.id) || null
      : null;

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
          currencyLabel: order.menu?.unitPrice?.label || "LAK",
          employeeName: order.employeeId
            ? employeeMap.get(String(order.employeeId)) || "ไม่ทราบชื่อพนักงาน"
            : "สั่งผ่านระบบ",
          paymentInfo: payment,
          businessDate:
            payment.shift?.openedAt ||
            payment.shift?.createdAt ||
            payment.createdAt,
          shiftId: payment.shift?.id || null,
          shiftSequence: shiftSeq,
        });
      }

      const group = groupedMap.get(code);
      group.price_sum += order.price_sum;
      group.quantity += order.quantity;

      const isEntertainerItem = !!order.menu?.mcEmployeeId;
      const prName = isEntertainerItem
        ? employeeMap.get(String(order.menu.mcEmployeeId)) || null
        : null;

      const itemCurrency = order.menu?.unitPrice?.label || "LAK";

      const itemData = {
        name: order.menu?.menuName || "ไม่ทราบชื่อ",
        image: order.menu?.img || null,
        prName: prName,
        quantity: order.quantity,
        categoryName: order.menu?.category?.categoryName || "ไม่มีหมวดหมู่",
        price: order.price_sum || 0,
        currencyLabel: itemCurrency,
      };

      const qty = order.quantity || 0;
      const price = order.price_sum || 0;

      if (isEntertainerItem) {
        group.entertainerList.push(itemData);

        const entId = String(order.menu.mcEmployeeId);

        prRawData.push({
          id: entId,
          name: employeeMap.get(entId) || "ไม่ทราบชื่อ",
          image: order.menu?.img || null,
          quantity: qty,
          price_sum: price,
          currencyLabel: itemCurrency,
          businessDate:
            payment.shift?.openedAt ||
            payment.shift?.createdAt ||
            payment.createdAt,
          shiftId: payment.shift?.id || null,
          shiftSequence: shiftSeq,
        });

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
        group.foodList.push(itemData);
        const menuName = order.menu?.menuName || "ไม่ทราบชื่อ";
        menuStatsMap.set(menuName, (menuStatsMap.get(menuName) || 0) + qty);
      }

      if (new Date(order.updatedAt) > new Date(group.updatedAt)) {
        group.updatedAt = order.updatedAt;
      }

      const takerId = order.employeeId ? String(order.employeeId) : "system";
      employeeOrderCountMap.set(
        takerId,
        (employeeOrderCountMap.get(takerId) || 0) + qty,
      );
    }
  }

  const itemsData = Array.from(groupedMap.values());
  itemsData.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const prRankDataSummary = Array.from(entertainerStatsMap.entries())
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
    prRankDataSummary.length > 0
      ? {
          name: prRankDataSummary[0].name,
          count: prRankDataSummary[0].quantity,
        }
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
        prRankData={prRawData}
      />
    </div>
  );
};

export default page;
