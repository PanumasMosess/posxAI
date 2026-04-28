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

// ✅ นำเข้า Schema และ Action ของ Member
import { MemberSchema, MemberSchema_ } from "@/lib/formValidationSchemas";
import { createMember } from "@/lib/actions/actionSettings"; // หรือ actionMember ตามที่คุณตั้งไว้

const SettingFormMember = ({
  type,
  currentUserId,
  organizationId,
  stateSheet,
}: {
  type: "create" | "update";
  currentUserId: number;
  organizationId: number;
  stateSheet: Dispatch<SetStateAction<boolean>>;
}) => {
  const formAddMember = useForm<MemberSchema>({
    resolver: zodResolver(MemberSchema_),
    defaultValues: {
      phone: "",
      firstName: "",
      lastName: "",
      points: 0,
      creditBalance: 0,
      organizationId: organizationId,
    },
  });

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, formAction] = useActionState(createMember, {
    success: false,
    error: false,
  });

  const onSubmit = async (dataForm: MemberSchema) => {
    try {
      setIsSubmitting(true);
      const finalData = {
        ...dataForm,
        points: Number(dataForm.points) || 0,
        creditBalance: Number(dataForm.creditBalance) || 0,
        organizationId: Number(organizationId),
      };

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
      toast.success(`สมาชิกถูก ${type === "create" ? "เพิ่ม" : "แก้ไข"}!`);
      setIsSubmitting(false);
      formAddMember.reset();
      router.refresh();
      stateSheet(false);
    } else if (state.error) {
      toast.error("ไม่สามารถบันทึกข้อมูลได้ หรือเบอร์โทรศัพท์นี้มีในระบบแล้ว");
      setIsSubmitting(false);
    }
  }, [state, type, formAddMember, router, stateSheet]);

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <SheetHeader className="px-6 pt-6 pb-4">
        <SheetTitle>
          {type === "create" ? "เพิ่มสมาชิกใหม่" : "แก้ไขข้อมูลสมาชิก"}
        </SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <Form {...formAddMember}>
          <form
            id="formAddMember"
            className="space-y-4 px-6 pb-6"
            onSubmit={formAddMember.handleSubmit(onSubmit)}
          >
            {/* ฟิลด์เบอร์โทรศัพท์ */}
            <FormField
              control={formAddMember.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="0812345678"
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
              {/* ฟิลด์ชื่อจริง */}
              <FormField
                control={formAddMember.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      ชื่อจริง <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="สมชาย" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ฟิลด์นามสกุล (ไม่บังคับ) */}
              <FormField
                control={formAddMember.control}
                name="lastName"
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={formAddMember.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>แต้มเริ่มต้น</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        // ✅ ป้องกัน Error โดยการเช็คค่า undefined/null ให้เป็นค่าว่างหรือ 0
                        value={field.value ?? ""}
                        type="number"
                        min="0"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAddMember.control}
                name="creditBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เครดิตเริ่มต้น</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              form="formAddMember"
              className="w-full mt-6"
              disabled={isSubmitting || isPending}
            >
              {isSubmitting || isPending
                ? "กำลังบันทึก..."
                : type === "create"
                  ? "ยืนยันการเพิ่มสมาชิก"
                  : "บันทึกการแก้ไข"}
            </Button>
          </form>
        </Form>
      </div>
      <SheetFooter className="p-6"></SheetFooter>
    </SheetContent>
  );
};

export default SettingFormMember;
