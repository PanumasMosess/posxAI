"use server";

import {
  EmployeePinSchema,
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
  data: TableSchema,
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
  data: PrinterSchema,
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
  data: ModifierGroupSchema,
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
  data: ModifierGroupSchema,
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
  data: ModifierItemSchema,
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
  data: ModifierItemSchema,
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
  data: PositionSchema,
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
    return { success: false, error: true, message: "เกิดข้อผิดพลาดของระบบ" };
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
  activeOrderIds: number[],
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
  data: EmployeeSchema,
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
        position_id: 0,
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

export const createEmployeePin = async (
  currentState: any,
  data: EmployeePinSchema,
) => {
  try {

    const existingEmployees = await prisma.employeepin.findMany({
      where: { organizationId: data.organizationId },
      select: { pin: true, name: true }, 
    });

    for (const emp of existingEmployees) {
      if (emp.pin) {
        const isMatch = await bcrypt.compare(data.pin, emp.pin);
        if (isMatch) {
          return {
            success: false,
            error: true,
            message: `รหัส PIN นี้ถูกใช้งานแล้วโดยพนักงานชื่อ: ${emp.name}`,
          };
        }
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(data.pin, salt);

    await prisma.employeepin.create({
      data: {
        pin: hashedPin,
        name: data.name,
        surname: data.surname,
        email: data.email,
        birthday: new Date(data.birthday).toISOString(),
        img: data.img,
        position_id: data.position_id,
        created_by: data.created_by || "SYSTEM",
        organizationId: data.organizationId,
        login_fail: 0,
        status: "ACTIVE",
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error create employeepin:", err);
    return {
      success: false,
      error: true,
      message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
    };
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

export const updateStatusEmpPin = async (id: number, status: string) => {
  try {
    await prisma.employeepin.update({
      where: { id },
      data: { status },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updateStatusEmpPin:", err);
    return { success: false, error: true, message: "อัปเดตสถานะไม่สำเร็จ" };
  }
};

export const updateNameEmpPin = async (id: number, newName: string) => {
  try {
    await prisma.employeepin.update({
      where: { id },
      data: { name: newName },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updateNameEmpPin:", err);
    return { success: false, error: true, message: "อัปเดตชื่อไม่สำเร็จ" };
  }
};

export const updateSurNameEmpPin = async (id: number, newSurName: string) => {
  try {
    await prisma.employeepin.update({
      where: { id },
      data: { surname: newSurName },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updateSurNameEmpPin:", err);
    return { success: false, error: true, message: "อัปเดตนามสกุลไม่สำเร็จ" };
  }
};

export const updatePositionEmpPin = async (
  id: number,
  newPositionId: number,
) => {
  try {
    await prisma.employeepin.update({
      where: { id },
      data: { position_id: newPositionId },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updatePositionEmpPin:", err);
    return { success: false, error: true, message: "อัปเดตตำแหน่งไม่สำเร็จ" };
  }
};

export const updatePinEmpPin = async (id: number, newPin: string) => {
  try {
    const currentEmp = await prisma.employeepin.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!currentEmp || !currentEmp.organizationId) {
      return { success: false, error: true, message: "ไม่พบข้อมูลพนักงาน" };
    }

    const otherEmployees = await prisma.employeepin.findMany({
      where: {
        organizationId: currentEmp.organizationId,
        id: { not: id }, 
      },
      select: { pin: true, name: true },
    });

    for (const emp of otherEmployees) {
      if (emp.pin) {
        const isMatch = await bcrypt.compare(newPin, emp.pin);
        if (isMatch) {
          return {
            success: false,
            error: true,
            message: `รหัส PIN นี้ถูกใช้งานแล้วโดย: ${emp.name}`,
          };
        }
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(newPin, salt);

    await prisma.employeepin.update({
      where: { id },
      data: { pin: hashedPin },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updatePinEmpPin:", err);
    return { success: false, error: true, message: "อัปเดต PIN ไม่สำเร็จ" };
  }
};

export const createMember = async (prevState: any, formData: any) => {
  try {
    // 1. ตรวจสอบว่าเบอร์โทรศัพท์นี้ ถูกใช้สมัครสมาชิกในร้าน (organization) นี้ไปแล้วหรือยัง
    const existingMember = await prisma.member.findUnique({
      where: {
        phone_organizationId: {
          phone: formData.phone,
          organizationId: formData.organizationId,
        },
      },
    });

    if (existingMember) {
      // ถ้ามีแล้ว ให้ส่ง error กลับไปให้ Form แสดงแจ้งเตือน
      return {
        success: false,
        error: true,
        message: "เบอร์โทรศัพท์นี้ถูกลงทะเบียนเป็นสมาชิกแล้ว",
      };
    }

    // 2. บันทึกข้อมูลสมาชิกใหม่ลงฐานข้อมูล
    await prisma.member.create({
      data: {
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName || "", // ถ้านามสกุลไม่มีให้ใส่เป็นค่าว่าง
        organizationId: formData.organizationId,
        points: formData.points,
        creditBalance: formData.creditBalance, // เครดิตเริ่มต้น
        status: "ACTIVE", // สถานะพร้อมใช้งาน
      },
    });

    // บันทึกสำเร็จ
    return { success: true, error: false };
  } catch (error) {
    console.error("Create Member Error:", error);
    return {
      success: false,
      error: true,
      message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล",
    };
  }
};

export const updateMemberStatus = async (id: number, status: string) => {
  try {
    await prisma.member.update({
      where: { id },
      data: { status },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

export const updateMemberField = async (
  id: number,
  field: string,
  newValue: string,
) => {
  try {
    await prisma.member.update({
      where: { id },
      data: {
        [field]: newValue, // field จะเป็น "firstName" หรือ "lastName"
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
