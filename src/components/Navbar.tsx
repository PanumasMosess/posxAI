"use client";
// ✅ 1. เพิ่ม import Lock เข้ามา
import { LogOut, Moon, Sun, User, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { NavbarTheme } from "./navbar-theme";
import { handleSignOut } from "@/lib/actions/actionAuths";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { useUser } from "./providers/UserContext";
import Link from "next/link";

const Navbar = () => {
  const { employeeName, img, employeeId } = useUser();

  return (
    <nav className="p-4 flex items-center justify-between">
      {/* LEFT */}
      <SidebarTrigger />

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* THEME MENU  */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <NavbarTheme />
        </DropdownMenu>

        {/* USER MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={img || undefined} />
              <AvatarFallback>NO</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10}>
            <DropdownMenuLabel> {employeeName}</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* เมนูผู้ใช้งาน */}
            <DropdownMenuItem asChild>
              <Link
                href={`/settings/users/${employeeId || ""}`}
                className="cursor-pointer w-full flex items-center"
              >
                <User className="h-[1.2rem] w-[1.2rem] mr-2" /> ผู้ใช้งาน
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                window.dispatchEvent(new Event("manual-lock"));
              }}
              className="cursor-pointer text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950"
            >
              <Lock className="h-[1.2rem] w-[1.2rem] mr-2" /> ล็อกหน้าจอ
            </DropdownMenuItem>

            {/* เมนูออกจากระบบ */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => e.preventDefault()}
                  className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950 cursor-pointer"
                >
                  <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
                  ออกจากระบบ
                </DropdownMenuItem>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการออกจากระบบ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบบัญชีของคุณ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSignOut}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    ยืนยัน
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
