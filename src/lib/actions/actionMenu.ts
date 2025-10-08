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
//    try {
//     const updatedStock = await prisma.menu.update({
//       where: {
//         id: data.id,
//       },
//       data: {
//         productName: data.product_stock,
//         quantity: data.pcs_stock,
//         price: data.price_now_stock,
//         unit: data.unit_stock,
//         description: data.description_stock || null,
//         img: data.img_stock || null,
//         updatedAt: new Date(),
//         createdById: data.creator_id,
//         categoryId: data.category_id,
//         supplierId: data.supplier_id,
//       },
//     });

//     // revalidatePath("/list/subjects");
//     return { success: true, error: false, data: updatedStock };
//   } catch (err) {
//     console.log(err);
//     return { success: false, error: true, data: "" };
//   }

 return { success: true, error: false, data: "" };
};