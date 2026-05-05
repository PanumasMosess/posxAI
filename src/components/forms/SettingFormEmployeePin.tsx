import {
  EmployeePinSchema,
  EmployeePinSchema_,
} from "@/lib/formValidationSchemas";
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
import { createEmployeePin } from "@/lib/actions/actionSettings";
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

const SettingFormEmployeePin = ({
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
  const formAddEmployeePin = useForm<EmployeePinSchema>({
    resolver: zodResolver(EmployeePinSchema_),
    defaultValues: {
      pin: "",
      name: "",
      surname: "",
      tel: "", // ✅ เพิ่ม default value สำหรับเบอร์โทร
      img: "",
      position_id: 0,
      created_by: currentUserId.toString(),
      organizationId: organizationId,
    },
  });

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, formAction] = useActionState(createEmployeePin, {
    success: false,
    error: false,
  });

  const onSubmit = async (dataForm: EmployeePinSchema) => {
    try {
      setIsSubmitting(true);
      const finalData = {
        ...dataForm,
        created_by: currentUserId.toString(),
        organizationId: Number(organizationId),
        position_id: Number(dataForm.position_id),
        // ✅ เอาการแปลงค่า birthday ออกไปแล้ว
      };

      if (dataForm.img && dataForm.img instanceof File) {
        const imageUrl = await handleImageUpload(dataForm.img);
        finalData.img = imageUrl;
      } else {
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
      formAddEmployeePin.reset();
      router.refresh();
      stateSheet(false);
    } else if (state.error) {
      toast.error("ไม่สามารถบันทึกข้อมูลได้");
      setIsSubmitting(false);
    }
  }, [state, type, setIsSubmitting, formAddEmployeePin, router, stateSheet]);

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
        <Form {...formAddEmployeePin}>
          <form
            id="formAddEmployeePin"
            className="space-y-4 px-6 pb-6"
            onSubmit={formAddEmployeePin.handleSubmit(onSubmit)}
          >
            <FormField
              control={formAddEmployeePin.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัส PIN</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="รหัสตัวเลข 4 หลัก"
                      maxLength={4}
                      onChange={(e) =>
                        field.onChange(e.target.value.replace(/[^0-9]/g, ""))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={formAddEmployeePin.control}
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
                control={formAddEmployeePin.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>นามสกุล</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ใส่หรือไม่ก็ได้" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ✅ เพิ่มฟิลด์เบอร์โทรศัพท์ */}
            <FormField
              control={formAddEmployeePin.control}
              name="tel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เบอร์โทรศัพท์</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="08xxxxxxxx"
                      maxLength={10}
                      onChange={(e) =>
                        field.onChange(e.target.value.replace(/[^0-9]/g, ""))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formAddEmployeePin.control}
              name="position_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ตำแหน่ง</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
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
              control={formAddEmployeePin.control}
              name="img"
              label="รูปโปรไฟล์"
            />

            <Button
              type="submit"
              form="formAddEmployeePin"
              className="w-full mt-6"
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

export default SettingFormEmployeePin;
