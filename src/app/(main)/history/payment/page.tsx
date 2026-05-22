import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import HistoryPaymentPage from "@/components/history/HistoryPaymentPage";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;

  const itemsData = await prisma.paymentorder.findMany({
    where: {
      organizationId: organizationId,
    },
    include: {
      table: true,
      runningRef: {
        include: {
          order: {
            include: {
              menu: {
                include: {
                  unitPrice: true,
                },
              },
            },
          },
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
      shift: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const allEmployees = await prisma.employeepin.findMany({
    where: { organizationId: organizationId },
    select: { id: true, name: true, surname: true },
  });

  const employeeMap = new Map();
  for (const emp of allEmployees) {
    employeeMap.set(String(emp.id), `${emp.name} ${emp.surname}`);
  }

  const shiftSequenceCache = new Map();

  for (const payment of itemsData) {
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

    let orderTakerName = "สั่งผ่านระบบ";
    const ordersInBill = payment.runningRef?.order || [];

    if (ordersInBill.length > 0) {
      const firstOrderWithEmp = ordersInBill.find((o) => o.employeeId);
      if (firstOrderWithEmp) {
        orderTakerName =
          employeeMap.get(String(firstOrderWithEmp.employeeId)) ||
          "ไม่ทราบชื่อพนักงาน";
      }
    }
    (payment as any).orderTakerName = orderTakerName;

    const foodList: any[] = [];
    const entertainerList: any[] = [];
    let currencyLabel = "";

    for (const order of ordersInBill) {
      if (!currencyLabel && order.menu?.unitPrice?.label) {
        currencyLabel = order.menu.unitPrice.label;
      }

      const isEntertainerItem = !!order.menu?.mcEmployeeId;
      const prName = isEntertainerItem
        ? employeeMap.get(String(order.menu.mcEmployeeId)) || null
        : null;

      const itemData = {
        name: order.menu?.menuName || "ไม่ทราบชื่อ",
        image: order.menu?.img || null,
        prName: prName,
        quantity: order.quantity || 1,
      };

      if (isEntertainerItem) {
        const isDuplicate = entertainerList.some(
          (ent) => ent.prName === prName,
        );
        if (!isDuplicate) {
          entertainerList.push(itemData);
        }
      } else {
        foodList.push(itemData);
      }
    }

    (payment as any).foodList = foodList;
    (payment as any).entertainerList = entertainerList;
    (payment as any).currencyLabel = currencyLabel || "บาท";
  }

  return (
    <HistoryPaymentPage
      initialItems={itemsData}
      userId={userId}
      organizationId={organizationId}
    />
  );
};

export default page;
