"use server";

import {
  CategorySchema,
  FormularStockSchema_,
  StockSchema,
  SupplierSchema,
} from "../formValidationSchemas";
import prisma from "../prisma";

type CurrentState = { success: boolean; error: boolean };

export type BillItem = {
  productName: string;
  description: string;
  unit: string;
  quantity: number;
  price: number;
  img?: string;
};

interface CreateStockPayload {
  items: BillItem[];
  creator_id: number;
  category_id: number;
  supplier_id: number;
}

interface FormularPayload {
  items: {
    pcs_update: number;
    status: string;
    stockId: number;
    menuId: number;
  }[];
}

export const createStock = async (
  currentState: CurrentState,
  data: StockSchema
) => {
  try {
    await prisma.stock.create({
      data: {
        productName: data.product_stock,
        quantity: data.pcs_stock,
        price: data.price_now_stock,
        unit: data.unit_stock,
        description: data.description_stock || null,
        img: data.img_stock || null,
        creator: {
          connect: {
            id: data.creator_id,
          },
        },
        category: {
          connect: {
            id: data.category_id,
          },
        },
        supplier: {
          connect: {
            id: data.supplier_id,
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

export const createStockByImg = async (
  currentState: CurrentState,
  payload: CreateStockPayload
) => {
  try {
    const { items, creator_id, category_id, supplier_id } = payload;

    const productNames = items.map((item) => `SKU: ${item.productName}`);

    const existingStocks = await prisma.stock.findMany({
      where: {
        productName: {
          in: productNames,
        },
      },
    });

    const existingStockMap = new Map(
      existingStocks.map((s) => [s.productName, s])
    );

    const itemsToCreate: any[] = [];
    const updatePromises: any[] = [];

    items.forEach((item) => {
      const existingStock = existingStockMap.get(`SKU: ${item.productName}`);

      if (existingStock) {
        const updatePromise = prisma.stock.update({
          where: { id: existingStock.id },
          data: {
            quantity: existingStock.quantity + item.quantity,
            price: item.price,
            updatedAt: new Date(),
          },
        });
        updatePromises.push(updatePromise);
      } else {
        itemsToCreate.push({
          productName: `SKU: ${item.productName}`,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit,
          createdById: creator_id,
          categoryId: category_id,
          supplierId: supplier_id,
        });
      }
    });

    let createdCount = 0;
    if (itemsToCreate.length > 0) {
      const createResult = await prisma.stock.createMany({
        data: itemsToCreate,
        skipDuplicates: true,
      });
      createdCount = createResult.count;
      console.log(createResult);
    }

    await Promise.all(updatePromises);

    // const dataToCreate = items.map((item) => ({
    //   productName: `SKU: ${item.productName}`,
    //   quantity: item.quantity || 0,
    //   price: item.price || 0,
    //   unit: item.unit,
    //   description: item.description,
    //   img: item.img || null,

    //   createdById: creator_id,
    //   categoryId: category_id,
    //   supplierId: supplier_id,
    // }));

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStock = async (
  currentState: CurrentState,
  data: StockSchema
) => {
  try {
    const updatedStock = await prisma.stock.update({
      where: {
        id: data.id,
      },
      data: {
        productName: data.product_stock,
        quantity: data.pcs_stock,
        price: data.price_now_stock,
        unit: data.unit_stock,
        description: data.description_stock || null,
        img: data.img_stock || null,
        updatedAt: new Date(),
        createdById: data.creator_id,
        categoryId: data.category_id,
        supplierId: data.supplier_id,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false, data: updatedStock };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, data: "" };
  }
};

export const updateImageStock = async (data: any) => {
  try {
    const updatedStock = await prisma.stock.update({
      where: {
        id: data.id,
      },
      data: {
        img: data.img_stock,
        createdById: data.creator_id,
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

export const deleteStock = async (data: any) => {
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

export const crearteCategories = async (
  currentState: CurrentState,
  data: CategorySchema
) => {
  try {
    await prisma.categorystock.create({
      data: {
        categoryName: data.categoryName,
        creator: {
          connect: {
            id: data.createdById,
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

export const updateCategories = async (
  currentState: CurrentState,
  data: CategorySchema
) => {
  try {
    const updatedCategory = await prisma.categorystock.update({
      where: {
        id: data.id,
      },
      data: {
        categoryName: data.categoryName,
        updatedAt: new Date(),
        createdById: data.createdById,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false, data: updatedCategory };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, data: "" };
  }
};

export const deleteCategories = async (data: any) => {
  try {
    await prisma.categorystock.delete({
      where: {
        id: data.id,
      },
    });

    // revalidatePath("/stocks");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const crearteSupplier = async (
  currentState: CurrentState,
  data: SupplierSchema
) => {
  try {
    await prisma.supplier.create({
      data: {
        supplierName: data.supplierName,
        creator: {
          connect: {
            id: data.createdById,
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

export const updateSupplier = async (
  currentState: CurrentState,
  data: SupplierSchema
) => {
  try {
    const updatedSupplierName = await prisma.supplier.update({
      where: {
        id: data.id,
      },
      data: {
        supplierName: data.supplierName,
        updatedAt: new Date(),
        createdById: data.createdById,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false, data: updatedSupplierName };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, data: "Supplier" };
  }
};

export const deleteSupplier = async (data: any) => {
  try {
    await prisma.supplier.delete({
      where: {
        id: data.id,
      },
    });

    // revalidatePath("/stocks");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const crearteFormularStock = async (
  currentState: CurrentState,
  data: FormularPayload
) => {
  try {
    const dataToCreate = data.items.map((item) => (
      {
      stockId: item.stockId,
      pcs_update: item.pcs_update,
      menuId: item.menuId,
    }

  ));
    await prisma.formularstock.createMany({
      data: dataToCreate,
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
