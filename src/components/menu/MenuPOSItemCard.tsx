import Image from "next/image";
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

interface MenuItemCardProps {
  item: MenuSchema;
  relatedData: any;
  stateSheet: Dispatch<SetStateAction<boolean>>;
  handelDetail: (item: MenuSchema) => void;
}
const MenuPOSItemCard = ({
  item,
  relatedData,
  stateSheet,
  handelDetail,
}: MenuItemCardProps) => {
  const handleDetailCat = (itemMenu: MenuSchema) => {
    stateSheet(true);
    handelDetail(itemMenu);
  };

  return (
    <Card
      className="group overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-150 cursor-pointer 
                  active:border-[2px] active:border-[#f77112eb] active:ring-[2px] active:ring-[#f77112eb] active:bg-muted"
      onClick={() => {
        handleDetailCat(item);
      }}
    >
      <CardHeader className="p-4 relative h-60 flex items-center justify-center">
        <div className="relative w-60 h-60 rounded-full overflow-hidden border">
          <Image
            src={item.img}
            alt={item.menuName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
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
