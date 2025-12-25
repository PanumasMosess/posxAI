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
  ModifierGroupSchema,
  modifierGroupSchema_,
} from "@/lib/formValidationSchemas";
import {
  crearteModifierGroup,
  updateModifierGroup,
} from "@/lib/actions/actionSettings";
import { Switch } from "../ui/switch";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const ModifierGroupForm = ({
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
  const formAddGroupItem = useForm<ModifierGroupSchema>({
    resolver: zodResolver(modifierGroupSchema_),
    defaultValues: {
      name: "",
      minSelect: 0,
      maxSelect: 1,
      organizationId: organizationId,
    },
  });
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, formAction] = useActionState(
    type === "create" ? crearteModifierGroup : updateModifierGroup,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = async (dataForm: ModifierGroupSchema) => {
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
      toast.success(`กลุ่มรายการถูก ${type === "create" ? "เพิ่ม" : "แก้ไข"}!`);
      setIsSubmitting(false);
      formAddGroupItem.reset();
      router.refresh();
      stateSheet(false);
    }
  }, [state, type, setIsSubmitting, formAddGroupItem, router, stateSheet]);

  useEffect(() => {
    if (stateForm) {    
      if (type === "create") {
        formAddGroupItem.reset({
          name: "",
          minSelect: 0,
          maxSelect: 1,
          organizationId: organizationId,
        });
      } else if (type === "update" && data) {
        formAddGroupItem.reset({
          id: data.id,
          name: data.name,
          minSelect: data.minSelect,
          maxSelect: data.maxSelect,
          organizationId: organizationId,
        });
      }
    }
  }, [type, data, stateForm, formAddGroupItem, organizationId]);

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <SheetHeader className="px-6 pt-6 pb-4">
        <SheetTitle>
          {type === "create" ? "เพิ่มรายการกลุ่ม" : "แก้ไขรายการกลุ่ม"}
        </SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        <Form {...formAddGroupItem}>
          <form
            id="formAddGroup"
            className="space-y-6 px-6 pb-6"
            onSubmit={formAddGroupItem.handleSubmit(onSubmit)}
          >
            {data && (
              <>
                <FormField
                  control={formAddGroupItem.control}
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
              control={formAddGroupItem.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อกลุ่มรายการ</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formAddGroupItem.control}
              name="minSelect"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      บังคับเลือก (Required)
                    </FormLabel>
                    <div className="text-[0.8rem] text-muted-foreground">
                      หากเปิด ลูกค้าจำเป็นต้องเลือกรายการนี้อย่างน้อย 1 อย่าง
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 1}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 1 : 0)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={formAddGroupItem.control}
              name="maxSelect"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>รูปแบบการเลือก (Selection Type)</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value > 1 ? "multiple" : "single"}
                      onValueChange={(val) => {
                        field.onChange(val === "single" ? 1 : 2);
                      }}
                      className="flex flex-col space-y-3"
                    >
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="single" />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-normal">
                            เลือกได้ข้อเดียว (Single Select)
                          </FormLabel>
                          <FormDescription>
                            เช่น เลือกเส้น, เลือกน้ำซุป
                            (ลูกค้าเลือกได้แค่อย่างเดียว)
                          </FormDescription>
                        </div>
                      </FormItem>

                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="multiple" />
                        </FormControl>
                        <div className="space-y-1 w-full">
                          <FormLabel className="font-normal">
                            เลือกได้หลายข้อ (Multi Select)
                          </FormLabel>
                          <FormDescription>
                            เช่น ท็อปปิ้ง, ผัก (ลูกค้าติ๊กเลือกได้หลายอย่าง)
                          </FormDescription>
                          {field.value > 1 && (
                            <div className="mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                              <span className="text-sm text-zinc-500">
                                จำกัดจำนวนสูงสุด:
                              </span>
                              <Input
                                type="number"
                                className="w-24 h-8"
                                value={field.value}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 2)
                                }
                                min={2}
                              />
                              <span className="text-sm text-zinc-500">
                                รายการ
                              </span>
                            </div>
                          )}
                        </div>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              form="formAddGroup"
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

export default ModifierGroupForm;
