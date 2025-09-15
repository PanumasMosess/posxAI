import z from "zod";

export const stockSchema_ = z.object({
  id: z.number().optional(),
  product_stock: z.string().min(1, { message: "กรุณากรอกชื่อสินค้า" }).max(50),
  unit_stock: z.string().min(1, { message: "กรุณากรอกหน่วยสินค้า" }).max(50),
  description_stock: z.string().optional(),
  pcs_stock: z.coerce.number().min(0, "จำนวนห้ามติดลบ"),
  price_now_stock: z.coerce.number().min(0, "ราคาห้ามติดลบ"),
  creator_id: z.coerce.number().min(1, "ต้องมี ID ผู้สร้าง"),
  category_id: z.coerce.number().min(1, "ต้องมี ID หมวดหมู่"),
  supplier_id: z.coerce.number().min(1, "ต้องมี ID ซัพพลายเออร์"),

  img_stock: z.any().optional(),
});

export type StockSchema = z.infer<typeof stockSchema_>;

export const stockSchemaImg_ = z.object({
  id: z.number().optional(),
  product_stock: z.string(),
  unit_stock: z.string(),
  description_stock: z.string(),
  pcs_stock: z.coerce.number(),
  price_now_stock: z.coerce.number(),
  creator_id: z.coerce.number().min(1, "ต้องมี ID ผู้สร้าง"),
  category_id: z.coerce.number().min(1, "ต้องมี ID หมวดหมู่"),
  supplier_id: z.coerce.number().min(1, "ต้องมี ID ซัพพลายเออร์"),
  img_stock: z.any().optional(),
  img_file_validation: z.union([
    z.instanceof(File, { message: "กรุณาอัปโหลดไฟล์" }),
    z.string().url({ message: "URL ของรูปภาพไม่ถูกต้อง" }),
  ]),

});

export type StockSchemaImg = z.infer<typeof stockSchemaImg_>;
