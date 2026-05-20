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
import { deleteFileS3, sendbase64toS3DataMultifile } from "./actionIndex";
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
    const duplicateEmployee = await prisma.employeepin.findFirst({
      where: {
        organizationId: data.organizationId,
        pin: data.pin, 
      },
      select: { name: true },
    });

    if (duplicateEmployee) {
      return {
        success: false,
        error: true,
        message: `รหัส PIN นี้ถูกใช้งานแล้วโดยพนักงานชื่อ: ${duplicateEmployee.name}`,
      };
    }

    await prisma.employeepin.create({
      data: {
        pin: data.pin, 
        name: data.name,
        surname: data.surname || "-",
        email: data.email || null,
        tel: data.tel ? Number(data.tel) : null,
        birthday: data.birthday ? new Date(data.birthday).toISOString() : null,
        img: data.img || null,
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

    const duplicateEmployee = await prisma.employeepin.findFirst({
      where: {
        organizationId: currentEmp.organizationId,
        pin: newPin,      
        id: { not: id }, 
      },
      select: { name: true },
    });

    if (duplicateEmployee) {
      return {
        success: false,
        error: true,
        message: `รหัส PIN นี้ถูกใช้งานแล้วโดย: ${duplicateEmployee.name}`,
      };
    }

    await prisma.employeepin.update({
      where: { id },
      data: { pin: newPin },
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

export const payMemberCredit = async (
  memberId: number,
  amount: number,
  employeeId: number,
  organizationId: number,
  note: string = "ชำระเครดิต",
) => {
  try {
    await prisma.$transaction(async (tx) => {
      const updatedMember = await tx.member.update({
        where: { id: memberId },
        data: {
          creditBalance: {
            increment: amount,
          },
        },
      });

      await tx.membertransaction.create({
        data: {
          memberId: memberId,
          organizationId: organizationId,
          type: "TOPUP",
          walletType: "CREDIT",
          amount: amount,
          balanceAfter: updatedMember.creditBalance,
          note: note,
          createdById: employeeId,
        },
      });
    });

    return { success: true, message: "ชำระเครดิตและบันทึกประวัติสำเร็จ" };
  } catch (error) {
    console.error("Error payMemberCredit:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการชำระเครดิต" };
  }
};

export const updatePositionPermission = async (
  positionId: number,
  permissionId: number,
  allowed: boolean,
) => {
  try {
    await prisma.position_permission.upsert({
      where: {
        positionId_permissionId: {
          positionId,
          permissionId,
        },
      },
      update: {
        allowed,
      },
      create: {
        positionId,
        permissionId,
        allowed,
      },
    });

    return { success: true };
  } catch (err) {
    console.log("updatePositionPermission error:", err);
    return { success: false };
  }
};

export const getPermissionByPosition = async (positionId: number) => {
  try {
    const data = await prisma.permission.findMany({
      include: {
        positions: {
          where: {
            positionId: positionId,
          },
        },
      },
    });

    return { success: true, data };
  } catch (err) {
    return { success: false, data: [] };
  }
};

export const createPermission = async (
  currentState: CurrentState,
  data: {
    permissionKey: string;
    permissionName: string;
    organizationId: number;
  },
) => {
  try {
    await prisma.permission.create({
      data: {
        permissionKey: data.permissionKey.toUpperCase(),
        permissionName: data.permissionName,
        status: "ACTIVE", // 👈 แก้ตรงนี้
        organization: {
          connect: {
            id: data.organizationId,
          },
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("createPermission error:", err);
    return {
      success: false,
      error: true,
      message: "เกิดข้อผิดพลาดของระบบ",
    };
  }
};

export const updatePermissionKey = async (id: number, value: string) => {
  try {
    await prisma.permission.update({
      where: { id },
      data: {
        permissionKey: value.trim().toUpperCase(),
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (err) {
    console.log("updatePermissionKey error:", err);
    return { success: false };
  }
};

export const updatePermissionName = async (id: number, value: string) => {
  try {
    await prisma.permission.update({
      where: { id },
      data: {
        permissionName: value.trim(),
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (err) {
    console.log("updatePermissionName error:", err);
    return { success: false };
  }
};
export const deletePermission = async (id: number) => {
  try {
    await prisma.permission.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    return { success: true };
  } catch {
    return { success: false };
  }
};

export const updatePermissionStatus = async (id: number, status: string) => {
  try {
    await prisma.permission.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(), // 👈 เพิ่ม
      },
    });

    return { success: true };
  } catch {
    return { success: false };
  }
};

export async function updateProfile(
  id: number,
  data: { name: string; surname: string; tel: string; email: string },
) {
  try {
    const telNumber = data.tel
      ? parseInt(data.tel.replace(/[^0-9]/g, ""), 10)
      : null;

    await prisma.employeepin.update({
      where: { id: id },
      data: {
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        tel: telNumber,
      },
    });

    return { success: true, message: "อัปเดตข้อมูลสำเร็จ" };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

export const createBackdrop = async (formData: FormData) => {
  try {
    const organizationId = Number(formData.get("organizationId"));
    const title = formData.get("title") as string;
    const sequence = Number(formData.get("sequence"));
    const duration = Number(formData.get("duration"));
    const createdById = Number(formData.get("userId"));
    const isActive = formData.get("isActive") === "true";

    const imageFile = formData.get("image") as File;
    let imageUrl = "";

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString("base64");
      const fileType = imageFile.type;
      const uploadResult = await sendbase64toS3DataMultifile(
        base64Data,
        "backdroup_posxai",
        fileType,
      );

      if (!uploadResult.success || !uploadResult.url) {
        return { success: false, message: "อัปโหลดไฟล์ไม่สำเร็จ" };
      }
      imageUrl = uploadResult.url;
    } else {
      return { success: false, message: "กรุณาแนบไฟล์" };
    }

    await prisma.display_backdrop.create({
      data: {
        organizationId,
        title,
        sequence,
        duration,
        isActive,
        imageUrl,
        createdById
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Create Backdrop Error:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
};

export const updateBackdrop = async (formData: FormData) => {
  try {
    const id = Number(formData.get("id"));
    const title = formData.get("title") as string;
    const sequence = Number(formData.get("sequence"));
    const duration = Number(formData.get("duration"));
    const isActive = formData.get("isActive") === "true";

    const imageFile = formData.get("image") as File | null;

    const updateData: any = {
      title,
      sequence,
      duration,
      isActive,
    };

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString("base64");

      const fileType = imageFile.type;
      const uploadResult = await sendbase64toS3DataMultifile(
        base64Data,
        "backdroup_posxai",
        fileType,
      );

      if (!uploadResult.success || !uploadResult.url) {
        return { success: false, message: "อัปโหลดไฟล์ใหม่ไม่สำเร็จ" };
      }
      updateData.imageUrl = uploadResult.url;
    }

    // อัปเดต Database
    await prisma.display_backdrop.update({
      where: { id },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    console.error("Update Backdrop Error:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" };
  }
};

export const updateBackdropTitle = async (id: number, title: string) => {
  try {
    await prisma.display_backdrop.update({
      where: { id },
      data: { title },
    });
    return { success: true, message: "อัปเดตชื่อโปรโมชั่นสำเร็จ" };
  } catch (error) {
    console.error("Error updating title:", error);
    return { success: false, message: "อัปเดตชื่อไม่สำเร็จ" };
  }
};

export const updateBackdropSequence = async (id: number, sequence: number) => {
  try {
    await prisma.display_backdrop.update({
      where: { id },
      data: { sequence },
    });
    return { success: true, message: "อัปเดตลำดับสำเร็จ" };
  } catch (error) {
    console.error("Error updating sequence:", error);
    return { success: false, message: "อัปเดตลำดับไม่สำเร็จ" };
  }
};

export const updateBackdropDuration = async (id: number, duration: number) => {
  try {
    await prisma.display_backdrop.update({
      where: { id },
      data: { duration },
    });
    return { success: true, message: "อัปเดตเวลาแสดงผลสำเร็จ" };
  } catch (error) {
    console.error("Error updating duration:", error);
    return { success: false, message: "อัปเดตเวลาไม่สำเร็จ" };
  }
};

export const updateBackdropStatus = async (id: number, isActive: boolean) => {
  try {
    await prisma.display_backdrop.update({
      where: { id },
      data: { isActive },
    });
    return { success: true, message: "อัปเดตสถานะการแสดงผลสำเร็จ" };
  } catch (error) {
    console.error("Error updating status:", error);
    return { success: false, message: "อัปเดตสถานะไม่สำเร็จ" };
  }
};

export const deleteBackdrop = async (id: number) => {
  try {

    const backdrop = await prisma.display_backdrop.findUnique({
      where: { id },
    });

    if (!backdrop) {
      return { success: false, message: "ไม่พบข้อมูลที่ต้องการลบ" };
    }

    if (backdrop.imageUrl) {
      try {
        const urlParts = backdrop.imageUrl.split("uploads/");       
        if (urlParts.length > 1) {
          const s3Key = "uploads/" + urlParts[1]; 
          await deleteFileS3(s3Key); 
        }
      } catch (s3Error) {
        console.error("Error deleting file from S3:", s3Error);
      }
    }

    await prisma.display_backdrop.delete({
      where: { id },
    });

    return { success: true, message: "ลบข้อมูลและไฟล์สำเร็จ" };
  } catch (error) {
    console.error("Error deleting backdrop:", error);
    return { success: false, message: "ลบข้อมูลไม่สำเร็จ" };
  }
};

export const updateTableLayout = async (
  id: number,
  data: {
    posX: number;
    posY: number;
    width: number;
    height: number;
    rotation?: number;
  },
) => {
  try {
    await prisma.table.update({
      where: {
        id,
      },
      data: {
        posX: data.posX,
        posY: data.posY,
        width: data.width,
        height: data.height,
        // แก้ไข: ใช้การเช็ค undefined เพื่อป้องกันการบันทึกทับด้วยค่า 0
        ...(data.rotation !== undefined && { rotation: data.rotation }),
      },
    });

    return {
      success: true,
    };
  } catch (err) {
    console.error("Update Table Layout Error:", err);

    return {
      success: false,
      error: err,
    };
  }
};

export const updateTableDesign = async (
  id: number,
  data: {
    tableName: string;
    shape: string;
    rotation: number;
    seatCount: number;
  },
) => {
  try {
    await prisma.table.update({
      where: {
        id,
      },
      data: {
        tableName: data.tableName,
        shape: data.shape,
        rotation: data.rotation,
        seatCount: data.seatCount,
      },
    });

    return {
      success: true,
    };
  } catch (err) {
    console.log(err);

    return {
      success: false,
      error: err,
    };
  }
};