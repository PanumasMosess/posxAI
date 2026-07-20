import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import HistoryPaymentPage from "@/components/history/HistoryPaymentPage";
import { HistoryPayment } from "@/lib/type";

export const dynamic = "force-dynamic";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;

  const [allEmployees, rawItemsData, allShifts] = await Promise.all([
    prisma.employeepin.findMany({
      where: { organizationId: organizationId },
      select: { id: true, name: true, surname: true },
    }),

    prisma.paymentorder.findMany({
      where: {
        organizationId: organizationId,
      },
      take: 1000,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        totalAmount: true,
        paymentMethod: true,
        cashReceived: true,
        change: true,
        table: { select: { tableName: true } },
        creator: { select: { id: true, name: true, surname: true } },
        shift: { select: { id: true, openedAt: true } },
        runningRef: {
          select: {
            runningCode: true,
            order: {
              select: {
                id: true,
                employeeId: true,
                quantity: true,
                menu: {
                  select: {
                    id: true,
                    menuName: true,
                    img: true,
                    mcEmployeeId: true,
                    unitPrice: { select: { label: true } },
                  },
                },
              },
            },
          },
        },
      },
    }),

    prisma.shift.findMany({
      where: { organizationId: organizationId },
      select: { id: true, openedAt: true },
      orderBy: { openedAt: "asc" },
    }),
  ]);

  const employeeMap = new Map();
  for (const emp of allEmployees) {
    employeeMap.set(String(emp.id), `${emp.name} ${emp.surname}`);
  }

  const shiftSequenceCache = new Map();
  const shiftsGroupedByDate = new Map();

  for (const s of allShifts) {
    if (!s.openedAt) continue;
    const dateStr = new Date(s.openedAt).setHours(0, 0, 0, 0);
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

  // 🟢 กำหนด Type ให้ตัวแปรตั้งแต่ตรงนี้เลย เพื่อให้ตอนส่ง Props เป็นแค่ {itemsData} เพียวๆ
  const itemsData: HistoryPayment[] = rawItemsData.map((payment) => {
    const shiftId = payment.shift?.id;
    const sequence = shiftId ? shiftSequenceCache.get(shiftId) : undefined;

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
        const isDuplicate = entertainerList.some((ent) => ent.prName === prName);
        if (!isDuplicate) {
          entertainerList.push(itemData);
        }
      } else {
        foodList.push(itemData);
      }
    }

    const mappedRunningRef = payment.runningRef
      ? {
          runningCode: payment.runningRef.runningCode,
          order: payment.runningRef.order.map((o) => ({
            id: (o as any).id || 0,
            quantity: o.quantity || 1,
            price_sum: 0,
            price_pre_unit: 0,
            status: "COMPLETED",
            note: null,
            employeeId: o.employeeId || null,
            menu: {
              id: (o.menu as any)?.id || 0,
              menuName: o.menu?.menuName || "ไม่ทราบชื่อ",
              img: o.menu?.img || null,
              mcEmployeeId: o.menu?.mcEmployeeId || null,
              price_sale: 0,
              unit: "-",
              unitPrice: o.menu?.unitPrice || { label: "บาท" },
            },
          })),
        }
      : null;

    return {
      ...payment,
      cashReceived: payment.cashReceived ? Number(payment.cashReceived) : 0,
      change: payment.change ? Number(payment.change) : 0,
      shift: payment.shift
        ? {
            id: payment.shift.id,
            createdAt: payment.shift.openedAt,
            shiftSequence: sequence,
          }
        : null,
      orderTakerName,
      foodList,
      entertainerList,
      currencyLabel: currencyLabel || "บาท",
      runningRef: mappedRunningRef,
    };
  }); 


  return (
    <HistoryPaymentPage
      initialItems={itemsData} 
      userId={userId}
      organizationId={organizationId}
    />
  );
};

export default page;