"use server";

import {
  EmployeeSchema,
  ModifierGroupSchema,
  ModifierItemSchema,
  PositionSchema,
  PrinterSchema,
  TableSchema,
} from "../formValidationSchemas";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
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

export const createPosition = async (
  currentState: CurrentState,
  data: PositionSchema
) => {
  try {
    await prisma.posiotion.create({
      data: {
        position_name: data.position_name,
        status: "ACTIVE",
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

export const updateStusPosition = async (id: number, status: string) => {
  try {
    const updatedPositionStatus = await prisma.posiotion.update({
      where: {
        id: id,
      },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: updatedPositionStatus };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};

export const updateNamePosition = async (id: number, positionName: string) => {
  try {
    const updatedPositionName = await prisma.posiotion.update({
      where: {
        id: id,
      },
      data: {
        position_name: positionName,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: updatedPositionName };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};

export const moveTableFunction = async (
  fromTableId: number,
  toTableId: number,
  activeOrderIds: number[]
) => {
  try {
    if (!activeOrderIds || activeOrderIds.length === 0) {
      return {
        success: false,
        error: true,
        data: "ไม่พบรายการออเดอร์ที่ต้องการย้าย",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: {
          id: {
            in: activeOrderIds,
          },
        },
        data: {
          tableId: toTableId,
        },
      });

      await tx.table.update({
        where: { id: toTableId },
        data: { status: "OCCUPIED" },
      });

      const remainingOrders = await tx.order.count({
        where: {
          tableId: fromTableId,
          status: {
            notIn: ["COMPLETED", "CANCELLED", "PAY_COMPLETED"],
          },
        },
      });

      if (remainingOrders === 0) {
        await tx.table.update({
          where: { id: fromTableId },
          data: { status: "AVAILABLE" },
        });
      }
    });

    return { success: true, error: false, data: "ย้ายโต๊ะเรียบร้อยแล้ว" };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};

export const createEmployee = async (
  currentState: CurrentState,
  data: EmployeeSchema
) => {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await prisma.employees.create({
      data: {
        username: data.username,
        password: hashedPassword, 
        name: data.name,
        surname: data.surname,
        email: data.email,     
        img: data.img,        
        status: "ACTIVE",      
        position_id: data.position_id,
        login_fail: data.login_fail || 0,
        birthday: data.birthday || new Date(),
        created_by: data.created_by?.toString(),       
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

export const updateStausEmp = async (id: number, status: string) => {
  try {
    const updatedStatus = await prisma.employees.update({
      where: {
        id: id,
      },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: updatedStatus };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};

export const updateNameEmp = async (id: number, name: string) => {
  try {
    const updatedName = await prisma.employees.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: updatedName };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};

export const updateSurNameEmp = async (id: number, surname: string) => {
  try {
    const updatedSurName = await prisma.employees.update({
      where: {
        id: id,
      },
      data: {
        surname: surname,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: updatedSurName };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};

export const updatePositionEmp = async (id: number, status: number) => {
  try {
    const updatedStatus = await prisma.employees.update({
      where: {
        id: id,
      },
      data: {
        position_id: status,
        updatedAt: new Date(),
      },
    });

    return { success: true, error: false, data: updatedStatus };
  } catch (err) {
    return { success: false, error: true, data: err };
  }
};
