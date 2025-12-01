"use client";

import {
  Dispatch,
  SetStateAction,
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SupplierSchema, supplierSchema_ } from "@/lib/formValidationSchemas";
import { Input } from "../ui/input";
import { crearteSupplier, updateSupplier } from "@/lib/actions/actionStocks";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const StockFormSupplier = ({
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
  const formAddSup = useForm<SupplierSchema>({
    resolver: zodResolver(supplierSchema_),
    defaultValues: {
      supplierName: "",
      createdById: currentUserId,
      organizationId: organizationId,
    },
  });
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, formAction] = useActionState(
    type === "create" ? crearteSupplier : updateSupplier,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = async (dataForm: SupplierSchema) => {
    try {
      setIsSubmitting(true);
      const finalData = { ...dataForm };
      startTransition(async () => {
        formAction(finalData);
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    }
  };

  useEffect(() => {
    if (state.success) {
      toast.success(
        `ซัพพลายเออร์ถูก ${type === "create" ? "เพิ่ม" : "แก้ไข"}!`
      );
      setIsSubmitting(false);
      formAddSup.reset();
      router.refresh();
      stateSheet(false);
    }
  }, [state, type, setIsSubmitting, formAddSup, router, stateSheet]);

  useEffect(() => {
    if (stateForm) {
      formAddSup.reset();
    }

    // ทำงานเมื่อเป็นโหมดแก้ไขและมี data
    if (type === "update" && data) {
      formAddSup.setValue("supplierName", data.supplierName);
      formAddSup.setValue("id", data.id);
    }
  }, [type, data, stateForm, formAddSup]);

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <SheetHeader className="px-6 pt-6 pb-4">
        <SheetTitle>
          {type === "create"
            ? "เพิ่มรายการหมวดหมู่สินค้า"
            : "แก้ไขรายการหมวดหมู่สินค้า"}
        </SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        <Form {...formAddSup}>
          <form
            id="addSupForm"
            className="space-y-6 px-6 pb-6"
            onSubmit={formAddSup.handleSubmit(onSubmit)}
          >
            {data && (
              <>
                <FormField
                  control={formAddSup.control}
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
              control={formAddSup.control}
              name="supplierName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อซัพพลายเลอร์</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              form="addSupForm"
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

export default StockFormSupplier;
