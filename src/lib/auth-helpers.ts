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

    if (employees.length === 0) {
      return {
        success: false,
        message: `ไม่พบข้อมูลพนักงานในระบบ (สาขา ID: ${organizationId})`,
      };
    }

    let checkedCount = 0;

    for (const emp of employees) {
      if (!emp.pin) continue;

      checkedCount++;
      let isMatch = false;

      if (emp.pin.startsWith("$2b$")) {
        isMatch = await bcrypt.compare(rawPin, emp.pin);
      } else {
        isMatch = rawPin === emp.pin;
      }

      if (isMatch) {
        // 🟢 ใช้ Promise.all ดึงทั้งข้อมูลตำแหน่ง และ ข้อมูลชื่อร้านขนานกันไปเลย (เร็วขึ้น ไม่หน่วงดนเบส)
        const [positionData, orgData] = await Promise.all([
          prisma.posiotion.findUnique({
            where: { id: emp.position_id },
            select: { position_name: true },
          }),
          prisma.organization.findUnique({
            where: { id: organizationId },
            select: { name: true }, // ดึงคอลัมน์ name ออกมา
          }),
        ]);

        return {
          success: true,
          employeeId: emp.id,
          employeeName: `${emp.name} ${emp.surname}`,
          positionId: emp.position_id,
          positionName: positionData?.position_name || "ไม่มีตำแหน่ง",
          organizationName: orgData?.name || "ไม่ระบุชื่อร้าน", 
          img: emp.img || null,
        };
      }
    }

    return {
      success: false,
      message: `รหัส PIN ไม่ถูกต้อง (ตรวจสอบพนักงานแล้ว ${checkedCount}/${employees.length} คน)`,
    };
  } catch (error: any) {
    console.error("Error verifyPositionPin:", error);

    return {
      success: false,
      message: `เกิดข้อผิดพลาดของระบบ: ${error?.message || String(error)}`,
    };
  }
};
