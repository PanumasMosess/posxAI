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
        in: ["COMPLETED", "CANCELLED", "PAY_COMPLETED"],
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
    select: { id: true, name: true, surname: true },
  });

  const employeeMap = new Map();
  for (const emp of allEmployees) {
    employeeMap.set(String(emp.id), `${emp.name} ${emp.surname}`);
  }

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
        // 🟢 แยก Array ออกเป็น 2 ถังในบิลเดียว
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
    };

    if (isEntertainerItem) {
      group.entertainerList.push(itemData);
    } else {
      group.foodList.push(itemData);
    }

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
