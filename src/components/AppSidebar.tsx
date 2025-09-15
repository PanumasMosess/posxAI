"use client";

import {
  Home,
  Settings,
  Warehouse,
  SendToBack,
  LogOut,
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

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Menu",
    url: "#",
    icon: SendToBack,
  },
  {
    title: "Stock",
    url: "/stocks",
    icon: Warehouse,
  },
];

const AppSidebar = () => {
  const { state, toggleSidebar } = useSidebar();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex justify-center items-center">
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
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton    asChild>
                    <Link href={item.url} className="py-3 text-base">
                      <item.icon  className="mr-2"/>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem key={"Settings"}>
            <SidebarMenuButton asChild>
              <Link href="#">
                <Settings className="h-[1.2rem] w-[1.2rem] mr-1"/>
                <span>{"Settings"}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem key={"logout"} >
            <SidebarMenuButton  asChild>
              <Link href="#" >
                <LogOut  className="h-[1.2rem] w-[1.2rem] mr-1" />
                <span>{"Logout"}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
