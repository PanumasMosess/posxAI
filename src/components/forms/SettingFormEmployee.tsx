import { EmployeeSchema, EmployeeSchema_ } from "@/lib/formValidationSchemas";
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
import { createEmployee } from "@/lib/actions/actionSettings"; // Ensure this action exists
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PositionType } from "@/lib/type";
import { FormFieldImageUpload } from "./FormFieldImageUpload";
import { handleImageUpload } from "@/lib/actions/actionIndex";

const SettingFormEmployee = ({
  type,
  currentUserId,
  organizationId,
  stateSheet,
  stateForm,
  positions = [],
}: {
  type: "create" | "update";
  currentUserId: number;
  organizationId: number;
  stateSheet: Dispatch<SetStateAction<boolean>>;
  stateForm: boolean;
  positions?: PositionType[];
}) => {
  const formAddEmployee = useForm<EmployeeSchema>({
    resolver: zodResolver(EmployeeSchema_),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      surname: "",
      email: "",
      img: "",
      position_id: undefined,
      created_by: currentUserId,
      organizationId: organizationId,
    },
  });

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, formAction] = useActionState(createEmployee, {
    success: false,
    error: false,
  });

  const onSubmit = async (dataForm: EmployeeSchema) => {
    try {
      setIsSubmitting(true);
      const finalData = {
        ...dataForm,
        created_by: Number(currentUserId),
        organizationId: Number(organizationId),
        position_id: Number(dataForm.position_id),
      };

      // if (type === "update" && OldImg && dataForm.img_stock) {
      //   const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
      //   const urlObject = new URL(OldImg);
      //   const pathname = urlObject.pathname;
      //   const key = pathname.substring(`/${bucketName}/`.length);
      //   const status_del_old = await deleteFileS3(key);
      // }

      if (dataForm.img && dataForm.img instanceof File) {
        const imageUrl = await handleImageUpload(dataForm.img);
        finalData.img = imageUrl;
      } else {
        // finalData.img = OldImg;
        finalData.img = "";
      }

      startTransition(async () => {
        formAction(finalData);
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (state.success) {
      toast.success(`พนักงานถูก ${type === "create" ? "เพิ่ม" : "แก้ไข"}!`);
      setIsSubmitting(false);
      formAddEmployee.reset();
      router.refresh();
      stateSheet(false);
    } else if (state.error) {
      // Handle explicit error state from server action if returned
      toast.error("ไม่สามารถบันทึกข้อมูลได้");
      setIsSubmitting(false);
    }
  }, [state, type, setIsSubmitting, formAddEmployee, router, stateSheet]);

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <SheetHeader className="px-6 pt-6 pb-4">
        <SheetTitle>
          {type === "create" ? "เพิ่มพนักงาน" : "แก้ไขข้อมูลพนักงาน"}
        </SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        <Form {...formAddEmployee}>
          <form
            id="formAddEmployee"
            className="space-y-4 px-6 pb-6"
            onSubmit={formAddEmployee.handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={formAddEmployee.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อผู้ใช้ (Username)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAddEmployee.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="******" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={formAddEmployee.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อจริง</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="สมชาย" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAddEmployee.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>นามสกุล</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ใจดี" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={formAddEmployee.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>อีเมล</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@email.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formAddEmployee.control}
              name="position_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ตำแหน่ง</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกตำแหน่ง" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id.toString()}>
                          {pos.position_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormFieldImageUpload
              control={formAddEmployee.control}
              name="img"
              label="รูปโปรไฟล์"
            />

            <Button
              type="submit"
              form="formAddEmployee"
              className="w-full mt-6"
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

export default SettingFormEmployee;
