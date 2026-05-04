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

  // ดึง employees มาจาก relatedData ด้วย
  const {
    categories = [],
    unitprices = [],
    employees = [],
  } = relatedData || {};

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [OldImg, setOldImg] = useState("");
  const [state, formAction] = useActionState(
    type === "create" ? createMenu : updateMenu,
    {
      success: false,
      error: false,
    },
  );

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

            {/* ✅ 1. ย้ายหมวดหมู่มาบนสุด เพื่อให้เลือกก่อน */}
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
                      // ถ้าเปลี่ยนหมวดหมู่ที่ไม่ใช่ Entertainer ให้ล้างค่า mcEmployeeId
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
                      {categories.map(
                        (cat: { id: number; categoryName: String }) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.categoryName}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ 2. ถ้าเป็น Entertainer ให้ดึง EmployeePin มาเลือก */}
            {isEntertainer && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 rounded-xl space-y-4">
                <FormField
                  control={formAddMenu.control}
                  name="mcEmployeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-700 dark:text-purple-400">
                        เลือกพนักงาน (Entertainer)
                      </FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(Number(val));

                          // 🟢 Auto-fill ชื่อและรูปภาพเมื่อเลือกพนักงาน
                          const emp = employees.find(
                            (e: any) => e.id === Number(val),
                          );
                          if (emp) {
                            // เซ็ตชื่อเมนูอัตโนมัติ
                            formAddMenu.setValue(
                              "menuName",
                              `${emp.name} ${emp.surname || ""}`.trim(),
                            );
                            formAddMenu.setValue("unit", "ชม."); // เดาว่าหน่วยเป็นชั่วโมง

                            // ดึงรูปมาเซ็ต
                            if (emp.img) {
                              setOldImg(emp.img);
                              formAddMenu.setValue("img", undefined); // เคลียร์ File object ทิ้ง
                            }
                          }
                        }}
                        value={field.value ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border-purple-200">
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

            {/* ฟิลด์อื่นๆ ปกติ */}
            <FormField
              control={formAddMenu.control}
              name="menuName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ชื่อรายการ {isEntertainer && "(ดึงมาจากชื่อพนักงาน)"}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={formAddMenu.control}
                name="price_sale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      ราคาขาย {isEntertainer && "(ต่อ 1 ชม.)"}
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
                        {unitprices.map(
                          (unit: { id: number; label: String }) => (
                            <SelectItem key={unit.id} value={String(unit.id)}>
                              {unit.label}
                            </SelectItem>
                          ),
                        )}
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
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={group.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
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
                                      (value) => value !== group.id,
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
                      );
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ✅ กล่องอัปโหลดรูปภาพ */}
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
              {/* ✅ โชว์รูปเดิมที่ดึงมาจาก employeePin */}
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
