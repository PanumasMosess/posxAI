import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MenuSchema, MenuSchema_ } from "@/lib/formValidationSchemas";
import { FormFieldImageUpload } from "./FormFieldImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { createMenu, updateMenu } from "@/lib/actions/actionMenu";
import {
  deleteFileS3,
  menu_handleImageUpload,
} from "@/lib/actions/actionIndex";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Checkbox } from "../ui/checkbox";

const MenuFormPOS = ({
  type,
  relatedData,
  currentUserId,
  organizationId,
  data,
  stateSheet,
  stateForm,
}: {
  type: "create" | "update";
  relatedData?: any;
  currentUserId: number;
  organizationId: number;
  data?: any;
  stateSheet: Dispatch<SetStateAction<boolean>>;
  stateForm: boolean;
}) => {
  const formAddMenu = useForm<MenuSchema>({
    resolver: zodResolver(MenuSchema_),
    defaultValues: {
      menuName: "",
      unit: "",
      description: "",
      price_sale: 0,
      price_cost: 0,
      package_hours: 0, // ✅ ค่าเริ่มต้น
      price_package: 0, // ✅ ค่าเริ่มต้น
      status: "READY_TO_SELL",
      img: undefined,
      createdById: currentUserId,
      organizationId: organizationId,
      categoryMenuId: 0,
      unitPriceId: 0,
      mcEmployeeId: null,
    },
  });

  const router = useRouter();

  const {
    categories = [],
    unitprices = [],
    employees = [],
  } = relatedData || {};

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [OldImg, setOldImg] = useState("");
  const [state, formAction] = useActionState(
    type === "create" ? createMenu : updateMenu,
    { success: false, error: false },
  );

  // ✅ State เปิด/ปิด กล่องแพ็กเกจเหมา
  const [isPackage, setIsPackage] = useState(false);

  const watchCategoryId = formAddMenu.watch("categoryMenuId");
  const selectedCategory = categories.find(
    (c: any) => c.id === Number(watchCategoryId),
  );
  const isEntertainer = selectedCategory?.categoryName === "Entertainer";

  const onSubmit = async (dataForm: MenuSchema) => {
    try {
      setIsSubmitting(true);
      const finalData = { ...dataForm, createdById: currentUserId };

      if (!isEntertainer) {
        finalData.mcEmployeeId = null;
      }

      // ✅ ถ้าไม่ได้ติ๊กเปิดแพ็กเกจเหมา ให้เคลียร์ค่าเป็น 0 / null
      if (!isPackage) {
        finalData.package_hours = null;
        finalData.price_package = null;
      }

      if (type === "update" && OldImg && dataForm.img) {
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
        const urlObject = new URL(OldImg);
        const pathname = urlObject.pathname;
        const key = pathname.substring(`/${bucketName}/`.length);
        await deleteFileS3(key);
      }

      if (dataForm.img && dataForm.img instanceof File) {
        const imageUrl = await menu_handleImageUpload(dataForm.img);
        finalData.img = imageUrl;
      } else {
        finalData.img = OldImg;
      }

      startTransition(async () => {
        formAction(finalData);
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (state.success) {
      toast.success(`สินค้าถูก ${type === "create" ? "เพิ่ม" : "แก้ไข"}!`);
      setIsSubmitting(false);
      formAddMenu.reset();
      router.refresh();
      stateSheet(false);
    }
  }, [state, stateSheet, formAddMenu, type, router, setIsSubmitting]);

  useEffect(() => {
    if (stateForm) {
      formAddMenu.reset();
      formAddMenu.setValue("createdById", currentUserId);
      setIsPackage(false);
    }

    if (type === "update" && data) {
      formAddMenu.setValue("menuName", data.menuName);
      formAddMenu.setValue("price_sale", data.price_sale);
      formAddMenu.setValue("price_cost", data.price_cost);
      formAddMenu.setValue("unit", data.unit);
      formAddMenu.setValue("description", data.description || "");
      formAddMenu.setValue("status", data.status);
      formAddMenu.setValue("categoryMenuId", data.categoryMenuId);
      formAddMenu.setValue("unitPriceId", data.unitPriceId);
      formAddMenu.setValue("mcEmployeeId", data.mcEmployeeId || null);
      formAddMenu.setValue("id", data.id);

      // ✅ ดึงค่า package มาแสดง ถ้ามีค่าแปลว่าเคยตั้งราคาเหมาไว้
      if (data.package_hours > 0 || data.price_package > 0) {
        setIsPackage(true);
        formAddMenu.setValue("package_hours", data.package_hours || 0);
        formAddMenu.setValue("price_package", data.price_package || 0);
      }

      const existingGroupIds =
        data.modifiers?.map((item: any) => item.modifierGroupId) || [];
      formAddMenu.setValue("modifierGroupIds", existingGroupIds);

      setOldImg(data.img || "");
    }

    if (type === "create" && categories?.length > 0) {
      const firstCategoryId = categories[0].id;
      formAddMenu.setValue("categoryMenuId", firstCategoryId);

      if (unitprices?.length > 0) {
        const firstunitpricesId = unitprices[0].id;
        formAddMenu.setValue("unitPriceId", firstunitpricesId);
      }
    }
  }, [type, data, stateForm, categories, unitprices, formAddMenu, setOldImg]);

  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <SheetHeader>
        <SheetTitle className="mb-2">
          {type === "create" ? "เพิ่มเมนู" : "แก้ไขเมนู"}
        </SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        <Form {...formAddMenu}>
          <form
            id="addMenuForm"
            className="space-y-6 px-6 py-4"
            onSubmit={formAddMenu.handleSubmit(onSubmit, (errors) => {
              console.log("❌ Zod Errors:", errors);
              toast.error("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
            })}
          >
            {/* ... Form ID (Hidden) ... */}
            {data && (
              <FormField
                control={formAddMenu.control}
                name="id"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* หมวดหมู่ */}
            <FormField
              control={formAddMenu.control}
              name="categoryMenuId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    หมวดหมู่สินค้า <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(Number(val));
                      const cat = categories.find(
                        (c: any) => c.id === Number(val),
                      );
                      if (cat?.categoryName !== "Entertainer") {
                        formAddMenu.setValue("mcEmployeeId", null);
                      }
                    }}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full bg-blue-50/50 border-blue-200">
                        <SelectValue placeholder="เลือกหมวดหมู่ก่อน" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ถ้าเป็น Entertainer ให้เลือกพนักงาน */}
            {isEntertainer && (
              <div className="p-4 border rounded-xl bg-muted/30 dark:bg-muted/10 space-y-4">
                <FormField
                  control={formAddMenu.control}
                  name="mcEmployeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        เลือกพนักงาน (Entertainer)
                      </FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(Number(val));
                          const emp = employees.find(
                            (e: any) => e.id === Number(val),
                          );
                          if (emp) {
                            formAddMenu.setValue(
                              "menuName",
                              `${emp.name} ${emp.surname || ""}`.trim(),
                            );
                            formAddMenu.setValue("unit", "ชม.");
                            if (emp.img) {
                              setOldImg(emp.img);
                              formAddMenu.setValue("img", undefined);
                            }
                          }
                        }}
                        value={field.value ? String(field.value) : ""}
                      >
                        <FormControl>
                          {/* ✅ เปลี่ยนสีขอบและพื้นหลังของ Select ให้เข้า Theme */}
                          <SelectTrigger className="w-full bg-background border-input">
                            <SelectValue placeholder="เลือกพนักงาน..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees.map((emp: any) => (
                            <SelectItem key={emp.id} value={String(emp.id)}>
                              {emp.name} {emp.surname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={formAddMenu.control}
              name="menuName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ชื่อรายการ{" "}
                    {isEntertainer && "(ดึงมาจากชื่อพนักงานอัตโนมัติ)"}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ ราคาต่อชั่วโมง */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={formAddMenu.control}
                name="price_sale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      ราคาขาย{" "}
                      <span className="text-primary font-bold">
                        {isEntertainer && "(ต่อ 1 ชม.)"}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAddMenu.control}
                name="price_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ราคาต้นทุน</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ✅ ส่วนเพิ่มราคาเหมา (ปรับสีให้เข้ากับ Theme หลัก) */}
            {isEntertainer && (
              <div className="p-4 border rounded-xl bg-muted/30 dark:bg-muted/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="isPackage"
                    checked={isPackage}
                    onCheckedChange={(checked) => setIsPackage(!!checked)}
                  />
                  <FormLabel
                    htmlFor="isPackage"
                    className="cursor-pointer font-medium text-foreground"
                  >
                    เพิ่มตัวเลือก "ราคาเหมา" ให้พนักงานคนนี้
                  </FormLabel>
                </div>

                {isPackage && (
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-2 border-t border-border/50 animate-in fade-in zoom-in duration-300">
                    <FormField
                      control={formAddMenu.control}
                      name="package_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">
                            จำนวน ชม. (ที่ให้เหมา)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              // ✅ เพิ่มบรรทัดนี้: แปลง null เป็นช่องว่าง ""
                              value={field.value ?? ""}
                              // ✅ แปลงค่ากลับเป็นตัวเลขตอนพิมพ์
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                )
                              }
                              className="bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formAddMenu.control}
                      name="price_package"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">
                            ราคาเหมา (บาท)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              // ✅ เพิ่มบรรทัดนี้: แปลง null เป็นช่องว่าง ""
                              value={field.value ?? ""}
                              // ✅ แปลงค่ากลับเป็นตัวเลขตอนพิมพ์
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                )
                              }
                              className="bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={formAddMenu.control}
                name="unitPriceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หน่วยราคา</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="เลือกหน่วยราคา" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitprices.map((unit: any) => (
                          <SelectItem key={unit.id} value={String(unit.id)}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAddMenu.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หน่วยสินค้า</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={isEntertainer ? "ชม." : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={formAddMenu.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายละเอียดสินค้า</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {data && (
              <FormField
                control={formAddMenu.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>สถานะสินค้า</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="เลือกสถานะเมนู" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="READY_TO_SELL">พร้อมขาย</SelectItem>
                        <SelectItem value="STOP_TO_SELL">งดขาย</SelectItem>
                        <SelectItem value="OUT_OF_MENU">หมด</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Modifiers และ รูปภาพ เหมือนเดิม... */}
            <div className="space-y-4 border rounded-md p-4 bg-muted/20">
              <FormLabel className="text-base">
                ตัวเลือกเพิ่มเติม (Modifiers)
              </FormLabel>
              <div className="grid grid-cols-2 gap-4">
                {relatedData.modifierGroups?.map((group: any) => (
                  <FormField
                    key={group.id}
                    control={formAddMenu.control}
                    name="modifierGroupIds"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(group.id)}
                            onCheckedChange={(checked) => {
                              const currentValues = field.value || [];
                              if (checked) {
                                field.onChange([...currentValues, group.id]);
                              } else {
                                field.onChange(
                                  currentValues.filter(
                                    (val) => val !== group.id,
                                  ),
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {group.name}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <FormFieldImageUpload
                control={formAddMenu.control}
                name="img"
                label={
                  isEntertainer
                    ? "รูปโปรไฟล์พนักงาน (สามารถอัปโหลดทับได้)"
                    : "รูปภาพสินค้า"
                }
              />
              {OldImg && !formAddMenu.watch("img") && (
                <p className="text-xs text-muted-foreground">
                  * กำลังใช้รูปภาพเดิม หรือรูปที่ดึงมาจากข้อมูลพนักงาน
                </p>
              )}
            </div>

            <Button
              type="submit"
              form="addMenuForm"
              className="w-full h-12 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "กำลังบันทึก..."
                : type === "create"
                  ? "ยืนยันการเพิ่มเมนู"
                  : "แก้ไขข้อมูลเมนู"}
            </Button>
          </form>
        </Form>
      </div>
      <SheetFooter className="p-6"></SheetFooter>
    </SheetContent>
  );
};

export default MenuFormPOS;
