import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { MenuSchema } from "@/lib/formValidationSchemas";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Brain, Loader2, Settings, Utensils } from "lucide-react"; // เพิ่ม Utensils icon
import { MenuItemCardProps } from "@/lib/type";
import Image from "next/image";

const MenuPOSItemCard = ({
  item,
  relatedData,
  stateSheet,
  handelDetail,
  handleGenerateImage,
  isLoading,
}: MenuItemCardProps) => {
  //กดดู detail
  const handleDetailCat = (itemMenu: MenuSchema) => {
    stateSheet(true);
    handelDetail(itemMenu);
  };

  const statusStyles: { [key: string]: string } = {
    READY_TO_SELL:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    STOP_TO_SELL:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    OUT_OF_MENU:
      "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  };

  const statusTexts: { [key: string]: string } = {
    READY_TO_SELL: "พร้อมขาย",
    STOP_TO_SELL: "งดขาย",
    OUT_OF_MENU: "หมด",
  };

  return (
    <Card
      className={`group overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-150 cursor-pointer 
                  active:scale-[0.98] active:bg-muted relative flex flex-col hover:border-primary/50 hover:shadow-md ${
                    isLoading ? "opacity-50 pointer-events-none" : ""
                  }`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-2xl">
          <Loader2 className="animate-spin text-white h-8 w-8" />
        </div>
      )}

      {/* 🟢 ปรับโครงสร้างส่วนหัวการ์ดและกรอบรูปใหม่ */}
      <CardHeader className="p-4 pb-0 relative z-20">
        {/* Dropdown Menu - ดีไซน์ให้ดูกลมกลืนและลอยตัว */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 h-8 w-8 z-30 bg-background/70 backdrop-blur-sm hover:bg-background rounded-full border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuItem
              onClick={() => handleGenerateImage(item)}
              className="cursor-pointer"
            >
              <Brain className="mr-2 h-4 w-4 text-purple-500" />
              <span>AI IMAGE GENERATOR</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="aspect-square w-full relative overflow-hidden rounded-xl border bg-muted/50 flex items-center justify-center shadow-inner group">
          {item.img ? (
            <Image
              src={item.img}
              alt={item.menuName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (

            <div className="relative flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground/60 rounded-xl overflow-hidden">
              <Utensils
                className="absolute h-1/2 w-1/2 opacity-10"
                strokeWidth={1}
              />
              <span className="font-black text-4xl relative z-10 drop-shadow-sm">
                {item.menuName.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          {/* subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </CardHeader>

      <CardContent className="px-5 py-4 text-center flex-grow flex flex-col justify-between">
        <div>
          <CardTitle className="text-sm font-semibold leading-tight text-center line-clamp-2 min-h-[2.5rem] flex items-center justify-center text-zinc-900 dark:text-zinc-100">
            {item.menuName}
          </CardTitle>

          {item.price_sale && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 font-bold">
              <span className="text-base">{item.price_sale.toFixed(2)}</span>{" "}
              <span className="text-xs font-medium text-muted-foreground">
                {relatedData.unitprices.find(
                  (unit: { id: number; label: string }) =>
                    unit.id === item.unitPriceId,
                )?.label || "บาท"}
              </span>{" "}
              <span className="text-muted-foreground/50 font-light">|</span>{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {relatedData.categories.find(
                  (category: { id: number; categoryName: string }) =>
                    category.id === item.categoryMenuId,
                )?.categoryName || "ทั่วไป"}
              </span>
            </p>
          )}
        </div>

        {item.status && (
          <div className="mt-3.5 flex justify-center">
            <Badge
              className={`font-bold text-xs px-2.5 py-0.5 rounded-full ${statusStyles[item.status] || ""}`}
              variant="secondary"
            >
              {statusTexts[item.status] || item.status}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          variant="outline" // เปลี่ยนเป็น outline เพื่อให้ดูไม่หนักเกินไป
          className="w-full flex items-center gap-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleDetailCat(item);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-plus h-4 w-4"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          รายละเอียด
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MenuPOSItemCard;
