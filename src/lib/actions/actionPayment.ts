"use server";

import prisma from "../prisma";
import { MenuSchema } from "../formValidationSchemas";

type CurrentState = { success: boolean; error: boolean };

export const updateStatusOrder = async (idRunning: string, status: string) => {
  try {
    const updatedOrderStatus = await prisma.order.updateMany({
      where: {
        order_running_code: idRunning,
      },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: updatedOrderStatus };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};

export const updateStatusTable = async (idTable: number, status: string) => {
  try {
    const updatedTableStatus = await prisma.table.update({
      where: {
        id: idTable,
      },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: updateStatusTable };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};

export const createPaymentOrder = async (data: any) => {
  try {
    await prisma.paymentorder.create({
      data: {
        cashReceived: data.cashReceived,
        change: data.change,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        updatedAt: new Date(),
        createdAt: new Date(),
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
        table: {
          connect: {
            id: data.tableId,
          },
        },
        runningRef: {
          connect: {
            runningCode: data.orderId,
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
