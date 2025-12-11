"use client";

import { LogOut, ChevronDown } from "lucide-react";
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
import menuList from "@/lib/data_temp";

const items = menuList.menuList;
const settingList = menuList.settingsMenu;

const AppSidebar = () => {
  // ดึงค่า isMobile มาด้วย เพื่อเช็คว่าเป็นมือถือหรือไม่
  const { state, isMobile } = useSidebar();

  // Logic: เราจะถือว่า "หุบ" (Collapsed) ก็ต่อเมื่อ state เป็น collapsed และ *ไม่ใช่* มือถือ
  // เพราะบนมือถือเราอยากให้โชว์เต็มตลอดเวลาเปิด (Drawer mode)
  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="hover:bg-transparent active:bg-transparent">
              <Link href="/home" className="flex justify-center items-center h-full w-full">
                {/* โลโก้: ถ้าหุบโชว์รูปเล็ก ถ้าเต็มโชว์รูปใหญ่ */}
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

                // กรณีที่ 1: ไม่มีเมนูย่อย (เช่น หน้าหลัก)
                if (!hasSubItems) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        tooltip={isCollapsed ? item.title : undefined} // โชว์ tooltip เฉพาะตอนหุบ
                        className={isCollapsed ? "justify-center" : ""} // จัดกึ่งกลางถ้าหุบ
                      >
                        <Link href={item.url} className="py-3 text-base">
                          <item.icon className="h-5 w-5" />
                          {/* ซ่อนข้อความถ้าหุบอยู่ */}
                          {!isCollapsed && <span className="ml-3">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // กรณีที่ 2: มีเมนูย่อย และ หุบอยู่ (ใช้ Dropdown)
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
                              <Link href={subItem.url}>
                                {subItem.title}
                              </Link>
                            </SidebarMenuButton>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  );
                }

                // กรณีที่ 3: มีเมนูย่อย และ แสดงเต็ม (ใช้ Collapsible)
                return (
                  <Collapsible key={item.title} asChild className="group/collapsible">
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
                            {/* pl-9 เพื่อย่อหน้าเมนูย่อยให้สวยงาม */}
                            {item.subItems!.map((subItem) => (
                              <SidebarMenuButton
                                key={subItem.title}
                                asChild
                                className="text-sm h-9"
                              >
                                <Link href={subItem.url}>
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
                <DropdownMenuContent side="right" align="start" className="w-48">
                    {settingList.subItems.map((subItem) => (
                    <SidebarMenuButton
                        key={subItem.title}
                        variant="ghost"
                        className="w-full justify-start"
                        asChild
                    >
                        <Link href={subItem.url}>{subItem.title}</Link>
                    </SidebarMenuButton>
                    ))}
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
                    {settingList.subItems.map((subItem) => (
                        <SidebarMenuButton
                        key={subItem.title}
                        asChild
                        className="text-sm h-9"
                        >
                        <Link href={subItem.url}>{subItem.title}</Link>
                        </SidebarMenuButton>
                    ))}
                  </div>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )}

          {/* Logout Button */}
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
  );
};

export default AppSidebar;