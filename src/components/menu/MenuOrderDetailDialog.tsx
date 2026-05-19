import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { CartItem, MenuOrderDetailProps } from "@/lib/type";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { Loader2, Minus, Plus, X, Table } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "react-toastify";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";

const MenuOrderDetailDialog = ({
  stateDialog,
  open,
  menuDetail,
  tableNumber,
  dataTable,
  onAddToCart,
}: MenuOrderDetailProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [tableNumberSelect, setTableNumberSelect] = useState(0);

  const [selections, setSelections] = useState<Record<number, number[]>>({});

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setSelections({});
      setTableNumberSelect(0);
    }
  }, [open, menuDetail]);

  const onClose = () => {
    stateDialog(false);
  };

  const onTableChange = (val: any) => {
    setTableNumberSelect(parseInt(val));
  };

  const handleSelect = (
    groupId: number,
    itemId: number,
    maxSelect: number,
    isRadio: boolean,
  ) => {
    setSelections((prev) => {
      const currentSelection = prev[groupId] || [];

      if (isRadio) {
        return { ...prev, [groupId]: [itemId] };
      } else {
        const isSelected = currentSelection.includes(itemId);

        if (isSelected) {
          return {
            ...prev,
            [groupId]: currentSelection.filter((id) => id !== itemId),
          };
        } else {
          if (currentSelection.length >= maxSelect) {
            toast.warning(`เลือกได้สูงสุด ${maxSelect} รายการ`);
            return prev;
          }
          return { ...prev, [groupId]: [...currentSelection, itemId] };
        }
      }
    });
  };

  // ✅ ดึงค่าสถานะว่าลูกค้ากดเลือกแบบ "เหมา" หรือไม่
  const isPackage = menuDetail?.isPackageSelected || false;

  // ✅ ถ้าระบุว่าเหมา ให้ใช้ราคาเหมา ถ้าไม่ใช่ ให้ใช้ราคาต่อชม. (price_sale)
  const basePrice = isPackage
    ? menuDetail?.price_package || 0
    : menuDetail?.price_sale || 0;

  const totalPrice = useMemo(() => {
    if (!menuDetail) return 0;
    let modifierPrice = 0;

    menuDetail.modifiers?.forEach((modRel: any) => {
      const group = modRel.modifierGroup;
      const selectedIds = selections[group.id] || [];

      selectedIds.forEach((selectedId: number) => {
        const item = group.items.find((i: any) => i.id === selectedId);
        if (item) modifierPrice += item.price;
      });
    });

    // ✅ นำราคาตั้งต้น (basePrice) มาบวกของเสริม แล้วคูณจำนวน
    return (basePrice + modifierPrice) * quantity;
  }, [menuDetail, selections, quantity, basePrice]);

  const isValid = useMemo(() => {
    if (!menuDetail?.modifiers) return true;

    return menuDetail.modifiers.every((modRel: any) => {
      const group = modRel.modifierGroup;
      const selectedCount = (selections[group.id] || []).length;
      return selectedCount >= group.minSelect;
    });
  }, [menuDetail, selections]);

  const handleAddToCartClick = () => {
    if (tableNumber == 0 && tableNumberSelect == 0) {
      toast.error(`กรุณาเลือกโต๊ะ!`, {
        position: "bottom-center",
        className: "responsive-toast",
      });
      return;
    }

    if (!isValid) {
      toast.warning(`กรุณาเลือกตัวเลือกให้ครบถ้วน`, {
        position: "bottom-center",
        className: "responsive-toast",
      });
      return;
    }

    if (!menuDetail) return;

    const selectedModifiers: any[] = [];
    menuDetail.modifiers?.forEach((modRel: any) => {
      const group = modRel.modifierGroup;
      const selectedIds = selections[group.id] || [];
      selectedIds.forEach((id: number) => {
        const item = group.items.find((i: any) => i.id === id);
        if (item) {
          selectedModifiers.push({
            modifierItemId: item.id,
            name: item.name,
            price: item.price,
          });
        }
      });
    });

    const cartItem: CartItem = {
      id: menuDetail.id,
      menuId: menuDetail.id,
      tableId: tableNumber !== 0 ? tableNumber : tableNumberSelect,
      price_pre_unit: basePrice,
      quantity: quantity,
      price_sum: totalPrice,
      organizationId: menuDetail.organizationId,
      modifiers: selectedModifiers,
      note: isPackage ? `(แพ็กเกจเหมา ${menuDetail.package_hours} ชม.)` : "",
    };
  
    onAddToCart(cartItem);
    onClose();
  };

  if (!menuDetail) return null;

  const isEntertainer = menuDetail?.category?.categoryName === "Entertainer";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-xl shadow-2xl bg-background text-foreground overflow-hidden md:max-w-md lg:max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-20 text-white bg-black/30 hover:bg-black/50 rounded-full"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="relative w-full h-48 sm:h-56 flex-shrink-0 bg-muted">
          <Image
            src={menuDetail?.img || "/placeholder.png"}
            alt={menuDetail?.menuName || "Menu Item"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 500px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <h3 className="text-2xl font-bold leading-tight shadow-sm flex items-center gap-2">
              {menuDetail?.menuName}
              {/* ✅ โชว์ป้ายกำกับว่านี่คือราคาเหมา */}
              {isPackage && (
                <span className="text-sm bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium shadow-md">
                  เหมา {menuDetail.package_hours} ชม.
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-200 line-clamp-1 opacity-90 mt-1">
              {menuDetail?.description}
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 bg-background">
          <div className="px-6 py-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {menuDetail.modifiers?.map((modRel: any) => {
                  const group = modRel.modifierGroup;
                  const isRadio = group.maxSelect === 1;

                  return (
                    <div key={group.id} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-base">
                          {group.name}
                          {group.minSelect > 0 && (
                            <span className="text-destructive text-sm ml-1">
                              *
                            </span>
                          )}
                        </h4>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {isRadio ? "เลือก 1" : `สูงสุด ${group.maxSelect}`}
                        </span>
                      </div>

                      {isRadio ? (
                        <RadioGroup
                          value={selections[group.id]?.[0]?.toString() || ""}
                          onValueChange={(val) =>
                            handleSelect(
                              group.id,
                              parseInt(val),
                              group.maxSelect,
                              true,
                            )
                          }
                          className="gap-3"
                        >
                          {group.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between space-x-2 border p-3 rounded-lg hover:bg-accent cursor-pointer"
                              onClick={() =>
                                handleSelect(
                                  group.id,
                                  item.id,
                                  group.maxSelect,
                                  true,
                                )
                              }
                            >
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem
                                  value={item.id.toString()}
                                  id={`r-${item.id}`}
                                />
                                <Label
                                  htmlFor={`r-${item.id}`}
                                  className="cursor-pointer"
                                >
                                  {item.name}
                                </Label>
                              </div>
                              {item.price > 0 && (
                                <span className="text-sm font-medium text-primary">
                                  +{item.price}
                                </span>
                              )}
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <div className="grid gap-3">
                          {group.items.map((item: any) => {
                            const isChecked = selections[group.id]?.includes(
                              item.id,
                            );
                            return (
                              <div
                                key={item.id}
                                className="flex items-center justify-between space-x-2 border p-3 rounded-lg hover:bg-accent cursor-pointer"
                                onClick={() =>
                                  handleSelect(
                                    group.id,
                                    item.id,
                                    group.maxSelect,
                                    false,
                                  )
                                }
                              >
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id={`c-${item.id}`}
                                    checked={isChecked}
                                    onCheckedChange={() =>
                                      handleSelect(
                                        group.id,
                                        item.id,
                                        group.maxSelect,
                                        false,
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`c-${item.id}`}
                                    className="cursor-pointer"
                                  >
                                    {item.name}
                                  </Label>
                                </div>
                                {item.price > 0 && (
                                  <span className="text-sm font-medium text-primary">
                                    +{item.price}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <Separator className="my-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 p-4 bg-background border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 safe-area-bottom">
          {/* ✅ แก้ที่ 1: เปลี่ยนมาใช้ justify-between เสมอ */}
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* ✅ แก้ที่ 2: เอาปีกกา {tableNumber == 0 &&} ออก เพื่อให้ช่องแสดงตลอดเวลา */}
            <Select
              // ✅ แก้ที่ 3: เพิ่ม value เพื่อให้ระบบจำและแสดงชื่อโต๊ะที่ถูกเลือกอยู่
              value={
                tableNumberSelect !== 0
                  ? String(tableNumberSelect)
                  : tableNumber !== 0
                    ? String(tableNumber)
                    : undefined
              }
              onValueChange={(value) =>
                onTableChange(value === "ALL" ? null : value)
              }
            >
              <SelectTrigger className="w-[140px] bg-background">
                <div className="flex items-center text-foreground">
                  <Table className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="เลือกโต๊ะ" />
                </div>
              </SelectTrigger>
              {/* ✅ แก้ที่ 4: เพิ่ม z-[70] เพื่อดันให้ Dropdown ลอยอยู่เหนือ Modal (ที่ลอยอยู่ z-[60]) */}
              <SelectContent className="z-[70]">
                {dataTable?.map((table) => (
                  <SelectItem key={table.id} value={String(table.id)}>
                    {table.tableName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-col items-center">
              {isEntertainer && (
                <span className="text-xs text-muted-foreground font-medium mb-1">
                  {isPackage ? "จำนวนแพ็กเกจ" : "ระบุจำนวนชั่วโมง"}
                </span>
              )}
              <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md bg-background shadow-sm hover:bg-background/90"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-bold min-w-[32px] text-center text-foreground flex items-center justify-center gap-1">
                  {quantity}
                  {isEntertainer && (
                    <span className="text-sm text-primary">
                      {isPackage ? "แพ็กเกจ" : "ชม."}
                    </span>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Button
            className={`w-full h-12 text-lg font-bold transition-all ${
              !isValid ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
            }`}
            onClick={handleAddToCartClick}
            disabled={!isValid}
          >
            {isEntertainer
              ? `${isPackage ? "รับงานเหมา" : "เลือก Entertainer"} - ${totalPrice.toLocaleString()}`
              : `เพิ่มลงตะกร้า - ${totalPrice.toLocaleString()}`}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuOrderDetailDialog;
