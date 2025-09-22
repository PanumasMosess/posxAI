"use client";

import React from "react";
import { useTheme } from "next-themes";
import { DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";

export const NavbarTheme = () => {
      const { theme, setTheme } = useTheme();
  return (
    <>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          สว่าง
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          มืด
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          ระบบเริ่มต้น
        </DropdownMenuItem>
      </DropdownMenuContent>
    </>
  );
};
