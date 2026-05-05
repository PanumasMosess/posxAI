"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dispatch,
  SetStateAction,
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";

import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
  Form,
} from "../ui/form";

import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { createPermission } from "@/lib/actions/actionSettings";

import { PermissionSchema, PermissionSchema_ } from "@/lib/formValidationSchemas";

const SettingFormPermission = ({
  type,
  organizationId,
  stateSheet,
  stateForm,
}: {
  type: "create" | "update";
  organizationId: number;
  stateSheet: Dispatch<SetStateAction<boolean>>;
  stateForm: boolean;
}) => {

  const form = useForm<PermissionSchema>({
    resolver: zodResolver(PermissionSchema_),
    defaultValues: {
      permissionKey: "",
      permissionName: "",
      organizationId: organizationId,
    },
  });

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, formAction] = useActionState(createPermission, {
    success: false,
    error: false,
    message: "",
  });

  const onSubmit = async (data: PermissionSchema) => {
    try {
      setIsSubmitting(true);

      const finalData: PermissionSchema = {
        ...data,
        organizationId: organizationId,
      };

      startTransition(() => {
        formAction(finalData);
      });

    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (state.success) {
      toast.success("เพิ่มสิทธิสำเร็จ!");
      setIsSubmitting(false);
      form.reset();
      router.refresh();
      stateSheet(false);
    } else if (state.error) {
      toast.error(state.message || "เกิดข้อผิดพลาด");
      setIsSubmitting(false);
    }
  }, [state]);

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <SheetHeader className="px-6 pt-6 pb-4">
        <SheetTitle>
          {type === "create" ? "เพิ่มสิทธิ" : "แก้ไขสิทธิ"}
        </SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        <Form {...form}>
          <form
            id="formAddPermission"
            className="space-y-6 px-6 pb-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >

            {/* hidden */}
            <input type="hidden" {...form.register("organizationId")} />

            {/* permissionName */}
            <FormField
              control={form.control}
              name="permissionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อสิทธิ</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="เช่น ดูคลังสินค้า"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* permissionKey */}
            <FormField
              control={form.control}
              name="permissionKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="เช่น PRODUCT_VIEW"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              form="formAddPermission"
              className="w-full"
              disabled={isSubmitting || isPending}
            >
              {isSubmitting || isPending
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

export default SettingFormPermission;