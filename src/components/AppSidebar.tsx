"use client";

import {
  LogOut,
  ChevronDown,
  FileBadge,
  FileKey,
  Loader2,
  UploadCloud,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { handleSignOut } from "@/lib/actions/actionAuths";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import menuList from "@/lib/data_temp";
import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { uploadCertToS3 } from "@/lib/actions/actionIndex";
import { toast } from "react-toastify";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

const items = menuList.menuList;
const settingList = menuList.settingsMenu;

const AppSidebar = () => {
  const { state, isMobile } = useSidebar();
  const { data: session } = useSession(); 

  const isCollapsed = state === "collapsed" && !isMobile;

  const [isPrinterDialogOpen, setIsPrinterDialogOpen] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadFiles = async (e: FormEvent) => {
    e.preventDefault();
    if (!certFile && !keyFile) {
      toast.warning("กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์");
      return;
    }

    const organizationId = session?.user?.organizationId || 0;

    setIsUploading(true);
    const formData = new FormData();
    if (certFile) formData.append("cert", certFile);
    if (keyFile) formData.append("key", keyFile);
    formData.append("organizationId", organizationId.toString());

    try {
      const result = await uploadCertToS3(formData);
      if (result.success) {
        toast.success(result.message);
        setIsPrinterDialogOpen(false); 
        setCertFile(null);
        setKeyFile(null);
      } else {
        toast.error("ไม่สำเร็จ: " + result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ S3");
    } finally {
      setIsUploading(false);
    }
  };

  const renderSubMenuItem = (subItem: {
    title: string;
    url: string;
    target?: string;
  }) => {
    
    if (subItem.title === "จัดการเครื่องปริ้น") {
      return (
        <SidebarMenuButton
          key={subItem.title}
          onClick={() => setIsPrinterDialogOpen(true)} 
          className="w-full justify-start cursor-pointer"
        >
          {subItem.title}
        </SidebarMenuButton>
      );
    }

    return (
      <SidebarMenuButton
        key={subItem.title}
        asChild
        className="w-full justify-start"
      >
        <Link href={subItem.url} target={subItem.target || "_self"}>
          {subItem.title}
        </Link>
      </SidebarMenuButton>
    );
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="hover:bg-transparent active:bg-transparent"
              >
                <Link
                  href="/home"
                  className="flex justify-center items-center h-full w-full"
                >
                  {isCollapsed ? (
                    <div className="flex items-center justify-center w-full">
                      <Image
                        src="/icon.png"
                        alt="logo-icon"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <Image
                      src="/POSX_2.png"
                      alt="logo-full"
                      width={160}
                      height={80}
                      className="object-contain"
                    />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent className="p-0">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const hasSubItems = item.subItems && item.subItems.length > 0;

                  if (!hasSubItems) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={isCollapsed ? item.title : undefined}
                          className={isCollapsed ? "justify-center" : ""}
                        >
                          <Link href={item.url} className="py-3 text-base">
                            <item.icon className="h-5 w-5" />
                            {!isCollapsed && (
                              <span className="ml-3">{item.title}</span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  if (isCollapsed) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton className="justify-center py-3 text-base">
                              <item.icon className="h-5 w-5" />
                              <span className="sr-only">{item.title}</span>
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side="right"
                            align="start"
                            className="w-48"
                          >
                            {item.subItems!.map((subItem) => (
                              <SidebarMenuButton
                                key={subItem.title}
                                variant="ghost"
                                className="w-full justify-start"
                                asChild
                              >
                                <Link
                                  href={subItem.url}
                                  target={subItem.target || "_self"}
                                >
                                  {subItem.title}
                                </Link>
                              </SidebarMenuButton>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full justify-between py-3 text-base">
                            <div className="flex items-center">
                              <item.icon className="mr-3 h-5 w-5" />
                              <span>{item.title}</span>
                            </div>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="flex flex-col gap-1 pl-9 py-1">
                            {item.subItems!.map((subItem) => (
                              <SidebarMenuButton
                                key={subItem.title}
                                asChild
                                className="text-sm h-9"
                              >
                                <Link
                                  href={subItem.url}
                                  target={subItem.target || "_self"}
                                >
                                  {subItem.title}
                                </Link>
                              </SidebarMenuButton>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            {/* Settings Menu */}
            {isCollapsed ? (
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="justify-center py-3">
                      <settingList.icon className="h-[1.2rem] w-[1.2rem]" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    className="w-48"
                  >
                    {settingList.subItems.map((subItem) =>
                      // ✅ เรียกใช้ฟังก์ชัน render ที่สร้างไว้
                      renderSubMenuItem(subItem)
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ) : (
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between py-3 text-base">
                      <div className="flex items-center">
                        <settingList.icon className="mr-3 h-[1.2rem] w-[1.2rem]" />
                        <span>{settingList.title}</span>
                      </div>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-col gap-1 pl-9 py-1">
                      {settingList.subItems.map((subItem) =>
                        // ✅ เรียกใช้ฟังก์ชัน render ที่สร้างไว้
                        renderSubMenuItem(subItem)
                      )}
                    </div>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )}

            <SidebarMenuItem key={"logout"}>
              <SidebarMenuButton
                onClick={handleSignOut}
                className={isCollapsed ? "justify-center py-3" : "py-3"}
                tooltip={isCollapsed ? "ออกจากระบบ" : undefined}
              >
                <LogOut className="h-[1.2rem] w-[1.2rem]" />
                {!isCollapsed && <span className="ml-3">{"ออกจากระบบ"}</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <Dialog open={isPrinterDialogOpen} onOpenChange={setIsPrinterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleUploadFiles}>
            <DialogHeader>
              <DialogTitle>ตั้งค่า QZ Tray Security</DialogTitle>
              <DialogDescription>
                อัปโหลดไฟล์ Digital Certificate และ Private Key เพื่อยืนยันตัวตน
                (Silent Print)
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="cert-file" className="flex items-center gap-2">
                  <FileBadge className="h-4 w-4 text-blue-500" />
                  Digital Certificate (.txt)
                </Label>
                <Input
                  id="cert-file"
                  type="file"
                  accept=".txt,.crt,.pem"
                  onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                />
                <p className="text-[10px] text-zinc-500">
                  ไฟล์สาธารณะสำหรับยืนยันใบรับรอง
                </p>
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
                <Label htmlFor="key-file" className="flex items-center gap-2">
                  <FileKey className="h-4 w-4 text-amber-500" />
                  Private Key (.txt)
                </Label>
                <Input
                  id="key-file"
                  type="file"
                  accept=".txt,.key,.pem"
                  onChange={(e) => setKeyFile(e.target.files?.[0] || null)}
                />
                <p className="text-[10px] text-zinc-500">
                  ไฟล์กุญแจส่วนตัว (เก็บรักษาเป็นความลับ)
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                {isUploading ? "กำลังบันทึก..." : "บันทึกไฟล์"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppSidebar;
