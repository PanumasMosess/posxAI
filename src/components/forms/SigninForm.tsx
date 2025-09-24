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
import { useState } from "react";
import { googleLogin, verifyCredentials } from "@/lib/actions/actionAuths";
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

  const handleGoogleSignIn = async () => {
    await googleLogin();
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
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full"
        size="lg"
        onClick={handleGoogleSignIn}
      >
        <svg
          role="img"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
        >
          <title>Google</title>
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
      </Button>
    </div>
  );
};

export default SigninForm;
