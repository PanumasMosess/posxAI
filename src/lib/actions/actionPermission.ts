"use server";

import prisma from "@/lib/prisma";

export const fetchPositionPermissions = async (positionId: number) => {
  try {
    const permissionsData = await prisma.position_permission.findMany({
      where: {
        positionId: positionId,
        allowed: true, 
        permission: {
          status: "ACTIVE", 
        },
      },
      include: {
        permission: true,
      },
    });

    // ดึงมาเฉพาะ permissionKey เพื่อให้ใช้งานง่ายๆ (เช่น ["PROJECT_VIEW", "TASK_EDIT"])
    const permissionKeys = permissionsData.map((p) => p.permission.permissionKey);

    return permissionKeys;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return [];
  }
};