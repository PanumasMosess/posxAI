"use server";

import { StockSchema } from "../formValidationSchemas";
import prisma from "../prisma";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

type CurrentState = { success: boolean; error: boolean };

export type BillItem = {
  productName: string;
  description: string;
  unit: string;
  quantity: number;
  price: number;
  img?: string;
};

interface CreateStockPayload {
  items: BillItem[];
  creator_id: number;
  category_id: number;
  supplier_id: number;
}

const s3Client = new S3Client({
  endpoint: process.env.ENDPOINT!,
  region: process.env.REGION!,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.KEY!,
    secretAccessKey: process.env.SECRET_KEY!,
  },
});

export const handleImageUpload = async (file: File): Promise<string> => {
  const result = await getPresignedUrl(file.type, file.size);
  if (!result.success || !result.url) {
    throw new Error(result.error || "ไม่สามารถขอสิทธิ์อัปโหลดได้");
  }

  const uploadResponse = await fetch(result.url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type, "x-amz-acl": "public-read" },
  });

  if (!uploadResponse.ok) {
    throw new Error("การอัปโหลดไฟล์ล้มเหลว");
  }

  return result.url.split("?")[0];
};

export const getPresignedUrl = async (fileType: string, fileSize: number) => {
  try {
    if (fileSize > 10 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 10MB" };
    }

    const randomBytes = crypto.randomBytes(16);
    const uniqueFilename = randomBytes.toString("hex");
    const fileExtension = fileType.split("/")[1];
    const key = `uploads/stock_img/${uniqueFilename}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
      ACL: "public-read",
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL ใช้งานได้ 1 ชั่วโมง

    return { success: true, url, key };
  } catch (error) {
    console.error("Error creating presigned URL", error);
    return { success: false, error: "Error creating presigned URL" };
  }
};

export const sendbase64toS3Data = async (base64Data: string) => {
  try {
    const buffer = Buffer.from(base64Data, "base64");

    const randomBytes = crypto.randomBytes(16);
    const key = `uploads/stock_img/${randomBytes.toString("hex")}.png`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
      ACL: "public-read",
    });

    const data = await s3Client.send(command);

    let publicUrl;
    if (data) {
      publicUrl = `https://sgp1.digitaloceanspaces.com/${process.env.S3_BUCKET}/${key}`;
    }

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Error uploading Base64 image:", error);
    return { success: false, error: "Failed to upload image." };
  }
};

export const deleteFileS3 = async (key: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
    });

    await s3Client.send(command);

    return { success: true, message: "ลบไฟล์สำเร็จ" };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const createStock = async (
  currentState: CurrentState,
  data: StockSchema
) => {
  try {
    await prisma.stock.create({
      data: {
        productName: data.product_stock,
        quantity: data.pcs_stock,
        price: data.price_now_stock,
        unit: data.unit_stock,
        description: data.description_stock || null,
        img: data.img_stock || null,
        creator: {
          connect: {
            id: data.creator_id,
          },
        },
        category: {
          connect: {
            id: data.category_id,
          },
        },
        supplier: {
          connect: {
            id: data.supplier_id,
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

export const createStockByImg = async (
  currentState: CurrentState,
  payload: CreateStockPayload
) => {
  try {
    const { items, creator_id, category_id, supplier_id } = payload;

    const productNames = items.map((item) => `SKU: ${item.productName}`);

    const existingStocks = await prisma.stock.findMany({
      where: {
        productName: {
          in: productNames,
        },
      },
    });

    const existingStockMap = new Map(
      existingStocks.map((s) => [s.productName, s])
    );

    const itemsToCreate: any[] = [];
    const updatePromises: any[] = [];

    items.forEach((item) => {
      const existingStock = existingStockMap.get(`SKU: ${item.productName}`);

      if (existingStock) {
        const updatePromise = prisma.stock.update({
          where: { id: existingStock.id },
          data: {
            quantity: existingStock.quantity + item.quantity,
            price: item.price,
            updatedAt: new Date(),
          },
        });
        updatePromises.push(updatePromise);
      } else {
        itemsToCreate.push({
          productName: `SKU: ${item.productName}`,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit,
          createdById: creator_id,
          categoryId: category_id,
          supplierId: supplier_id,
        });
      }
    });

    let createdCount = 0;
    if (itemsToCreate.length > 0) {
      const createResult = await prisma.stock.createMany({
        data: itemsToCreate,
        skipDuplicates: true,
      });
      createdCount = createResult.count;
    }

    await Promise.all(updatePromises);

    // const dataToCreate = items.map((item) => ({
    //   productName: `SKU: ${item.productName}`,
    //   quantity: item.quantity || 0,
    //   price: item.price || 0,
    //   unit: item.unit,
    //   description: item.description,
    //   img: item.img || null,

    //   createdById: creator_id,
    //   categoryId: category_id,
    //   supplierId: supplier_id,
    // }));

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStock = async (
  currentState: CurrentState,
  data: StockSchema
) => {
  try {
    const updatedStock = await prisma.stock.update({
      where: {
        id: data.id,
      },
      data: {
        productName: data.product_stock,
        quantity: data.pcs_stock,
        price: data.price_now_stock,
        unit: data.unit_stock,
        description: data.description_stock || null,
        img: data.img_stock || null,
        updatedAt: new Date(),
        createdById: data.creator_id,
        categoryId: data.category_id,
        supplierId: data.supplier_id,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false, data: updatedStock };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, data: "" };
  }
};

export const updateImageStock = async (data: any) => {
  try {
    const updatedStock = await prisma.stock.update({
      where: {
        id: data.id,
      },
      data: {
        img: data.img_stock,
        createdById: data.creator_id,
        updatedAt: new Date(),
      },
      include: {
        category: true,
      },
    });

    // revalidatePath("/stocks");
    return { success: true, error: false, data: updatedStock };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, data: "" };
  }
};

export const deleteStock = async (data: any) => {
  try {
    await prisma.stock.update({
      where: {
        id: data.id,
      },
      data: {
        status: data.status,
        creator: {
          connect: {
            id: data.creator_id,
          },
        },
      },
    });

    // revalidatePath("/stocks");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
