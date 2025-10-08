"use server";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

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

export const menu_handleImageUpload = async (file: File): Promise<string> => {
  const result = await menu_getPresignedUrl(file.type, file.size);
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

export const menu_getPresignedUrl = async (fileType: string, fileSize: number) => {
  try {
    if (fileSize > 10 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 10MB" };
    }

    const randomBytes = crypto.randomBytes(16);
    const uniqueFilename = randomBytes.toString("hex");
    const fileExtension = fileType.split("/")[1];
    const key = `uploads/menu_img/${uniqueFilename}.${fileExtension}`;

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

export const menu_sendbase64toS3Data = async (base64Data: string) => {
  try {
    const buffer = Buffer.from(base64Data, "base64");

    const randomBytes = crypto.randomBytes(16);
    const key = `uploads/menu_img/${randomBytes.toString("hex")}.png`;

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
