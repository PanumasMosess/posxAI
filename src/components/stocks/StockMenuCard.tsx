import { MenuScrollerProps } from "@/lib/type";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";
import Image from "next/image";

const StockMenuCard = ({
  menuItems,
  selectedMenu,
  onSelectMenu,
}: MenuScrollerProps) => {
  return (
    <div className="w-full overflow-x-auto whitespace-nowrap pb-2">
      <div className="flex gap-4">
        {menuItems && menuItems.length > 0 ? (
          menuItems.map((menu) => (
            <Card
              key={menu.id}
              className={`flex-shrink-0 w-50 cursor-pointer transition-all ${
                selectedMenu === String(menu.id)
                  ? "border-primary ring-2 ring-primary"
                  : "border-border hover:bg-muted/50"
              }`}
              onClick={() => onSelectMenu(String(menu.id))}
            >
              <CardContent className="flex flex-col items-center justify-center p-4">
                {/* 2. เพิ่ม Image ที่นี่ */}
                <div className="relative h-24 w-24 mb-4">
                  <Image
                    src={menu.img || "/default-image-url.png"}
                    alt={menu.menuName}
                    fill
                    className="object-container rounded-lg"
                  />
                </div>
                <CardTitle className="font-semibold text-sm truncate text-center">
                  {menu.menuName}
                </CardTitle>
                <CardDescription className="text-xs text-center mt-1 truncate">
                  {menu.description || "-"}
                </CardDescription>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="flex-shrink-0 w-36 bg-muted opacity-50">
            <CardContent className="flex items-center justify-center h-full p-4">
              <span className="font-semibold text-sm text-muted-foreground">
                ไม่มีเมนู
              </span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StockMenuCard;
