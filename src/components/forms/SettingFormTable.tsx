import { TableSchema, TableSchema_ } from "@/lib/formValidationSchemas";
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
import { createTable } from "@/lib/actions/actionSettings";

const SettingFormTable = ({
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
  const formAddTable = useForm<TableSchema>({
    resolver: zodResolver(TableSchema_),
    defaultValues: {
      tableName: "",
      closeById: currentUserId,
      status: "AVAILABLE",
      organizationId: organizationId
    },
  });

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, formAction] = useActionState(createTable, {
    success: false,
    error: false,
  });

  const onSubmit = async (dataForm: TableSchema) => {
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
          `โต๊ะถูก ${type === "create" ? "เพิ่ม" : "แก้ไข"}!`
        );
        setIsSubmitting(false);
        formAddTable.reset();
        router.refresh();
        stateSheet(false);
      }
    }, [state, type, setIsSubmitting, formAddTable, router, stateSheet]);

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <SheetHeader className="px-6 pt-6 pb-4">
        <SheetTitle>{type === "create" ? "เพิ่มโต๊ะ" : "แก้ไขโต๊ะ"}</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        <Form {...formAddTable}>
          <form
            id="addTableForm"
            className="space-y-6 px-6 pb-6"
            onSubmit={formAddTable.handleSubmit(onSubmit)}
          >
            <FormField
              control={formAddTable.control}
              name="tableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อโต๊ะ</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              form="addTableForm"
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

export default SettingFormTable;
