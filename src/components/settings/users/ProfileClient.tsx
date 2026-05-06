"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  UserCircle,
  Phone,
  Briefcase,
  Mail,
  ShieldCheck,
  ReceiptText,
  CreditCard,
  Coins,
  Edit2,
  Save,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProfileClientProps } from "@/lib/type";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions/actionSettings";
import { toast } from "react-toastify";

export default function ProfileClient({
  profileData,
  positionData,
  orders = [],
}: ProfileClientProps) {
  const router = useRouter();
  const isSpecialRole = [
    "Admin",
    "admin",
    "Spadmin",
    "spadmin",
    "Entertainer",
  ].includes(positionData?.position_name || "");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: profileData.name,
    surname: profileData.surname,
    tel: profileData.tel ? `0${profileData.tel}` : "",
    email: profileData.email || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const lowerSearch = searchTerm.toLowerCase();
    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(lowerSearch) ||
        order.tableName.toLowerCase().includes(lowerSearch),
    );
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile(profileData.id, formData);

      if (result.success) {
        toast.success(result.message);
        setIsEditDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("ระบบขัดข้อง ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setIsSaving(false);
    }
  };

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
        <div className="h-32 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 dark:from-sky-800 dark:via-blue-950 dark:to-indigo-950"></div>
        <CardContent className="px-6 sm:px-10 pb-10 relative">
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

            {/* กลุ่มสถานะ และ ปุ่มแก้ไขโปรไฟล์ */}
            <div className="sm:ml-auto mb-2.5 flex flex-col sm:flex-row items-center gap-3">
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

              {/* ป๊อปอัปฟอร์มแก้ไขโปรไฟล์ */}
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full shadow-sm"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    แก้ไขข้อมูล
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>แก้ไขโปรไฟล์ส่วนตัว</DialogTitle>
                    <DialogDescription>
                      ปรับปรุงข้อมูลการติดต่อของคุณ จากนั้นกดบันทึกเพื่อยืนยัน
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">ชื่อ</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="surname">นามสกุล</Label>
                        <Input
                          id="surname"
                          name="surname"
                          value={formData.surname}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tel">เบอร์โทรศัพท์</Label>
                      <Input
                        id="tel"
                        name="tel"
                        value={formData.tel}
                        onChange={handleChange}
                        placeholder="08xxxxxxxx"
                        maxLength={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">อีเมล</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      disabled={isSaving}
                    >
                      ยกเลิก
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        "กำลังบันทึก..."
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" /> บันทึกข้อมูล
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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

      {/* -------------------------------------
          ส่วนที่ 3: ประวัติผลงาน (เฉพาะ Entertainer)
      -------------------------------------- */}
      {isSpecialRole && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* ✅ หัวข้อ และ ช่องค้นหา */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 px-2">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">
                ประวัติผลงาน (รายละเอียดบิล)
              </h3>
            </div>

            {/* ช่อง Input ค้นหา */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาเลขบิล หรือ โต๊ะ..."
                className="pl-9 bg-card/50 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // รีเซ็ตกลับไปหน้า 1 เสมอเวลาพิมพ์ค้นหาใหม่
                }}
              />
            </div>
          </div>

          <div className="border rounded-2xl bg-card/60 backdrop-blur-sm overflow-hidden shadow-lg flex flex-col">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[140px]">วันที่-เวลา</TableHead>
                  <TableHead className="w-[180px]">เลขที่บิล / โต๊ะ</TableHead>
                  <TableHead>รายการที่สั่งทั้งหมดในบิล</TableHead>
                  <TableHead className="text-right w-[160px]">
                    ยอดชำระเงิน (฿)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* ✅ เปลี่ยนจากการ map `orders` ตรงๆ มาใช้ `currentOrders` ที่ตัดมาแล้ว 10 อัน */}
                {currentOrders && currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <TableRow
                      key={order.orderNumber}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* วันที่ */}
                      <TableCell className="text-muted-foreground text-sm align-top pt-5">
                        {new Date(order.createdAt).toLocaleString("th-TH", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>

                      {/* เลขบิลและโต๊ะ */}
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

                      {/* รายการเมนูทั้งหมด */}
                      <TableCell className="pt-4 pb-4">
                        <ul className="space-y-2">
                          {order.menus.map((menu) => (
                            <li
                              key={menu.id}
                              className={`text-sm flex justify-between items-center px-3 py-2 rounded-lg border ${
                                menu.isMC
                                  ? "bg-primary/10 border-primary/20 shadow-sm"
                                  : "bg-muted/20 border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={
                                    menu.isMC
                                      ? "font-semibold text-primary"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {menu.menuName}
                                </span>
                                <span className="text-xs text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded-md">
                                  x{menu.quantity}
                                </span>
                              </div>
                              <span
                                className={`text-xs font-medium ${menu.isMC ? "text-primary" : "text-muted-foreground"}`}
                              >
                                ฿{menu.price_sum.toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </TableCell>

                      {/* ยอดรวม และ การจ่ายเงิน */}
                      <TableCell className="text-right align-top pt-5 pr-6">
                        <div className="text-lg font-bold text-foreground">
                          {order.totalAmount.toLocaleString()}
                        </div>
                        {order.discount > 0 && (
                          <div className="text-xs text-red-500 mt-1.5 font-medium flex items-center justify-end gap-1">
                            ส่วนลด: -{order.discount.toLocaleString()}
                          </div>
                        )}
                        {order.status === "PAID" && (
                          <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-muted-foreground bg-muted/40 inline-flex ml-auto px-2 py-1 rounded-md">
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
                        <p>
                          {searchTerm
                            ? "ไม่พบข้อมูลที่ค้นหา"
                            : "ยังไม่มีประวัติผลงานการรับโต๊ะ"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* ✅ แถบควบคุมการแบ่งหน้า (Pagination Footer) */}
            {filteredOrders.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  แสดง {startIndex + 1} ถึง{" "}
                  {Math.min(startIndex + itemsPerPage, filteredOrders.length)}{" "}
                  จาก {filteredOrders.length} รายการ
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> ก่อนหน้า
                  </Button>
                  <span className="text-sm font-medium mx-2">
                    หน้า {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    ถัดไป <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Note */}
      <p className="text-center text-xs text-muted-foreground/50 mt-12 mb-4">
        ข้อมูลนี้เป็นข้อมูลส่วนบุคคลของระบบ POSX
        หากต้องการแก้ไขกรุณาติดต่อผู้ดูแลระบบ
      </p>
    </div>
  );
}
