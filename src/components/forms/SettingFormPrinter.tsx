import { PrinterSchema, PrinterSchema_ } from "@/lib/formValidationSchemas";
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
import { createPrinter } from "@/lib/actions/actionSettings";

const SettingFormPrinter = ({
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
  const formAddPrinter = useForm<PrinterSchema>({
    resolver: zodResolver(PrinterSchema_),
    defaultValues: {
      printerName: "",
      stationUse: "",
      createdById: currentUserId,
      organizationId: organizationId,
    },
  });

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, formAction] = useActionState(createPrinter, {
    success: false,
    error: false,
  });

  const onSubmit = async (dataForm: PrinterSchema) => {
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
      toast.success(`ปริ้นเตอร์ถูก ${type === "create" ? "เพิ่ม" : "แก้ไข"}!`);
      setIsSubmitting(false);
      formAddPrinter.reset();
      router.refresh();
      stateSheet(false);
    }
  }, [state, type, setIsSubmitting, formAddPrinter, router, stateSheet]);

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <SheetHeader className="px-6 pt-6 pb-4">
        <SheetTitle>{type === "create" ? "เพิ่มปริ้นเตอร์" : "แก้ไขปริ้นเตอร์"}</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        <Form {...formAddPrinter}>
          <form
            id="formAddPrinter"
            className="space-y-6 px-6 pb-6"
            onSubmit={formAddPrinter.handleSubmit(onSubmit)}
          >
            <FormField
              control={formAddPrinter.control}
              name="printerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อเครื่องปริ้น</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formAddPrinter.control}
              name="stationUse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สถาที่ใช้ปริ้น</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              form="formAddPrinter"
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

export default SettingFormPrinter;
