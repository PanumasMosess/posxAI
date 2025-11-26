"use client";

import { Settings, LogOut, ChevronDown, User, Printer, Store } from "lucide-react"; // เพิ่ม Icon ที่ต้องการใช้
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
  const { state } = useSidebar(); 
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/home" className="flex justify-center items-center">
                <Image
                  src={state === "collapsed" ? "/icon.png" : "/POSX_2.png"}
                  alt="logo"
                  width={160}
                  height={80}
                />
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
                      <SidebarMenuButton asChild>
                        <Link href={item.url} className="py-3 text-base">
                          <div className="flex items-center">
                            <item.icon className="mr-3 h-5 w-5" />
                            <span>{item.title}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
                if (state === "collapsed") {
                  return (
                    <DropdownMenu key={item.title}>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="w-full justify-center py-3 text-base">
                          <item.icon className="h-5 w-5" />
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
                              target={
                                subItem.url === "/orders?table=0"
                                  ? "_blank"
                                  : undefined
                              }
                              rel={
                                subItem.url === "/orders?table=0"
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                            >
                              {subItem.title}
                            </Link>
                          </SidebarMenuButton>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                } else {
                  return (
                    <Collapsible key={item.title} asChild>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full justify-between py-3 text-base">
                            <div className="flex items-center">
                              <item.icon className="mr-3 h-5 w-5" />
                              <span>{item.title}</span>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="py-2 pl-6 space-y-1">
                            {item.subItems!.map((subItem) => (
                              <SidebarMenuButton
                                key={subItem.title}
                                variant="ghost"
                                className="w-full justify-start"
                                asChild
                              >
                                <Link
                                  href={subItem.url}
                                  target={
                                    subItem.url === "/orders?table=0"
                                      ? "_blank"
                                      : undefined
                                  }
                                  rel={
                                    subItem.url === "/orders?table=0"
                                      ? "noopener noreferrer"
                                      : undefined
                                  }
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
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {state === "collapsed" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-center py-3 text-base">
                  <settingList.icon className="h-[1.2rem] w-[1.2rem]" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                className="w-48"
              >
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
          ) : (
            <Collapsible className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between py-3 text-base">
                    <div className="flex items-center">
                      <settingList.icon className="h-[1.2rem] w-[1.2rem] mr-1" />
                      <span>{settingList.title}</span>
                    </div>
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="py-2 pl-6 space-y-1">
                    {settingList.subItems.map((subItem) => (
                      <SidebarMenuButton
                        key={subItem.title}
                        variant="ghost"
                        className="w-full justify-start h-8 text-sm" 
                        asChild
                      >
                        <Link href={subItem.url}>{subItem.title}</Link>
                      </SidebarMenuButton>
                    ))}
                  </div>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )}

          <SidebarMenuItem key={"logout"}>
            <SidebarMenuButton 
                onClick={handleSignOut} 
                className={state === "collapsed" ? "justify-center" : ""}
            >
              <LogOut className="h-[1.2rem] w-[1.2rem]" />
              {state !== "collapsed" && <span>{"ออกจากระบบ"}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;