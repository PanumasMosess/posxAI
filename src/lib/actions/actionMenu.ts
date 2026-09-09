"use server";

import prisma from "../prisma";
import { MenuSchema } from "../formValidationSchemas";
import { CartItemPayload } from "../type";
import dayjs from "dayjs";

type CurrentState = { success: boolean; error: boolean };

export const createMenu = async (
  currentState: CurrentState,
  data: MenuSchema,
) => {
  try {
    await prisma.$transaction(async (tx) => {
      const updatedCategory = await tx.categorystock.update({
        where: { id: data.categoryMenuId },
        data: {
          menuRunningNumber: { increment: 1 },
        },
        select: { categoryCode: true, menuRunningNumber: true },
      });
      const catCode = updatedCategory.categoryCode || "XXX";
      const generatedMenuCode = `${catCode}${updatedCategory.menuRunningNumber}`;

      await tx.menu.create({
        data: {
          menuCode: generatedMenuCode,
          menuName: data.menuName,
          price_sale: data.price_sale,
          price_cost: data.price_cost,
          unit: data.unit,
          description: data.description || null,
          status: "READY_TO_SELL",
          img: data.img || null,
          createdById: data.createdById,
          organizationId: data.organizationId,
          categoryMenuId: data.categoryMenuId,
          unitPriceId: data.unitPriceId,
          mcEmployeeId: data.mcEmployeeId || null,

          // ✅ เพิ่ม 2 ฟิลด์นี้สำหรับระบบราคาเหมา
          package_hours: data.package_hours || null,
          price_package: data.price_package || null,

          modifiers: {
            create: data.modifierGroupIds?.map((groupId) => ({
              modifierGroup: { connect: { id: groupId } },
              organization: { connect: { id: data.organizationId } },
            })),
          },
        },
      });
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateMenu = async (
  currentState: CurrentState,
  data: MenuSchema,
) => {
  try {
    const updatedStock = await prisma.menu.update({
      where: {
        id: data.id,
      },
      data: {
        menuName: data.menuName,
        price_sale: data.price_sale,
        price_cost: data.price_cost,
        unit: data.unit,
        description: data.description || null,
        img: data.img || null,
        status: data.status,
        updatedAt: new Date(),

        // ✅ ใช้ ID ตรงๆ เหมือนตอน Create
        createdById: data.createdById,
        categoryMenuId: data.categoryMenuId,
        unitPriceId: data.unitPriceId,
        mcEmployeeId: data.mcEmployeeId || null,

        // ✅ เพิ่ม 2 ฟิลด์นี้สำหรับระบบราคาเหมา
        package_hours: data.package_hours || null,
        price_package: data.price_package || null,

        modifiers: {
          deleteMany: {},
          create: data.modifierGroupIds?.map((groupId) => ({
            modifierGroup: { connect: { id: groupId } },
            organization: { connect: { id: data.organizationId } },
          })),
        },
      },
    });

    return { success: true, error: false, data: updatedStock };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, data: "" };
  }
};

export const deleteMenu = async (data: any) => {
  try {
    await prisma.stock.update({
      where: {
        id: data.id,
      },
      data: {
        status: data.status,
        creator: {
          connect: {
            id: data.creator_id,
          },
        },
      },
    });

    // revalidatePath("/stocks");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateImageMenu = async (data: any) => {
  try {
    const updatedStock = await prisma.menu.update({
      where: {
        id: data.id,
      },
      data: {
        img: data.img,
        createdById: data.createdById,
        updatedAt: new Date(),
      },
      include: {
        category: true,
      },
    });

    // revalidatePath("/stocks");
    return { success: true, error: false, data: updatedStock };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, data: "" };
  }
};

export const createMenuToCart = async (data: any) => {
  try {
    const modifiers = data.modifiers || [];
    await prisma.cart.create({
      data: {
        quantity: data.quantity,
        price_sum: data.price_sum,
        price_pre_unit: data.price_pre_unit,
        menuId: data.menuId,
        tableId: data.tableId,
        status: "ON_CART",
        note: data.note,
        organizationId: data.organizationId,
        employeeId: data.employeeId || null,
        modifiers: {
          create: modifiers.map((mod: any) => ({
            modifierItemId: mod.modifierItemId,
            name: mod.name,
            price: mod.price,
          })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateMenuInCart = async (data: any) => {
  try {
    const updatedCart = await prisma.cart.update({
      where: {
        id: data.id,
        menuId: data.menuId,
      },
      data: {
        quantity: data.quantity,
        price_sum: data.price_sum,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: updatedCart };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, data: "" };
  }
};

export const deleteMenuInCart = async (data: any) => {
  try {
    await prisma.cart.delete({
      where: {
        id: data.id,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createOrder = async (items: CartItemPayload[]) => {
  try {
    const organizationId = items[0].organizationId;
    const tableId = items[0].tableId;

    const result = await prisma.$transaction(async (tx) => {
      const currentTable = await tx.table.findUnique({
        where: { id: tableId },
      });

      if (!currentTable) {
        return { success: false, error: true, message: "Table not found" };
      }

      const menuIds = items.map((item) => item.menuId);
      const menusInfo = await tx.menu.findMany({
        where: { id: { in: menuIds } },
        include: { category: true },
      });

      const menuCategoryMap = new Map();
      menusInfo.forEach((menu) => {
        menuCategoryMap.set(menu.id, {
          categoryName: menu.category?.categoryName,
          requiresKitchen: menu.category?.requiresKitchen,
        });
      });

      let runningCode = "";
      let shouldGroupWithOldOrder = false;
      const emptyStatuses = ["AVAILABLE", "DIRTY", "WAIT_BOOKING"];

      if (tableId !== 0 && !emptyStatuses.includes(currentTable.status)) {
        shouldGroupWithOldOrder = true;
      }

      if (shouldGroupWithOldOrder) {
        const lastActiveOrder = await tx.order.findFirst({
          where: {
            tableId: tableId,
            organizationId: organizationId,
            status: { notIn: ["PAY_COMPLETED", "CANCELLED"] },
          },
          orderBy: { createdAt: "desc" },
        });

        if (lastActiveOrder && lastActiveOrder.order_running_code) {
          runningCode = lastActiveOrder.order_running_code;
        }
      }

      // ==========================================
      // 🚨 การสร้างเลขคิวใหม่แบบ "เรียงวิ 0001", "รีเซ็ตตามวัน", "ป้องกันกดพร้อมกัน"
      // ==========================================
      if (!runningCode) {
        // 1. ดึงข้อมูลตาราง OrderRunning แถวล่าสุดของร้านมา เพื่อใช้ทำเป็นกุญแจล็อก (Row Lock)
        const latestRun = await tx.orderrunning.findFirst({
          where: { organizationId },
          orderBy: { id: "desc" },
        });

        // 2. 🔒 ล็อกคิว! ด้วยคำสั่ง Update หลอกๆ
        // Database จะสั่งบล็อกรายการสั่งอาหารจากโต๊ะอื่นที่เข้ามาพร้อมกัน ให้ยืนรอจนกว่าคิวนี้จะทำงานเสร็จ
        if (latestRun) {
          await tx.orderrunning.update({
            where: { id: latestRun.id },
            data: { organizationId }, // แค่สั่งอัปเดตค่าเดิม เพื่อให้เกิดการ Lock
          });
        }

        // 3. แปลงเวลาเป็นไทย (UTC+7) เสมอ เพื่อการตัดรอบวันที่ถูกต้องเป๊ะๆ
        const thaiTime = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
        const yyyy = thaiTime.getUTCFullYear();
        const mm = String(thaiTime.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(thaiTime.getUTCDate()).padStart(2, "0");
        const dateStr = `${yyyy}${mm}${dd}`; // ผลลัพธ์: 20260909

        // 4. ดึงบิลล่าสุดของ "วันนี้" เท่านั้น (ถ้ารหัสไม่มีวันที่ของวันนี้แปลว่าขึ้นวันใหม่)
        const lastToday = await tx.orderrunning.findFirst({
          where: {
            organizationId,
            runningCode: { contains: dateStr }, // กรองหาเฉพาะบิลที่มีคำว่า 20260909
          },
          orderBy: { id: "desc" },
        });

        let nextSequence = 1; // เริ่มต้นที่ 0001 ทันทีถ้ายังไม่มีบิลของวันนี้

        if (lastToday && lastToday.runningCode) {
          const parts = lastToday.runningCode.split("-");
          const lastNumber = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(lastNumber)) {
            nextSequence = lastNumber + 1; // นำบิลล่าสุดของวันนี้มา +1
          }
        }

        // 5. จัด Format บิลให้เป็น 0001, 0002
        runningCode = `Q-${organizationId}-${dateStr}-${String(nextSequence).padStart(4, "0")}`;

        // 6. บันทึกลงตาราง ให้คนต่อไปที่รอคิวอยู่เอาไปรันต่อได้
        await tx.orderrunning.create({
          data: { runningCode, organizationId },
        });
      }

      for (const item of items) {
        const modifiersList = item.modifiers || [];
        const categoryInfo = menuCategoryMap.get(item.menuId);

        let orderStatus = "NEW";
        if (categoryInfo?.categoryName === "Entertainer") {
          orderStatus = "READY";
        } else if (
          categoryInfo?.requiresKitchen === false ||
          categoryInfo?.requiresKitchen === 0
        ) {
          orderStatus = "READY";
        }

        await tx.order.create({
          data: {
            quantity: item.quantity,
            price_sum: item.price_sum,
            price_pre_unit: item.price_pre_unit,
            menuId: item.menuId,
            tableId: item.tableId,
            status: orderStatus,
            organizationId: item.organizationId,
            order_running_code: runningCode,
            note: item.note || null,
            employeeId: item.employeeId || null,
            orderitems: {
              create: {
                menuId: item.menuId,
                quantity: item.quantity,
                price: item.price_pre_unit,
                organizationId: item.organizationId,
                selectedModifiers: {
                  create: modifiersList.map((mod: any) => ({
                    modifierItemId: mod.modifierItemId,
                    price: mod.price,
                    organizationId: item.organizationId,
                  })),
                },
              },
            },
          },
        });
      }

      const newBillStatuses = ["AVAILABLE", "DIRTY", "WAIT_BOOKING"];
      if (newBillStatuses.includes(currentTable.status)) {
        await tx.table.update({
          where: { id: tableId },
          data: { status: "BUSY" },
        });
      }

      return { success: true, error: false };
    });

    return result;
  } catch (err) {
    console.log("Create Order Transaction Error:", err);
    return {
      success: false,
      error: true,
      message: err instanceof Error ? err.message : "Unknown Error",
    };
  }
};

export const updateCartStatusNEW = async (items: CartItemPayload[]) => {
  try {
    const cartIds = items.map((item) => item.id);
    if (cartIds.length === 0) {
      return { success: true, error: null, message: "No items to update." };
    }

    const result = await prisma.cart.updateMany({
      where: {
        id: {
          in: cartIds,
        },
      },
      data: {
        status: "CONFIRM_CART",
      },
    });

    return {
      success: true,
      error: null,
      count: result.count,
    };
  } catch (err) {
    console.error("PRISMA ERROR updating cart status:", err);
    return { success: false, error: "Failed to update cart status." };
  }
};

export const updateStatusOrder = async (idOrder: number, status: string) => {
  try {
    const updatedOrderStatus = await prisma.order.update({
      where: {
        id: idOrder,
      },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: "" };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};

export const updateTableStatus = async (
  items: CartItemPayload[],
  status: string,
) => {
  try {
    const tableIds = [...new Set(items.map((item) => item.tableId))];

    if (tableIds.length === 0) {
      return { success: true, error: false, data: "No tables to update" };
    }

    const result = await prisma.table.updateMany({
      where: {
        id: {
          in: tableIds,
        },
      },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: result };
  } catch (err) {
    console.error("Update Table Error:", err);
    return { success: false, error: true, data: err };
  }
};

export const getKitchenOrders = async (organizationId: number) => {
  try {
    const orderRunning = await prisma.order.findMany({
      where: {
        organizationId: Number(organizationId),
        status: {
          notIn: ["COMPLETED", "CANCELLED", "PAY_COMPLETED"],
        },
      },
      include: {
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
      orderBy: {
        createdAt: "asc",
      },
    });

    return { orderRunning };
  } catch (error) {
    console.error("Failed to fetch kitchen orders:", error);
    throw new Error("Failed to fetch kitchen orders");
  }
};
