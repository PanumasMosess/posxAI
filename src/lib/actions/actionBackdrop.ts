"use server";

import prisma from "@/lib/prisma";
import { deleteFileS3 } from "@/lib/actions/actionIndex";

export const createTemporaryShoutout = async (
  organizationId: number,
  imageUrl: string,
  igName: string,
  message: string
) => {
  try {
    const newShoutout = await prisma.display_backdrop.create({
      data: {
        organizationId,
        imageUrl,
        igName,
        message, 
        title: "Customer Shoutout",
        duration: 15, 
        isTemporary: true, 
      },
    });
    return { success: true, data: newShoutout };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Upload failed" };
  }
};

export const checkTemporaryShoutout = async (organizationId: number) => {
  try {
    const item = await prisma.display_backdrop.findFirst({
      where: {
        organizationId: organizationId,
        isTemporary: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, data: item };
  } catch (error) {
    return { success: false, data: null };
  }
};

export const deleteTemporaryShoutout = async (id: number) => {
  try {
    const item = await prisma.display_backdrop.findUnique({
      where: { id },
    });

    if (item && item.imageUrl) {
      const keyMatch = item.imageUrl.match(/uploads\/shoutout_img\/[^?]+/);
      
      if (keyMatch && keyMatch[0]) {
        const s3Result = await deleteFileS3(keyMatch[0]);
        if (!s3Result.success) {
          console.error("Failed to delete from S3:", s3Result.error);
        }
      }
    }
    await prisma.display_backdrop.delete({
      where: { id },
    });
    
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false };
  }
};