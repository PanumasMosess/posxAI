"use client"; // ✅ ประกาศเป็น Client Component

import Image from "next/image";
import { UserCircle, Phone, Briefcase, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileClientProps } from "@/lib/type";

export default function ProfileClient({
  profileData,
  positionData,
}: ProfileClientProps) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          ข้อมูลโปรไฟล์
        </h1>
        <p className="text-muted-foreground mt-1">
          รายละเอียดบัญชีผู้ใช้งานระบบ POSX
        </p>
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-2xl">
        {/* แถบ Gradient ด้านบน */}
        <div className="h-32 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 dark:from-sky-800 dark:via-blue-950 dark:to-indigo-950"></div>

        <CardContent className="px-6 sm:px-10 pb-10 relative">
          {/* ส่วนหัว: รูปโปรไฟล์ + ชื่อ + สถานะ */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-14 mb-8">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-background bg-muted flex items-center justify-center shadow-2xl">
              {profileData.img ? (
                <Image
                  src={profileData.img}
                  alt={`${profileData.name} profile image`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, 128px"
                  priority // โหลดรูปนี้เป็นความสำคัญแรก
                />
              ) : (
                <UserCircle className="h-24 w-24 text-muted-foreground/40" />
              )}
            </div>

            <div className="text-center sm:text-left mb-2 flex-1">
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                {profileData.name} {profileData.surname}
              </h2>
              <p className="text-muted-foreground font-semibold flex items-center justify-center sm:justify-start gap-1.5 mt-1.5">
                <Briefcase className="w-4 h-4 text-primary/70" />
                {positionData?.position_name || "ไม่ระบุตำแหน่ง"}
              </p>
            </div>

            <div className="sm:ml-auto mb-2.5">
              <Badge
                variant={
                  profileData.status === "ACTIVE" || profileData.status === "ON"
                    ? "default"
                    : "destructive"
                }
                className="text-xs font-bold px-4 py-1.5 rounded-full shadow-sm"
              >
                {profileData.status === "ON" ? "ACTIVE" : profileData.status}
              </Badge>
            </div>
          </div>

          {/* ส่วนรายละเอียดข้อมูล */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {/* ข้อมูลเบอร์โทร */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/40 border border-border/40 shadow-inner">
              <div className="p-3 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
                  เบอร์โทรศัพท์
                </p>
                <p className="text-lg font-semibold text-foreground mt-0.5">
                  {profileData.tel ? `0${profileData.tel}` : "-"}
                </p>
              </div>
            </div>

            {/* ข้อมูลอีเมล */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/40 border border-border/40 shadow-inner">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
                  อีเมล
                </p>
                <p className="text-lg font-semibold text-foreground mt-0.5">
                  {profileData.email || "-"}
                </p>
              </div>
            </div>

            {/* ข้อมูลรหัสพนักงาน */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/40 border border-border/40 shadow-inner md:col-span-2">
              <div className="p-3 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
                  รหัสบัญชีผู้ใช้งาน (ID)
                </p>
                <p className="text-xl font-bold text-foreground mt-0.5 tracking-tight">
                  POSX-USER-{String(profileData.id).padStart(5, "0")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground/60 mt-10">
        ข้อมูลนี้เป็นข้อมูลส่วนบุคคล หากต้องการแก้ไขกรุณาติดต่อผู้บริหารระบบ
      </p>
    </div>
  );
}
