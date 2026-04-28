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
    
    await prisma.$transaction(async (tx) => {
      await tx.paymentorder.create({
        data: {
          cashReceived: data.cashReceived,
          change: data.change,
          discount: data.discount,
          totalAmount: data.totalAmount,
          paymentMethod: data.paymentMethod,
          updatedAt: new Date(),
          createdAt: new Date(),
          creator: {
            connect: { id: data.createdById },
          },
          organization: {
            connect: { id: data.organizationId },
          },
          table: {
            connect: { id: data.tableId },
          },
          runningRef: {
            connect: { runningCode: data.orderId },
          },
        },
      });

      if (data.paymentMethod === "MEMBER") {
        if (!data.memberPhone) {
          throw new Error("ไม่พบเบอร์โทรศัพท์สมาชิก");
        }

        const member = await tx.member.findUnique({
          where: {
            phone_organizationId: {
              phone: data.memberPhone,
              organizationId: data.organizationId,
            },
          },
        });

        if (!member) {
          throw new Error("ไม่พบข้อมูลสมาชิกระบบ");
        }

        if (Number(member.creditBalance) < Number(data.totalAmount)) {
          throw new Error("เครดิตไม่เพียงพอ");
        }

        const updatedMember = await tx.member.update({
          where: { id: member.id },
          data: {
            creditBalance: {
              decrement: data.totalAmount,
            },
          },
        });

        await tx.membertransaction.create({
          data: {
            memberId: member.id,
            organizationId: data.organizationId,
            type: "SPEND", 
            walletType: "CREDIT", 
            amount: -data.totalAmount,
            balanceAfter: updatedMember.creditBalance, 
            note: `ชำระค่าอาหาร (บิล: ${data.orderId})`,
            createdById: data.createdById,
          },
        });
      }
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Payment Transaction Error: ", err);
    return {
      success: false,
      error: true,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
};

export const getMemberByPhone = async (
  phone: string,
  organizationId: number,
) => {
  try {
    const member = await prisma.member.findUnique({
      where: {
        phone_organizationId: {
          phone: phone,
          organizationId: organizationId,
        },
      },
      include: {
        tier: true,
      },
    });

    if (!member) {
      return { success: false, message: "ไม่พบข้อมูลสมาชิก" };
    }

    return { success: true, data: member };
  } catch (error) {
    console.error("Get Member Error:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล" };
  }
};
