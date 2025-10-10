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
        }
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
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false, data: updatedStock };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, data: "" };
  }

 return { success: true, error: false, data: "" };
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