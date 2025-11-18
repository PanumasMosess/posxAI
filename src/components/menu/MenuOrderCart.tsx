"use client";

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
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"; 
import { ScrollArea } from "../ui/scroll-area"; 
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

  const totalPrice = carts.reduce(
    (sum, item) => sum + (item.price_sum || 0),
    0
  );

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
          <DialogTitle className="text-2xl font-bold">ตะกร้าสินค้า</DialogTitle>
          <DialogDescription>
            {cartCount > 0
              ? `คุณมี ${cartCount} รายการ`
              : "โปรดเพิ่มรายการอาหาร"}
          </DialogDescription>
        </DialogHeader>
        {cartCount === 0 ? (
          <div className="py-20 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground mt-4">
              ตะกร้าของคุณว่างเปล่า
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[50vh] -mx-6">
            <div className="px-6 py-4 space-y-5">
              {carts.map((cartItem) => {
                const menuItem = getMenuDetails(cartItem.menuId);    
                console.log(menuItem);
                           
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
                      <p className="font-semibold leading-tight">
                        {menuItem?.menuName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @ {cartItem.price_pre_unit?.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
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
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-base font-medium w-8 text-center">
                          {cartItem.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() =>
                            onUpdateQuantity(
                              cartItem.id,
                              cartItem.menuId,
                              cartItem.quantity + 1,
                              (cartItem.quantity + 1) * cartItem.price_pre_unit
                            )
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="font-semibold text-lg ml-auto">
                      {cartItem.price_sum?.toLocaleString()}  
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
        <DialogFooter className="p-6 border-t flex-col">
          {cartCount > 0 && (
            <div className="w-full space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>ยอดรวม</span>
                <span>{totalPrice.toLocaleString()} {menuItems[0]?.unitPrice.label}</span>
              </div>
              <Button type="submit" className="w-full h-12 text-lg">
                ยืนยันรายการอาหาร
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuOrderCart;
