"use server";

import prisma from "../prisma";

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

// export const createPaymentOrder = async (data: any) => {
//   try {
//     await prisma.$transaction(async (tx) => {
//       await tx.paymentorder.create({
//         data: {
//           cashReceived: data.cashReceived,
//           change: data.change,
//           discount: data.discount,
//           totalAmount: data.totalAmount,
//           paymentMethod: data.paymentMethod,
//           updatedAt: new Date(),
//           createdAt: new Date(),
//           creator: {
//             connect: { id: data.createdById },
//           },
//           organization: {
//             connect: { id: data.organizationId },
//           },
//           table: {
//             connect: { id: data.tableId },
//           },
//           runningRef: {
//             connect: { runningCode: data.orderId },
//           },
//           shift: data.shiftId ? { connect: { id: data.shiftId } } : undefined,
//         },
//       });

//       if (data.paymentMethod === "MEMBER") {
//         if (!data.memberPhone) {
//           throw new Error("ไม่พบเบอร์โทรศัพท์สมาชิก");
//         }

//         const member = await tx.member.findUnique({
//           where: {
//             phone_organizationId: {
//               phone: data.memberPhone,
//               organizationId: data.organizationId,
//             },
//           },
//         });

//         if (!member) {
//           throw new Error("ไม่พบข้อมูลสมาชิกระบบ");
//         }

//         if (Number(member.creditBalance) < Number(data.totalAmount)) {
//           throw new Error("เครดิตไม่เพียงพอ");
//         }

//         const updatedMember = await tx.member.update({
//           where: { id: member.id },
//           data: {
//             creditBalance: {
//               decrement: data.totalAmount,
//             },
//           },
//         });

//         await tx.membertransaction.create({
//           data: {
//             memberId: member.id,
//             organizationId: data.organizationId,
//             type: "SPEND",
//             walletType: "CREDIT",
//             amount: -data.totalAmount,
//             balanceAfter: updatedMember.creditBalance,
//             note: `ชำระค่าอาหาร (บิล: ${data.orderId})`,
//             createdById: data.createdById,
//           },
//         });
//       }
//     });

//     return { success: true, error: false };
//   } catch (err) {
//     console.error("Payment Transaction Error: ", err);
//     return {
//       success: false,
//       error: true,
//       message: err instanceof Error ? err.message : "Unknown error",
//     };
//   }
// };

export const createPaymentOrder = async (data: any) => {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. สร้างประวัติการชำระเงิน (Payment Order)
      await tx.paymentorder.create({
        data: {
          cashReceived: data.cashReceived,
          change: data.change,
          discount: data.discount,
          totalAmount: data.totalAmount,
          paymentMethod: data.paymentMethod,
          updatedAt: new Date(),
          createdAt: new Date(),

          createdById: data.createdById,
          organizationId: data.organizationId,
          tableId: data.tableId,
          order_running_code: data.orderId,
          shiftId: data.shiftId || null,
          
        },
      });

      if (
        data.paidOrderIds &&
        Array.isArray(data.paidOrderIds) &&
        data.paidOrderIds.length > 0
      ) {
        await tx.order.updateMany({
          where: { 
            id: { in: data.paidOrderIds } },
          data: { status: "PAY_COMPLETED", updatedAt: new Date() },
        });
      }

      // 🟢 2. บันทึกรายรับเข้า "บัญชีหน้าร้าน" ที่เลือกไว้ในตั้งค่า (ไม่ต้องรอรับ id จากหน้าบ้าน)
      if (["CASH", "QR"].includes(data.paymentMethod)) {
        
        // ค้นหาบัญชีที่ตั้งค่าเป็นบัญชีรับเงินหน้าร้าน (accPosPayment: true)
        let posAccount = await tx.account.findFirst({
          where: { 
            organizationId: data.organizationId, 
            status: "ACTIVE",
            accPosPayment: true 
          },
        });

        // Safety Net: ถ้าเจ้าของร้านลืมตั้งค่าบัญชีหน้าร้าน ให้ดึงบัญชีใบแรกมารองรับเงินกันระบบ Error
        if (!posAccount) {
          posAccount = await tx.account.findFirst({
            where: { organizationId: data.organizationId, status: "ACTIVE" },
            orderBy: { id: "asc" }
          });
        }

        if (!posAccount) {
          throw new Error("ไม่พบบัญชีสำหรับรับเงินหน้าร้าน กรุณาเพิ่มบัญชีการเงินก่อนครับ");
        }

        // คำนวณยอดเงินคงเหลือใหม่
        const newBalance = Number(posAccount.balance) + Number(data.totalAmount);

        // บันทึก Log ธุรกรรม
        await tx.account_transaction.create({
          data: {
            accountId: posAccount.id,
            organizationId: data.organizationId,
            categoryId: null,
            type: "SALES",
            amount: data.totalAmount,
            note: `รับชำระค่าอาหาร (บิล: ${data.orderId}) - ${data.paymentMethod}`,
            createdById: data.createdById,
            title: `รายรับค่าอาหาร บิล ${data.orderId}`, 
            accountBalance: newBalance,
            date: new Date(),
          },
        });

        // อัปเดตยอดเงินคงเหลือในสมุดบัญชีนั้น
        await tx.account.update({
          where: { id: posAccount.id },
          data: { balance: newBalance },
        });
      }

      // 3. จัดการเรื่องเครดิต MEMBER
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
            creditBalance: { decrement: data.totalAmount },
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
            date: new Date(),
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

export const getActiveAccounts = async (organizationId: any) => {
  try {
    const orgIdParsed = Number(organizationId);

    const accounts = await prisma.account.findMany({
      where: { 
        organizationId: orgIdParsed, 
        status: "ACTIVE" 
      },
      select: { 
        id: true, 
        accountName: true, 
        balance: true 
      },
      orderBy: { accountName: 'asc' }
    });

    return { success: true, data: accounts };
  } catch (error) {
    console.error("❌ Prisma Error in getActiveAccounts:", error); 
    return { success: false, message: "ดึงข้อมูลบัญชีล้มเหลว" };
  }
};