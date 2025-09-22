"use client";
import { SignInSchema, signInSchema_ } from "@/lib/formValidationSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {  useState } from "react";
import { verifyCredentials } from "@/lib/actions/actionAuths";
import { toast } from "react-toastify";

const SigninForm = () => {
  const formSignin = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema_),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // state ต่างๆ
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: SignInSchema) => {
    const finalData = { ...values };
    setIsSubmitting(true);

    const result = await verifyCredentials(finalData);
    try {
      if (result.message === "Invalid credentials") {
        toast.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (  
    <div className="w-full max-w-sm">
      <div className="text-right mb-4">
        <p className="text-sm text-muted-foreground">
          Not a member?{" "}
          <Link
            href="/register"
            className="font-medium underline  text-orange-400"
          >
            สมัครใช้งาน
          </Link>
        </p>
      </div>
      <h3 className="text-2xl font-semibold mb-4">เข้าสู่ระบบ</h3>
      <Form {...formSignin}>
        <form
          id="formSignin"
          onSubmit={formSignin.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={formSignin.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ยูสเซอร์เนม</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ยูสเซอร์เนม"
                    className="h-11 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formSignin.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-baseline">
                  <FormLabel>รหัสผ่าน</FormLabel>
                  <Link href="#" className="text-xs underline  text-orange-400">
                    ลืมรหัสผ่าน?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="รหัสผ่าน"
                    className="h-11 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            form="formSignin"
            size="lg"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SigninForm;
