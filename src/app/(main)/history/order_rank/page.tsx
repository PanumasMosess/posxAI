import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import OrderRankingDashboard from "@/components/history/OrderRankingDashboard";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;

  const rawOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ["PAY_COMPLETED"],
      },
      organizationId: organizationId,
    },
    include: {
      menu: { include: { unitPrice: true } },
      table: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const allEmployees = await prisma.employeepin.findMany({
    where: { organizationId: organizationId },
    select: { id: true, name: true, surname: true }, // ไม่ต้องดึง img จากพนักงานแล้ว
  });

  const employeeMap = new Map();

  for (const emp of allEmployees) {
    employeeMap.set(String(emp.id), `${emp.name} ${emp.surname}`);
  }

  const groupedMap = new Map();

  const menuStatsMap = new Map<string, number>();

  // 🟢 1. เพิ่ม property 'image' เข้าไปใน Map สำหรับเก็บรูปจาก order
  const entertainerStatsMap = new Map<
    string,
    { count: number; price_sum: number; image: string | null }
  >();

  const employeeOrderCountMap = new Map<string, number>();

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
        foodList: [],
        entertainerList: [],
        currencyLabel: order.menu?.unitPrice?.label || "",
        employeeName: order.employeeId
          ? employeeMap.get(String(order.employeeId)) || "ไม่ทราบชื่อพนักงาน"
          : "สั่งผ่านระบบ",
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
    };

    if (isEntertainerItem) {
      group.entertainerList.push(itemData);
    } else {
      group.foodList.push(itemData);
    }

    if (new Date(order.updatedAt) > new Date(group.updatedAt)) {
      group.updatedAt = order.updatedAt;
    }

    if (order.status !== "CANCELLED") {
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
          image: null, // ค่าเริ่มต้น
        };

        // 🟢 2. เก็บรูปจาก order.menu.img (ถ้ามีรูปใหม่มา ก็เก็บไว้ หรือจะใช้รูปแรกที่เจอก็ได้)
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

  const groupedOrders = Array.from(groupedMap.values());
  const orderRunningCodes = groupedOrders.map((o) => o.order_running_code);

  const payments = await prisma.paymentorder.findMany({
    where: { order_running_code: { in: orderRunningCodes } },
    include: {
      shift: true,
      creator: true,
    },
  });

  const shiftSequenceCache = new Map();

  for (const payment of payments) {
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

  const itemsData = groupedOrders.map((group) => {
    const matchingPayment = payments.find(
      (p) => p.order_running_code === group.order_running_code,
    );
    return { ...group, paymentInfo: matchingPayment || null };
  });

  itemsData.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const prRankData = Array.from(entertainerStatsMap.entries())
    .map(([id, stats]) => ({
      id: id,
      name: employeeMap.get(id) || "ไม่ทราบชื่อ",
      image: stats.image, // 🟢 3. ดึงรูปที่เก็บไว้ใน stats มาใช้ได้เลย (มาจาก order)
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
