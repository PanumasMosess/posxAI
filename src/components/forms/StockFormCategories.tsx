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
import { CategorySchema, categorySchema_ } from "@/lib/formValidationSchemas";
import { Input } from "../ui/input";
import {
  crearteCategories,
  updateCategories,
} from "@/lib/actions/actionStocks";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const StockFormCategories = ({
  type,
  relatedData,
  currentUserId,
  data,
  stateSheet,
  stateForm,
}: {
  type: "create" | "update";
  relatedData?: any;
  currentUserId: number;
  data?: any;
  stateSheet: Dispatch<SetStateAction<boolean>>;
  stateForm: boolean;
}) => {
  const formAddCat = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema_),
    defaultValues: {
      categoryName: "",
      createdById: currentUserId,
    },
  });
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, formAction] = useActionState(
    type === "create" ? crearteCategories : updateCategories,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = async (dataForm: CategorySchema) => {
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
        `หมวดหมู่สินค้าถูก ${type === "create" ? "เพิ่ม" : "แก้ไข"}!`
      );
      setIsSubmitting(false);
      formAddCat.reset();
      router.refresh();
      stateSheet(false);
    }
  }, [state, type, setIsSubmitting, formAddCat, router, stateSheet]);

  useEffect(() => {
    if (stateForm) {
      formAddCat.reset();
    }

    // ทำงานเมื่อเป็นโหมดแก้ไขและมี data
    if (type === "update" && data) {
      formAddCat.setValue("categoryName", data.categoryName);
      formAddCat.setValue("id", data.id);
    }
  }, [type, data, stateForm, formAddCat]);

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <SheetHeader>
        <SheetTitle className="mb-2">
          {type === "create"
            ? "เพิ่มรายการหมวดหมู่สินค้า"
            : "แก้ไขรายการหมวดหมู่สินค้า"}
        </SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        <Form {...formAddCat}>
          <form
            id="addCatForm"
            className="space-y-8 px-6 py-4"
            onSubmit={formAddCat.handleSubmit(onSubmit)}
          >
            {data && (
              <>
                <FormField
                  control={formAddCat.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={formAddCat.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อหมวดหมู่</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              form="addCatForm"
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

export default StockFormCategories;
