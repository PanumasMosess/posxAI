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
  SheetDescription,
} from "../ui/sheet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  ModifierItemSchema,
  modifierItemSchema_,
} from "@/lib/formValidationSchemas";
import {
  crearteModifierItem,
  updateModifierItem,
} from "@/lib/actions/actionSettings";

const ModifierItemForm = ({
  type,
  relatedData, // ต้องส่ง list ของ modifierGroups มาในนี้
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup Form
  const formAddItem = useForm<ModifierItemSchema>({
    resolver: zodResolver(modifierItemSchema_),
    defaultValues: {
      name: "",
      price: 0,
      groupId: 0,
      organizationId: organizationId,
    },
  });

  const [state, formAction] = useActionState(
    type === "create" ? crearteModifierItem : updateModifierItem,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = async (dataForm: ModifierItemSchema) => {
    setIsSubmitting(true);
    try {
      const finalData = { ...dataForm };
      //   console.log("Submitting Item:", finalData);
      startTransition(() => {
        formAction(finalData);
      });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  useEffect(() => {
    if (state?.success) {
      toast.success(
        `ตัวเลือกถูก ${type === "create" ? "เพิ่ม" : "แก้ไข"} เรียบร้อย!`
      );
      setIsSubmitting(false);
      formAddItem.reset();
      router.refresh();
      stateSheet(false);
    } else if (state?.error) {
      toast.error(state.error || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
      setIsSubmitting(false);
    }
  }, [state, type, router, stateSheet, formAddItem]);

  useEffect(() => {
    if (stateForm) {
      if (type === "create") {
        formAddItem.reset({
          name: "",
          price: 0,
          groupId: 0,
          organizationId: organizationId,
        });
      } else if (type === "update" && data) {
        formAddItem.reset({
          id: data.id,
          name: data.name,
          price: data.price,
          groupId: data.groupId,
          organizationId: organizationId,
        });
      }
    }
  }, [type, data, stateForm, formAddItem]);

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <SheetHeader className="px-6 pt-6 pb-4">
        <SheetTitle>
          {type === "create" ? "เพิ่มตัวเลือกย่อย" : "แก้ไขตัวเลือกย่อย"}
        </SheetTitle>
        <SheetDescription>
          กรอกข้อมูลตัวเลือกสินค้า เช่น ชื่อและราคาเพิ่มเติม
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        <Form {...formAddItem}>
          <form
            id="formAddItem"
            className="space-y-6 px-6 pb-6"
            onSubmit={formAddItem.handleSubmit(onSubmit, (err) =>
              console.log(err)
            )}
          >
            {type === "update" && (
              <FormField
                control={formAddItem.control}
                name="id"
                render={({ field }) => (
                  <input type="hidden" {...field} value={field.value || ""} />
                )}
              />
            )}

            <FormField
              control={formAddItem.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>กลุ่มตัวเลือก (จำเป็น)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="-- เลือกกลุ่ม --" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {relatedData?.modifiergroup?.map((group: any) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    ตัวเลือกนี้จะไปอยู่ในกลุ่มไหน? (เช่น เส้นเล็ก อยู่ในกลุ่ม
                    ประเภทเส้น)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formAddItem.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อตัวเลือก</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="เช่น เส้นเล็ก, ไข่ดาว, หวานน้อย"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formAddItem.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ราคาบวกเพิ่ม (บาท)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={Number.isNaN(field.value) ? "" : field.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? 0 : parseFloat(val));
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    ใส่ 0 หากไม่คิดเงินเพิ่ม (เช่น เลือกเส้นฟรี)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
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

export default ModifierItemForm;
