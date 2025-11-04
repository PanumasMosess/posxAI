import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Dispatch, SetStateAction } from "react";
import { MenuSchema } from "@/lib/formValidationSchemas";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Brain, Loader2, Settings } from "lucide-react";

interface MenuItemCardProps {
  item: MenuSchema;
  relatedData: any;
  stateSheet: Dispatch<SetStateAction<boolean>>;
  handelDetail: (item: MenuSchema) => void;
  handleGenerateImage: (item: MenuSchema) => void;
  isLoading: boolean;
}
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
      "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
    STOP_TO_SELL:
      "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100",
    OUT_OF_MENU: "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100",
  };

  const statusTexts: { [key: string]: string } = {
    READY_TO_SELL: "พร้อมขาย",
    STOP_TO_SELL: "งดขาย",
    OUT_OF_MENU: "หมด",
  };

  return (
    <Card
      className={`group overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-150 cursor-pointer 
                  active:border-[2px] active:border-[#f77112eb] active:ring-[2px] active:ring-[#f77112eb] active:bg-muted relative ${
                    isLoading ? "opacity-50 pointer-events-none" : ""
                  }`}
      // onClick={() => {
      //   handleDetailCat(item);
      // }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-xl">
          <Loader2 className="animate-spin text-white h-8 w-8" />
        </div>
      )}
      <CardHeader className=" flex flex-col items-center justify-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 z-20"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleGenerateImage(item)}>
              <Brain className="mr-2 h-4 w-4" />
              AI IMAGE GENERATOR
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Avatar className="h-55 w-55 border-2 border-primary">
          <AvatarImage src={item.img || "/default-image-url.png"} />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </CardHeader>

      <CardContent className="px-4 pb-2 text-center flex-grow flex flex-col justify-end">
        <CardTitle className="text-sm font-semibold leading-tight text-center">
          {item.menuName}
        </CardTitle>
        {item.price_sale && (
          <p className="text-sm text-muted-foreground mt-1">
            {item.price_sale.toFixed(2)} /{" "}
            {
              relatedData.categories.find(
                (category: { id: number; categoryName: string }) =>
                  category.id === item.categoryMenuId
              )?.categoryName
            }
          </p>
        )}

        {item.status && (
          <div className="mt-2 flex justify-center">
            <Badge
              className={`font-semibold ${statusStyles[item.status] || ""}`}
            >
              {statusTexts[item.status] || item.status}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full flex items-center gap-2"
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
