"use server";

import {
  ModifierGroupSchema,
  ModifierItemSchema,
  PrinterSchema,
  TableSchema,
} from "../formValidationSchemas";
import prisma from "../prisma";
type CurrentState = { success: boolean; error: boolean };

export const createTable = async (
  currentState: CurrentState,
  data: TableSchema
) => {
  try {
    await prisma.table.create({
      data: {
        tableName: data.tableName,
        status: data.status,
        creator: {
          connect: {
            id: data.closeById,
          },
        },
        organization: {
          connect: {
            id: data.organizationId,
          },
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStatusTable = async (id: number, status: string) => {
  try {
    const updatedTableStatus = await prisma.table.update({
      where: {
        id: id,
      },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: updatedTableStatus };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};

export const updateNameTable = async (id: number, tableName: string) => {
  try {
    const updatedTableName = await prisma.table.update({
      where: {
        id: id,
      },
      data: {
        tableName: tableName,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: updatedTableName };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};

export const createPrinter = async (
  currentState: CurrentState,
  data: PrinterSchema
) => {
  try {
    await prisma.printer.create({
      data: {
        printerName: data.printerName,
        stationUse: data.stationUse,
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
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStationUse = async (id: number, station: string) => {
  try {
    const updatedTableStatus = await prisma.printer.update({
      where: {
        id: id,
      },
      data: {
        stationUse: station,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: updatedTableStatus };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};

export const updateNamePrinter = async (id: number, printerName: string) => {
  try {
    const updatedTableName = await prisma.printer.update({
      where: {
        id: id,
      },
      data: {
        printerName: printerName,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: updatedTableName };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};

export const crearteModifierGroup = async (
  currentState: CurrentState,
  data: ModifierGroupSchema
) => {
  try {
    await prisma.modifiergroup.create({
      data: {
        name: data.name,
        minSelect: data.minSelect,
        maxSelect: data.maxSelect,
        status: "running",
        organization: {
          connect: {
            id: data.organizationId,
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

export const updateModifierGroup = async (
  currentState: CurrentState,
  data: ModifierGroupSchema
) => {
  try {
    const updatedCategory = await prisma.modifiergroup.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        minSelect: data.minSelect,
        maxSelect: data.maxSelect,
        organizationId: data.organizationId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false, data: updatedCategory };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, data: "" };
  }
};

export const deleteModifierGroup = async (data: any) => {
  try {
    await prisma.modifiergroup.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        status: "stop",
      },
    });

    // revalidatePath("/stocks");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const crearteModifierItem = async (
  currentState: CurrentState,
  data: ModifierItemSchema
) => {
  try {
    await prisma.modifieritem.create({
      data: {
        name: data.name,
        price: data.price,
        organization: {
          connect: {
            id: data.organizationId,
          },
        },
        group: {
          connect: {
            id: data.groupId,
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

export const updateModifierItem = async (
  currentState: CurrentState,
  data: ModifierItemSchema
) => {
  try {
    const updatedCategory = await prisma.modifieritem.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        price: data.price,
        groupId: data.groupId,
        organizationId: data.organizationId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false, data: updatedCategory };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, data: "" };
  }
};

export const deleteModifierItem = async (data: any) => {
  try {
    await prisma.modifieritem.delete({
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
