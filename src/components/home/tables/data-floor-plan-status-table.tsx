"use client";

import { useState } from "react";
import { StatusTable } from "@/lib/type";
import Floor_plan_canvas from "./floor-plan-canvas";
import Floor_plan_editor from "./floor-plan-editor";

type Props = {
  tables: StatusTable[];
};

export const Data_floor_plan_status_table =
({
  tables,
}: Props) => {
  const [editMode, setEditMode] =
    useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Floor_plan_editor
          editMode={editMode}
          setEditMode={
            setEditMode
          }
        />
      </div>

      <Floor_plan_canvas
        tables={tables}
        editMode={editMode}
      />
    </div>
  );
};