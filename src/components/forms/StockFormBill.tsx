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
import { Form } from "../ui/form";
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
import {
  BillItem,
  createStockByImg,
  deleteFileS3,
  handleImageUpload,
} from "@/lib/actions/actionStocks";
import { useRouter } from "next/navigation";
import { StockSchemaImg, stockSchemaImg_ } from "@/lib/formValidationSchemas";
import { getPresignedUrltoAI } from "@/lib/ai/geminiAI";

const StockFormBill = ({
  type,
  relatedData,
  currentUserId,
  stateSheet,
  stateForm,
}: {
  type: "create" | "update";
  relatedData?: any;
  currentUserId: number;
  stateSheet: Dispatch<SetStateAction<boolean>>;
  stateForm: boolean;
}) => {
  const formAddStockBill = useForm<StockSchemaImg>({
    resolver: zodResolver(stockSchemaImg_),
    defaultValues: {
      product_stock: "NULL",
      unit_stock: "NULL",
      description_stock: "NULL",
      pcs_stock: 1,
      price_now_stock: 1,
      img_stock: "",
      creator_id: currentUserId,
      category_id: 1,
      supplier_id: 1,
    },
  });

  const router = useRouter();
  const [isPending, startTransitionBill] = useTransition();
  const [isSubmittingBill, setisSubmittingBill] = useState(false);
  const [stateBill, formBillAction] = useActionState(createStockByImg, {
    success: false,
    error: false,
  });

  const onSubmit = async (data: StockSchemaImg) => {
    try {
      setisSubmittingBill(true);
      const finalData = { ...data };
      let itemsFromAI: BillItem[] = [];

      if (
        data.img_file_validation &&
        data.img_file_validation instanceof File
      ) {
        const imageUrl = await handleImageUpload(data.img_file_validation);
        const array_form_file = await getPresignedUrltoAI(imageUrl);

        //delete after get data form file
        let status;
        let payload;
        if (imageUrl) {
          const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
          const urlObject = new URL(imageUrl);
          const pathname = urlObject.pathname;
          const key = pathname.substring(`/${bucketName}/`.length);
          status = await deleteFileS3(key);
          itemsFromAI = array_form_file.text;
        }

        if (status?.success) {
          payload = {
            items: itemsFromAI,
            creator_id: finalData.creator_id,
            category_id: finalData.category_id,
            supplier_id: finalData.supplier_id,
          };
        }

        if (payload) {
          startTransitionBill(() => {
            formBillAction(payload);
          });
        } else {
          console.error("Payload is undefined, cannot submit.");
          toast.error("ไม่สามารถสร้างข้อมูลได้เนื่องจากข้อมูลไม่สมบูรณ์");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    }
  };

  useEffect(() => {
    if (stateBill.success) {
      formAddStockBill.reset();
      toast.success(`สินค้าถูก ${type === "create" ? "เพิ่ม" : "แก้ไข"}!`);
      setisSubmittingBill(false);
      stateSheet(false);
      router.refresh();
    }
  }, [formAddStockBill, type, stateBill, stateSheet]);

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
        <Form {...formAddStockBill}>
          <form
            id="addStockFormBill"
            className="space-y-8 px-6 py-4"
            onSubmit={formAddStockBill.handleSubmit(onSubmit)}
          >
            <FormFieldImageUpload
              control={formAddStockBill.control}
              name="img_file_validation"
              label="ไฟล์ใบเสร็จสินค้า"
            />
            <Button
              type="submit"
              form="addStockFormBill"
              className="w-full"
              disabled={isSubmittingBill}
            >
              {isSubmittingBill
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

export default StockFormBill;
