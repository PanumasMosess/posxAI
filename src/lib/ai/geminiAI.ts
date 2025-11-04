"use server";

import { GoogleGenAI } from "@google/genai";
import { sendbase64toS3Data } from "../actions/actionIndex";

const ai_gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model_version = process.env.GEMINI_MODEL || "gemini-2.5-flash";

type BillItem = {
  productName: string;
  description: string;
  unit: string;
  quantity: number;
  price: number;
};

export const getPresignedUrltoAI = async (filelink: string) => {
  const pdfResp = await fetch(filelink).then((response) =>
    response.arrayBuffer()
  );

 ;
  const response_mimeType = await fetch(filelink);
  const mimeType_: string | null  = response_mimeType.headers.get("Content-Type");

  const message_promt =
    "หน้าที่ของคุณ:" +
    "- ดึงข้อมูลเฉพาะจากหน้าที่มีหัวข้อ ใบส่งของ/ใบกำกับภาษี/ใบเสร็จรับเงิน เท่านั้นไม่ใช้อย่างใดอย่างหนึ่ง" +
    "- ดึงข้อมูลจาก หัวข้อของตารางดังต่อไปนี้ รหัสสินค้า, รายละเอียด, จำนวน/น้ำหนัก,หน่วยบรรจุ, ราคาต่อหน่วย, จำนวนเงินรวม" +
    "- ดึงแค่ข้อมูลในตารางเท่านั้น(ไม่ต้องเอาหัวข้อตารางมาด้วย)" +
    "- แยกข้อมูลแต่ละแถวด้วย ,";

  const contents = [
    { text: message_promt },
    {
      inlineData: {
        mimeType: mimeType_ ?? "",
        data: Buffer.from(pdfResp).toString("base64"),
      },
    },
  ];

  const response = await ai_gemini.models.generateContent({
    model: model_version,
    contents: contents,
  });

  const billItems: BillItem[] = parseBillData(response.text ?? "");

  return { success: true, text: billItems };
};

export const getSearchQueryFromJson = async (
  itemsToSearch: any[],
  userQuery: string
): Promise<{ success: boolean; answer?: string; error?: string }> => {
  const prompt = `
    You are a helpful and friendly inventory assistant for a store in Thailand.
    Your task is to analyze the provided JSON data of stock items to answer the user's question.
    Provide a concise and natural language response in Thai. Do not return JSON code.

    User's Question: "${userQuery}"

    JSON Data to search within:
    ${JSON.stringify(itemsToSearch, null, 2)}

    Your helpful answer in Thai:
  `;

  try {
    const result = await ai_gemini.models.generateContent({
      model: model_version,
      contents: prompt,
    });

    const answer = result.text ?? "";

    return { success: true, answer: answer };
  } catch (error) {
    console.error("Gemini search query generation error:", error);
    return { success: false, error: "Failed to process search with AI." };
  }
};

export const generationImage = async (userCommand: string) => {
  const prompt = `A photorealistic, professional product shot of "${userCommand}", studio lighting, on a clean white background, optimized for web.`;
 
  try {
    const response = await ai_gemini.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    const parts = response.candidates?.[0]?.content?.parts;

    if (parts) {
      let url;
      let imageData: string | undefined;
      for (const part of parts) {
        if (part.inlineData) {
          imageData = part.inlineData?.data;
        }
      }
     
      if (imageData) {
        url = await sendbase64toS3Data(imageData, "stock_img");
      }

      return {
        success: true,
        answer: url?.url,
      };
    }

    return {
      success: false,
      error: "Failed to process gen with AI.",
    };
  } catch (error) {
    console.error("Gemini image generation error:", error);
    return { success: false, error: "Failed to process gen with AI." };
  }
};

export const generationImageMenu = async (userCommand: string) => {
  const prompt = `A photorealistic, professional product shot of "${userCommand}", studio lighting, on a clean white background, optimized for web.`;
 
  try {
    const response = await ai_gemini.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    const parts = response.candidates?.[0]?.content?.parts;

    if (parts) {
      let url;
      let imageData: string | undefined;
      for (const part of parts) {
        if (part.inlineData) {
          imageData = part.inlineData?.data;
        }
      }
     
      if (imageData) {
        url = await sendbase64toS3Data(imageData, "menu_img");
      }

      return {
        success: true,
        answer: url?.url,
      };
    }

    return {
      success: false,
      error: "Failed to process gen with AI.",
    };
  } catch (error) {
    console.error("Gemini image generation error:", error);
    return { success: false, error: "Failed to process gen with AI." };
  }
};

function parseBillData(data: string): BillItem[] {
  return data
    .trim()
    .split("\n")
    .map((line) => {
      const parts = line.split(",");
      if (parts.length < 6) return null;
      const [id, description, quantity, unit, pricePerUnit] = parts;
      return {
        productName: id.trim(),
        description: description.trim(),
        unit: unit.trim(),
        quantity: Number(quantity.trim()),
        price: parseFloat(pricePerUnit.trim()),
      };
    })
    .filter((item): item is BillItem => item !== null);
}
