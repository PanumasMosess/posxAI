"use client";

import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormFieldImageUpload } from "./FormFieldImageUpload";
import {
  Dispatch,
  SetStateAction,
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
import { createStock, updateStock } from "@/lib/actions/actionStocks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { StockSchema, stockSchema_ } from "@/lib/formValidationSchemas";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";
import { deleteFileS3, handleImageUpload } from "@/lib/actions/actionIndex";

const StockForm = ({
  type,
  relatedData,
  currentUserId,
  organizationId,
  data,
  stateSheet,
  stateForm,
}: {
  type: "create" | "update";
  relatedData?: any;
  currentUserId: number;
  organizationId: number;
  data?: any;
  stateSheet: Dispatch<SetStateAction<boolean>>;
  stateForm: boolean;
}) => {
  const formAddStock = useForm<StockSchema>({
    resolver: zodResolver(stockSchema_),
    defaultValues: {
      product_stock: "",
      unit_stock: "",
      description_stock: "",
      pcs_stock: 0,
      max_stock: 0,
      min_stock: 0,
      price_now_stock: 0,
      img_stock: undefined,
      creator_id: currentUserId,
      organizationId: organizationId,
      category_id: undefined,
      supplier_id: undefined,
      unitPriceId: undefined,
    },
  });

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [OldImg, setOldImg] = useState("");
  const [state, formAction] = useActionState(
    type === "create" ? createStock : updateStock,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = async (dataForm: StockSchema) => {
    try {
      setIsSubmitting(true);
      const finalData = { ...dataForm };

      if (type === "update" && OldImg && dataForm.img_stock) {
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
        const urlObject = new URL(OldImg);
        const pathname = urlObject.pathname;
        const key = pathname.substring(`/${bucketName}/`.length);
        const status_del_old = await deleteFileS3(key);
      }

      if (dataForm.img_stock && dataForm.img_stock instanceof File) {
        const imageUrl = await handleImageUpload(dataForm.img_stock);
        finalData.img_stock = imageUrl;
      } else {
        finalData.img_stock = OldImg;
      }
      startTransition(async () => {
        formAction(finalData);
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    }
  };

  const { suppliers, categories, unitprices } = relatedData;

  useEffect(() => {
    if (state.success) {
      toast.success(`สินค้าถูก ${type === "create" ? "เพิ่ม" : "แก้ไข"}!`);
      setIsSubmitting(false);
      formAddStock.reset();
      router.refresh();
      stateSheet(false);
    }
  }, [state, stateSheet, formAddStock, type, router, setIsSubmitting]);

  useEffect(() => {
    if (stateForm) {
      formAddStock.reset();
    }
    // ทำงานเมื่อเป็นโหมดแก้ไขและมี data
    if (type === "update" && data) {
      formAddStock.setValue("category_id", data.categoryId);
      formAddStock.setValue("supplier_id", data.supplierId);
      formAddStock.setValue("unitPriceId", data.unitPriceId);
      formAddStock.setValue("product_stock", data.productName);
      formAddStock.setValue("unit_stock", data.unit);
      formAddStock.setValue("price_now_stock", data.price);
      formAddStock.setValue("pcs_stock", data.quantity);
      formAddStock.setValue("max_stock", data.max);
      formAddStock.setValue("min_stock", data.min);
      formAddStock.setValue("description_stock", data.description);
      formAddStock.setValue("id", data.id);
      setOldImg("");
      setOldImg(data.img);
    }

    if (type === "create" && categories?.length > 0 && suppliers?.length > 0) {
      const firstCategoryId = categories[0].id;
      formAddStock.setValue("category_id", firstCategoryId);

      const firstSupplierId = suppliers[0].id;
      formAddStock.setValue("supplier_id", firstSupplierId);

      const unitPriceId = unitprices[0].id;
      formAddStock.setValue("unitPriceId", unitPriceId);
    }
  }, [type, data, stateForm, categories, suppliers, formAddStock, setOldImg]);

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <SheetHeader>
        <SheetTitle className="mb-2">
          {type === "create" ? "เพิ่มรายการสินค้าในคลัง" : "แก้ไขรายการสินค้า"}
        </SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        <Form {...formAddStock}>
          <form
            id="addStockForm"
            className="space-y-8 px-6 py-4"
            onSubmit={formAddStock.handleSubmit(onSubmit)}
          >
            {data && (
              <>
                <FormField
                  control={formAddStock.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={formAddStock.control}
              name="product_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อรายการ</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formAddStock.control}
              name="unit_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หน่วยสินค้า</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formAddStock.control}
              name="price_now_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ราคาปัจจุบัน</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formAddStock.control}
              name="unitPriceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หน่วยราคา</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกหน่วยราคา" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitprices.map((unit: { id: number; label: String }) => (
                        <SelectItem key={unit.id} value={String(unit.id)}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formAddStock.control}
              name="max_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวนสูงสุดที่เก็บได้</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formAddStock.control}
              name="min_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวนต่ำสุดที่เก็บได้</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formAddStock.control}
              name="pcs_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวนคงเหลือ</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formAddStock.control}
              name="description_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายละเอียดสินค้า</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formAddStock.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมวดหมู่</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกหมวดหมู่" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(
                        (cat: { id: number; categoryName: String }) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.categoryName}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formAddStock.control}
              name="supplier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ซัพพลายเออร์</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกซัพพลายเออร์" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map(
                        (suply: { id: number; supplierName: String }) => (
                          <SelectItem key={suply.id} value={String(suply.id)}>
                            {suply.supplierName}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormFieldImageUpload
              control={formAddStock.control}
              name="img_stock"
              label="รูปภาพสินค้า"
            />
            <Button
              type="submit"
              form="addStockForm"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "กำลังบันทึก..."
                : type === "create"
                ? "ยืนยัน"
                : "แก้ไข"}
            </Button>
          </form>
        </Form>
      </div>
      <SheetFooter className="p-6"></SheetFooter>
    </SheetContent>
  );
};

export default StockForm;
