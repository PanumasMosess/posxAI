"use server";

import prisma from "../prisma";
import { MenuSchema } from "../formValidationSchemas";

type CurrentState = { success: boolean; error: boolean };

export const createMenu = async (
  currentState: CurrentState,
  data: MenuSchema
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
  data: MenuSchema
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
    await prisma.cart.create({
      data: {
        quantity: data.quantity,
        price_sum: data.totalPrice,
        price_pre_unit: data.priceUnit,
        menuId: data.menuId,
        tableId: data.tableId,
        status: "ON_CART",
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
