"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { SettingPermissions } from "@/lib/type";

const EditableCell = ({
  getValue,
  row,
  onUpdate,
}: any) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    if (value !== initialValue) {
      onUpdate(row.original.id, value);
    }
  };

  if (isEditing) {
    return (
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
        }}
        className="border px-2 py-1 rounded w-full text-center"
        autoFocus
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer"
    >
      {value}
    </div>
  );
};

const column_setting_permission = (
  onUpdateKey: (id: number, value: string) => void,
  onUpdateName: (id: number, value: string) => void,
  onUpdateStatus: (id: number, value: string) => void
): ColumnDef<SettingPermissions>[] => [
    {
      id: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium ml-4">
          {row.index + 1}
        </div>
      ),
    },

    {
      accessorKey: "permissionKey",
      header: ({ column }) => (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Key
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: (props) => (
        <EditableCell {...props} onUpdate={onUpdateKey} />
      ),
    },
    {
      accessorKey: "permissionName",
      header: ({ column }) => (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            ชื่อสิทธิ
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: (props) => (
        <EditableCell {...props} onUpdate={onUpdateName} />
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">สถานะ</div>,
      cell: ({ row }) => {
        const currentStatus = row.getValue("status") as string;
        const permissionId = row.original.id;

        return (
          <div className="flex justify-center items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${currentStatus === "ACTIVE"
                ? "bg-green-500"
                : "bg-gray-400"
                }`}
            />

            <select
              className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              value={currentStatus || "INACTIVE"}
              onChange={(e) => {
                const newStatus = e.target.value;
                onUpdateStatus(permissionId, newStatus);
              }}
            >
              <option value="ACTIVE">ใช้งาน</option>
              <option value="INACTIVE">ปิดใช้งาน</option>
            </select>
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: () => <div className="text-center">อัปเดตล่าสุด</div>,
      cell: ({ row }) => {
        const dateVal = row.getValue("updatedAt");
        if (!dateVal) return <div className="text-center">-</div>;

        const d = new Date(dateVal as string);
        const formatted = d.toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div className="text-center text-sm text-gray-500">
            {formatted}
          </div>
        );
      },
    },
  ];

export default column_setting_permission;