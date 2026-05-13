"use client";

import { useState } from "react";
import {
  Pencil,
  Save,
} from "lucide-react";
import { EditModeProps } from "@/lib/type";
import { Button } from "@/components/ui/button";

const Floor_plan_editor = ({
  editMode,
  setEditMode,
}: EditModeProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={
          editMode
            ? "default"
            : "outline"
        }
        onClick={() => {
          setEditMode(!editMode);
        }}
      >
        <Pencil className="w-4 h-4 mr-2" />

        {editMode
          ? "กำลังแก้ไขผังร้าน"
          : "แก้ไขผังร้าน"}
      </Button>
    </div>
  );
};

export default Floor_plan_editor;