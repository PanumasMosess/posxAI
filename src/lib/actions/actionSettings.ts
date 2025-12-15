"use server";

import { PrinterSchema, TableSchema } from "../formValidationSchemas";
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
