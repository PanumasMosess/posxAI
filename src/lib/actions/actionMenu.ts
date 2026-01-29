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
    await prisma.menu.create({
      data: {
        menuName: data.menuName,
        price_sale: data.price_sale,
        price_cost: data.price_cost,
        unit: data.unit,
        description: data.description || null,
        status: "READY_TO_SELL",
        img: data.img || null,
        creator: {
          connect: {
            id: data.createdById,
          },
        },
        organization: {
          connect: {
            id: data.organizationId,
          },
        },
        category: {
          connect: {
            id: data.categoryMenuId,
          },
        },
        unitPrice: {
          connect: {
            id: data.unitPriceId,
          },
        },
        modifiers: {
          create: data.modifierGroupIds?.map((groupId) => ({
            modifierGroup: { connect: { id: groupId } },
            organization: { connect: { id: data.organizationId } },
          })),
        },
      },
    });

    // revalidatePath("/list/subjects");
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
        createdById: data.createdById,
        categoryMenuId: data.categoryMenuId,
        unitPriceId: data.unitPriceId,
        modifiers: {
          deleteMany: {},
          create: data.modifierGroupIds?.map((groupId) => ({
            modifierGroup: { connect: { id: groupId } },
            organization: { connect: { id: data.organizationId } },
          })),
        },
      },
    });

    // revalidatePath("/list/subjects");
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
        organizationId: data.organizationId,
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

    const currentTable = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!currentTable) {
      return { success: false, error: true, message: "Table not found" };
    }

    let runningCode = "";

    const newBillStatuses = ["AVAILABLE", "DIRTY", "WAIT_BOOKING"];

    if (!newBillStatuses.includes(currentTable.status)) {
      const lastOrder = await prisma.order.findFirst({
        where: {
          tableId: tableId,
          organizationId: organizationId,
          status: { notIn: ["PAY_COMPLETED", "CANCELLED"] },
        },
        orderBy: { createdAt: "desc" },
      });

      if (lastOrder && lastOrder.order_running_code) {
        runningCode = lastOrder.order_running_code;
      } else {
        const dateStr = dayjs().format("YYYYMMDD");
        const countToday = await prisma.orderrunning.count({
          where: {
            organizationId: organizationId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        });
        const nextSequence = countToday + 1;
        runningCode = `Q-${organizationId}-${dateStr}-${nextSequence
          .toString()
          .padStart(4, "0")}`;

        await prisma.orderrunning.create({
          data: { runningCode, organizationId },
        });
      }
    } else {
      const dateStr = dayjs().format("YYYYMMDD");
      const countToday = await prisma.orderrunning.count({
        where: {
          organizationId: organizationId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      });

      const nextSequence = countToday + 1;
      runningCode = `Q-${organizationId}-${dateStr}-${nextSequence
        .toString()
        .padStart(4, "0")}`;

      await prisma.orderrunning.create({
        data: {
          runningCode: runningCode,
          organizationId: organizationId,
        },
      });
    }

    const transactionOperations: any[] = items.map((item) => {
      const modifiersList = item.modifiers || [];
      return prisma.order.create({
        data: {
          quantity: item.quantity,
          price_sum: item.price_sum,
          price_pre_unit: item.price_pre_unit,
          menuId: item.menuId,
          tableId: item.tableId,
          status: "NEW",
          organizationId: item.organizationId,
          order_running_code: runningCode,
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
    });

    if (newBillStatuses.includes(currentTable.status)) {
      transactionOperations.push(
        prisma.table.update({
          where: { id: tableId },
          data: { status: "BUSY" },
        }),
      );
    }

    await prisma.$transaction(transactionOperations);

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
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
