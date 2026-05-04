"use client";

import { useEffect, useState } from "react";
import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  getPermissionByPosition,
  updatePositionPermission,
} from "@/lib/actions/actionSettings";
import { Permission } from "@/lib/type";

const SettingFormPositionPermission = ({
  positionId,
  organizationId,
  stateSheet,
}: {
  positionId: number;
  organizationId: number;
  stateSheet: (val: boolean) => void;
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadData = async () => {
    setLoading(true);
    const res = await getPermissionByPosition(positionId);
    if (res.success) {
      setPermissions(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [positionId]);

  const handleToggle = async (
    permissionId: number,
    checked: boolean
  ) => {
    await updatePositionPermission(
      positionId,
      permissionId,
      checked
    );

    // update UI ทันที (ไม่ต้อง refresh หนัก)
    setPermissions((prev) =>
      prev.map((p) =>
        p.id === permissionId
          ? {
            ...p,
            positions: [{ allowed: checked }],
          }
          : p
      )
    );
  };

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      {/* 🔹 Header */}
      <SheetHeader className="px-6 pt-6 pb-4">
        <SheetTitle>ตั้งค่าสิทธิ</SheetTitle>
      </SheetHeader>

      {/* 🔹 Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        {loading ? (
          <div className="text-center text-sm text-gray-500">
            กำลังโหลด...
          </div>
        ) : permissions.length === 0 ? (
          <div className="text-center text-sm text-gray-500">
            ไม่มีสิทธิ
          </div>
        ) : (
          permissions.map((p) => {
            const allowed = p.positions?.[0]?.allowed || false;

            return (
              <div
                key={p.id}
                className="flex items-center justify-between border rounded-md px-3 py-2"
              >
                <div>
                  <div className="font-medium text-sm">
                    {p.permissionName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {p.permissionKey}
                  </div>
                </div>

                <Checkbox
                  checked={allowed}
                  onCheckedChange={(val) =>
                    handleToggle(p.id, Boolean(val))
                  }
                />
              </div>
            );
          })
        )}
      </div>

      {/* 🔹 Footer */}
      <SheetFooter className="p-6">
        <Button
          onClick={() => {
            toast.success("บันทึกสำเร็จ");
            router.refresh();
            stateSheet(false);
          }}
          className="w-full"
        >
          ปิด
        </Button>
      </SheetFooter>
    </SheetContent>
  );
};

export default SettingFormPositionPermission;