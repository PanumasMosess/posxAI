import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useState } from "react";
import { OrderCartProps } from "@/lib/type";
import { Badge } from "../ui/badge";

const MenuOrderCart = ({
  carts,
  cartCount,
  menuItems,
  onUpdateQuantity,
  onRemoveItem,
}: OrderCartProps) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getMenuDetails = (menuId: number) => {
    return menuItems.find((item) => item.id === menuId);
  };

  return (
    <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-6 w-6" />
          <span className="sr-only">Open Cart</span>
          {cartCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs"
            >
              {cartCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[400px] top-4 translate-y-0
            data-[state=open]:animate-in data-[state=closed]:animate-out 
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
            data-[state=closed]:slide-out-to-top-16 
            data-[state=open]:slide-in-from-top-16"
      >
        <DialogHeader>
          <DialogTitle>ตะกร้าสินค้า</DialogTitle>
          <DialogDescription>โปรดตรวจสอบรายการอาหารของคุณ</DialogDescription>
        </DialogHeader>
        {cartCount === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">ตะกร้าไม่มีสินค้า</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="py-4 space-y-4 pr-6">
              {carts.map((cartItem) => {
                const menuItem = getMenuDetails(cartItem.menuId);
                return (
                  <div key={cartItem.id} className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 rounded-md">
                      <AvatarImage
                        src={menuItem?.img || "/placeholder.png"}
                        alt={menuItem?.menuName}
                      />
                      <AvatarFallback>
                        {menuItem?.menuName.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{menuItem?.menuName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            if (cartItem.quantity - 1 <= 0) {
                              onRemoveItem(cartItem.id, cartItem.menuId);
                            } else {
                              onUpdateQuantity(
                                cartItem.id,
                                cartItem.menuId,
                                cartItem.quantity - 1,
                                (cartItem.quantity - 1) *
                                  cartItem.price_pre_unit
                              );
                            }
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">
                          {cartItem.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            onUpdateQuantity(
                              cartItem.id,
                              cartItem.menuId,
                              cartItem.quantity + 1,
                              (cartItem.quantity + 1) * cartItem.price_pre_unit
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="font-semibold">
                      {cartItem.price_sum?.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
        <DialogFooter>
          <Button type="submit">ยืนยันรายการอาหาร</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuOrderCart;
