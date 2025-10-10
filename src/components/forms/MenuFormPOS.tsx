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
  handleImageUpload,
  menu_handleImageUpload,
} from "@/lib/actions/actionIndex";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const MenuFormPOS = ({
  type,
  relatedData,
  currentUserId,
  data,
  stateSheet,
  stateForm,
}: {
  type: "create" | "update";
  relatedData?: any;
  currentUserId: number;
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
      categoryMenuId: undefined,
    },
  });

  const router = useRouter();

  const { categories } = relatedData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [OldImg, setOldImg] = useState("");
  const [state, formAction] = useActionState(
    type === "create" ? createMenu : updateMenu,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = async (dataForm: MenuSchema) => {
    try {
      setIsSubmitting(true);
      const finalData = { ...dataForm };

      if (type === "update" && OldImg && dataForm.img) {
        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
        const urlObject = new URL(OldImg);
        const pathname = urlObject.pathname;
        const key = pathname.substring(`/${bucketName}/`.length);
        const status_del_old = await deleteFileS3(key);
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
    }

    // ทำงานเมื่อเป็นโหมดแก้ไขและมี data
    if (type === "update" && data) {
      formAddMenu.setValue("menuName", data.menuName);
      formAddMenu.setValue("price_sale", data.price_sale);
      formAddMenu.setValue("price_cost", data.price_cost);
      formAddMenu.setValue("unit", data.unit);
      formAddMenu.setValue("description", data.description || "");
      formAddMenu.setValue("status", data.status);
      formAddMenu.setValue("categoryMenuId", data.categoryMenuId);
      formAddMenu.setValue("id", data.id);
      setOldImg("");
      setOldImg(data.img);
    }

    if (type === "create" && categories?.length > 0) {
      const firstCategoryId = categories[0].id;
      formAddMenu.setValue("categoryMenuId", firstCategoryId);
    }
  }, [type, data, stateForm, categories, formAddMenu, setOldImg]);

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
            className="space-y-8 px-6 py-4"
            onSubmit={formAddMenu.handleSubmit(onSubmit)}
          >
            {data && (
              <>
                <FormField
                  control={formAddMenu.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={formAddMenu.control}
              name="menuName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อรายการ</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formAddMenu.control}
              name="price_sale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ราคาขาย</FormLabel>
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

            <FormField
              control={formAddMenu.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หน่วยสินค้า</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            <FormField
              control={formAddMenu.control}
              name="categoryMenuId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมวดหมู่</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกหมวดหมู่" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(
                        (cat: { id: number; categoryName: String }) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.categoryName}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
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
                    <FormLabel>หมวดหมู่</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="เลือกสถานะเมนู" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          key={"READY_TO_SELL"}
                          value={"READY_TO_SELL"}
                        >
                          พร้อมขาย
                        </SelectItem>
                        <SelectItem key={"STOP_TO_SELL"} value={"STOP_TO_SELL"}>
                          งดขาย
                        </SelectItem>
                        <SelectItem key={"OUT_OF_MENU"} value={"OUT_OF_MENU"}>
                          หมด
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormFieldImageUpload
              control={formAddMenu.control}
              name="img"
              label="รูปภาพสินค้า"
            />
            <Button
              type="submit"
              form="addMenuForm"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "กำลังบันทึก..."
                : type === "create"
                ? "ยืนยัน"
                : "แก้ไข"}
            </Button>
          </form>
        </Form>
      </div>
      <SheetFooter className="p-6"></SheetFooter>
    </SheetContent>
  );
};

export default MenuFormPOS;
