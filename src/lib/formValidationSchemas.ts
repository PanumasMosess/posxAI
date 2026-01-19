import z from "zod";

export const stockSchema_ = z.object({
  id: z.number().optional(),
  product_stock: z.string().min(1, { message: "กรุณากรอกชื่อสินค้า" }).max(50),
  unit_stock: z.string().min(1, { message: "กรุณากรอกหน่วยสินค้า" }).max(50),
  description_stock: z.string().optional(),
  pcs_stock: z.coerce.number().min(0, "จำนวนห้ามติดลบ"),
  max_stock: z.coerce.number().min(0, "จำนวนห้ามติดลบ"),
  min_stock: z.coerce.number().min(0, "จำนวนห้ามติดลบ"),
  price_now_stock: z.coerce.number().min(0, "ราคาห้ามติดลบ"),
  creator_id: z.coerce.number().min(1, "ต้องมี ID ผู้สร้าง"),
  organizationId: z.coerce.number().min(1, "ต้องมี ID ผู้สร้าง"),
  category_id: z.coerce.number().min(1, "ต้องมี ID หมวดหมู่"),
  supplier_id: z.coerce.number().min(1, "ต้องมี ID ซัพพลายเออร์"),
  unitPriceId: z.coerce.number().min(1, "ต้องมี ID ต้องมีหน่วยราคา"),

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
  organizationId: z.coerce.number().min(1, "ต้องมี ID ผู้สร้าง"),
  img_file_validation: z.union([
    z.instanceof(File, { message: "กรุณาอัปโหลดไฟล์" }),
    z.string().url({ message: "URL ของรูปภาพไม่ถูกต้อง" }),
  ]),
});
export type StockSchemaImg = z.infer<typeof stockSchemaImg_>;

export const signInSchema_ = z.object({
  username: z.string().min(1, { message: "กรุณากรอก Username" }).max(50),
  password: z.string().min(1, { message: "กรุณากรอกรหัสผ่าน" }).max(50),
});
export type SignInSchema = z.infer<typeof signInSchema_>;

export const categorySchema_ = z.object({
  id: z.number().optional(),
  categoryName: z.string().min(1, { message: "กรุณากรอก Category" }).max(50),
  createdById: z.coerce.number().min(1, "ต้องมี ID ผู้สร้าง"),
  organizationId: z.coerce.number().min(1, "ต้องมีบริษัท"),
});
export type CategorySchema = z.infer<typeof categorySchema_>;

export const supplierSchema_ = z.object({
  id: z.number().optional(),
  supplierName: z.string().min(1, { message: "กรุณากรอก supplier" }).max(50),
  createdById: z.coerce.number().min(1, "ต้องมี ID ผู้สร้าง"),
  organizationId: z.coerce.number().min(1, "ต้องมีบริษัท"),
});
export type SupplierSchema = z.infer<typeof supplierSchema_>;

export const MenuSchema_ = z.object({
  id: z.number().optional(),
  menuName: z.string().min(1, { message: "กรุณากรอกชื่อสินค้า" }).max(50),
  price_sale: z.coerce.number().min(0, "ห้ามติดลบ"),
  price_cost: z.coerce.number().min(0, "ห้ามติดลบ"),
  unit: z.string().min(1, { message: "กรุณากรอกหน่วยสินค้า" }).max(50),
  description: z.string().optional(),
  status: z.string().optional(),
  createdById: z.coerce.number().min(1, "ต้องมี ID ผู้สร้าง"),
  organizationId: z.coerce.number().min(1, "ต้องมีบริษัท"),
  categoryMenuId: z.coerce.number().min(1, "ต้องมี ID หมวดหมู่"),
  unitPriceId: z.coerce.number().min(1, "ต้องมี ID หมวดหมู่"),

  img: z.any().optional(),
  modifierGroupIds: z.array(z.number()).optional(),
});
export type MenuSchema = z.infer<typeof MenuSchema_>;

export const formularStockSchema_ = z.object({
  id: z.number().optional(),
  pcs_update: z.coerce.number().min(0, "ห้ามติดลบ"),
  status: z.string().optional(),
  menuId: z.coerce.number().min(1, "ต้องมี ID เมนู"),
  stockId: z.coerce.number().min(1, "ต้องมี ID สินค้าในคลัง"),
});
export type FormularStockSchema_ = z.infer<typeof formularStockSchema_>;

export const TableSchema_ = z.object({
  id: z.number().optional(),
  tableName: z.string().min(1, { message: "กรุณากรอกชื่อสินค้า" }).max(50),
  tableBookingBy: z.string().optional(),
  cashType: z.string().optional(),
  status: z.string().min(1, { message: "STATUS" }).max(50),
  closeById: z.coerce.number().min(1, "ต้องมี ID ผู้สร้าง"),
  organizationId: z.coerce.number().min(1, "ต้องมีบริษัท"),
});
export type TableSchema = z.infer<typeof TableSchema_>;

export const PrinterSchema_ = z.object({
  id: z.number().optional(),
  printerName: z.string().min(1, { message: "กรุณากรอกชื่อสินค้า" }).max(50),
  stationUse: z.string().optional(),
  createdById: z.coerce.number().min(1, "ต้องมี ID ผู้สร้าง"),
  organizationId: z.coerce.number().min(1, "ต้องมีบริษัท"),
});
export type PrinterSchema = z.infer<typeof PrinterSchema_>;

export const modifierGroupSchema_ = z
  .object({
    id: z.number().optional(),
    name: z.string().min(1, { message: "กรุณากรอกชื่อกลุ่ม" }).max(50),
    minSelect: z.coerce.number().min(0),
    maxSelect: z.coerce.number().min(1),
    organizationId: z.coerce.number().min(1),
  })
  .refine((data) => data.maxSelect >= data.minSelect, {
    message: "จำนวนที่เลือกได้สูงสุด ต้องไม่น้อยกว่าจำนวนขั้นต่ำ",
    path: ["maxSelect"],
  });
export type ModifierGroupSchema = z.infer<typeof modifierGroupSchema_>;

export const modifierItemSchema_ = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "กรุณากรอกชื่อตัวเลือก" }),
  price: z.coerce.number().min(0, { message: "ราคาห้ามติดลบ" }),
  groupId: z.coerce.number().min(1, { message: "กรุณาเลือกกลุ่มตัวเลือก" }),
  organizationId: z.coerce.number().min(1),
});

export type ModifierItemSchema = z.infer<typeof modifierItemSchema_>;

export const PositionSchema_ = z.object({
  id: z.number().optional(),
  position_name: z.string().min(1, { message: "กรุณากรอกชื่อ" }).max(50),
  createdById: z.coerce.number().min(1, "ต้องมี ID ผู้สร้าง"),
  organizationId: z.coerce.number().min(1, "ต้องมีบริษัท"),
});
export type PositionSchema = z.infer<typeof PositionSchema_>;

export const EmployeeSchema_ = z.object({
  id: z.number().optional(),
  username: z.string().min(1, { message: "กรุณากรอก username" }).max(50),
  password: z.string().min(1, { message: "กรุณากรอก password" }).max(50),
  name: z.string().min(1, { message: "กรุณากรอกชื่อ" }).max(50),
  surname: z.string().min(1, { message: "กรุณากรอกชื่อ" }).max(50),
  email: z.string().optional(),
  img: z.any().optional(),
  position_id: z.coerce.number().min(1, "ต้องมี ID ต่ำแหน่ง"),
  login_fail: z.number().optional(),
  birthday: z.coerce.date().optional(),
  created_by: z.coerce.number().min(1, "ต้องมี ID ผู้สร้าง"),
  organizationId: z.coerce.number().min(1, "ต้องมีบริษัท"),
});
export type EmployeeSchema = z.infer<typeof EmployeeSchema_>;
