"use client";

import Image from "next/image";
import { 
  UserCircle, 
  Phone, 
  Briefcase, 
  Mail, 
  ShieldCheck, 
  ReceiptText, 
  CreditCard, 
  Coins 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProfileClientProps } from "@/lib/type";

export default function ProfileClient({
  profileData,
  positionData,
  orders = [],
}: ProfileClientProps) {
  
  const isEntertainer = positionData?.position_name === "Entertainer";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
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
          {/* ส่วนรูปภาพและชื่อ */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-14 mb-8">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-background bg-muted flex items-center justify-center shadow-2xl shrink-0">
              {profileData.img ? (
                <Image
                  src={profileData.img}
                  alt={`${profileData.name} profile`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, 128px"
                  priority 
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
                 variant={profileData.status === "ACTIVE" || profileData.status === "ON" ? "default" : "destructive"}
                 className="text-xs font-bold px-4 py-1.5 rounded-full shadow-sm"
               >
                 {profileData.status === "ON" ? "ACTIVE" : profileData.status}
               </Badge>
            </div>
          </div>

          {/* กริดรายละเอียดข้อมูลการติดต่อและ ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {/* ข้อมูลเบอร์โทร */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/40 border border-border/40 shadow-inner">
              <div className="p-3 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">เบอร์โทรศัพท์</p>
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
                <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">อีเมล</p>
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
                <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">รหัสบัญชีผู้ใช้งาน (ID)</p>
                <p className="text-xl font-bold text-foreground mt-0.5 tracking-tight">
                  POSX-USER-{String(profileData.id).padStart(5, "0")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------
          ส่วนที่ 2: ประวัติผลงาน (เฉพาะ Entertainer)
      -------------------------------------- */}
      {isEntertainer && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4 px-2">
            <ReceiptText className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-foreground">
              ประวัติผลงาน (รายละเอียดบิล)
            </h3>
          </div>

          <div className="border rounded-2xl bg-card/60 backdrop-blur-sm overflow-hidden shadow-lg">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[140px]">วันที่-เวลา</TableHead>
                  <TableHead className="w-[180px]">เลขที่บิล / โต๊ะ</TableHead>
                  <TableHead>รายการที่สั่งทั้งหมดในบิล</TableHead>
                  <TableHead className="text-right w-[160px]">ยอดชำระเงิน (฿)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.orderNumber} className="hover:bg-muted/30 transition-colors group">
                      
                      {/* 1. วันที่ */}
                      <TableCell className="text-muted-foreground text-sm align-top pt-5">
                        {new Date(order.createdAt).toLocaleString("th-TH", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      
                      {/* 2. เลขบิลและโต๊ะ */}
                      <TableCell className="align-top pt-5">
                        <div className="font-semibold text-foreground text-base">
                          {order.tableName}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {order.orderNumber}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`mt-2 text-[10px] ${
                            order.status === "PAID" 
                              ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30" 
                              : "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30"
                          }`}
                        >
                          {order.status === "PAID" ? "ชำระแล้ว" : "กำลังทาน"}
                        </Badge>
                      </TableCell>

                      {/* 3. รายการเมนูทั้งหมด */}
                      <TableCell className="pt-4 pb-4">
                        <ul className="space-y-2">
                          {order.menus.map((menu) => (
                            <li 
                              key={menu.id} 
                              className={`text-sm flex justify-between items-center px-3 py-2 rounded-lg border ${
                                menu.isMC 
                                  ? "bg-primary/10 border-primary/20 shadow-sm" // ไฮไลท์สำหรับเมนูที่เป็น MC
                                  : "bg-muted/20 border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={menu.isMC ? "font-semibold text-primary" : "text-muted-foreground"}>
                                  {menu.menuName}
                                </span>
                                <span className="text-xs text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded-md">
                                  x{menu.quantity}
                                </span>
                              </div>
                              <span className={`text-xs font-medium ${menu.isMC ? "text-primary" : "text-muted-foreground"}`}>
                                ฿{menu.price_sum.toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </TableCell>

                      {/* 4. ยอดรวม และ การจ่ายเงิน */}
                      <TableCell className="text-right align-top pt-5 pr-6">
                        <div className="text-lg font-bold text-foreground">
                          {order.totalAmount.toLocaleString()}
                        </div>
                        
                        {/* ส่วนลด */}
                        {order.discount > 0 && (
                          <div className="text-xs text-red-500 mt-1.5 font-medium flex items-center justify-end gap-1">
                            ส่วนลด: -{order.discount.toLocaleString()}
                          </div>
                        )}
                        
                        {/* วิธีชำระเงิน */}
                        {order.status === "PAID" && (
                          <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-muted-foreground bg-muted/40 inline-flex ml-auto px-2 py-1 rounded-md">
                            {order.paymentMethod.toLowerCase().includes("cash") ? (
                              <Coins className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                            )}
                            <span>{order.paymentMethod}</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ReceiptText className="w-8 h-8 mb-2 opacity-20" />
                        <p>ยังไม่มีประวัติผลงานการรับโต๊ะ</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <p className="text-center text-xs text-muted-foreground/50 mt-12 mb-4">
        ข้อมูลนี้เป็นข้อมูลส่วนบุคคลของระบบ POSX หากต้องการแก้ไขกรุณาติดต่อผู้ดูแลระบบ
      </p>
    </div>
  );
}