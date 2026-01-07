import { PositionSchema, PositionSchema_ } from "@/lib/formValidationSchemas"; 
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
import { createPosition } from "@/lib/actions/actionSettings"; 

const SettingFormPosition = ({
  type,
  currentUserId,
  organizationId,
  stateSheet,
  stateForm,
}: {
  type: "create" | "update";
  currentUserId: number;
  organizationId: number;
  stateSheet: Dispatch<SetStateAction<boolean>>;
  stateForm: boolean;
}) => {
  const formAddPosition = useForm<PositionSchema>({
    resolver: zodResolver(PositionSchema_),
    defaultValues: {
      position_name: "", 
      createdById: currentUserId,
      organizationId: organizationId,
    },
  });

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [state, formAction] = useActionState(createPosition, {
    success: false,
    error: false,
  });

  const onSubmit = async (dataForm: PositionSchema) => {
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
      toast.success(`ตำแหน่งงานถูก ${type === "create" ? "เพิ่ม" : "แก้ไข"}!`);
      setIsSubmitting(false);
      formAddPosition.reset();
      router.refresh();
      stateSheet(false);
    }
  }, [state, type, setIsSubmitting, formAddPosition, router, stateSheet]);

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <SheetHeader className="px-6 pt-6 pb-4">
        <SheetTitle>
          {type === "create" ? "เพิ่มตำแหน่งงาน" : "แก้ไขตำแหน่งงาน"}
        </SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        <Form {...formAddPosition}>
          <form
            id="formAddPosition"
            className="space-y-6 px-6 pb-6"
            onSubmit={formAddPosition.handleSubmit(onSubmit)}
          >
            <FormField
              control={formAddPosition.control}
              name="position_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อตำแหน่ง</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ระบุชื่อตำแหน่ง (เช่น ผู้จัดการ, พนักงานเสิร์ฟ)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ส่วน Select Station ถูกลบออกเนื่องจาก Position ไม่น่าจะต้องผูกกับ Station */}

            <Button
              type="submit"
              form="formAddPosition"
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

export default SettingFormPosition;