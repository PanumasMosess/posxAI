"use server";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const userSignIn = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  try {
    const user = await prisma.employees.findFirst({
      where: {
        username: username,
        status: "ACTIVE",
      },
    });

    if (!user || !user.password) {
      // console.log("User not found or has no password.");
      return null;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        id: user.id.toString(),
        email: user.email ?? "non@mail.co",
        image: user.img ?? "/icon.png",
      };
    }

    // console.log("Password does not match.");
    return null;
  } catch (error) {
    // console.error("Authentication error:", error);
    return null;
  }
};

export const verifyPositionPin = async (
  rawPin: string,
  organizationId: number,
) => {
  try {
    const employees = await prisma.employeepin.findMany({
      where: {
        organizationId: organizationId,
      },
    });

    for (const emp of employees) {
      if (!emp.pin) continue;

      const isMatch = await bcrypt.compare(rawPin, emp.pin);

      if (isMatch) {
        const positionData = await prisma.posiotion.findUnique({
          where: { id: emp.position_id },
          select: { position_name: true },
        });

        return {
          success: true,
          employeeId: emp.id,
          employeeName: `${emp.name} ${emp.surname}`,
          positionId: emp.position_id,
          positionName: positionData?.position_name || "ไม่มีตำแหน่ง", 
        };
      }
    }

    return { success: false, message: "รหัส PIN ไม่ถูกต้อง" };
  } catch (error) {
    console.error("Error verifyPositionPin:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการตรวจสอบรหัส PIN" };
  }
};
