import { useState } from "react";
import Link from "next/link";
import { Menu, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { MenuOrderHeaderProps } from "@/lib/type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import MenuOrderCart from "./MenuOrderCart";

const MenuOrderHeader = ({
  carts,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  relatedData,
  cartCount,
  menuItems,
  onRemoveItem,
  onUpdateQuantity,
}: MenuOrderHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <header className="sticky top-0 z-50  mt-4  px-2">
        <div
          className="container mx-auto px-4 h-13 flex items-center justify-between
          bg-white dark:bg-zinc-900 
          rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 
          max-w-[500px]"
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </DialogTrigger>
          <div className="flex-1 px-0.5">
            <div className="relative">
              <Input
                type="search"
                placeholder="ค้นหาเมนู..."
                className="pl-8 h-12 rounded-xl  bg-gray-100 dark:bg-zinc-800 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <MenuOrderCart
            carts={carts}
            cartCount={cartCount}
            menuItems={menuItems}
            onRemoveItem={onRemoveItem}
            onUpdateQuantity={onUpdateQuantity}
          />
        </div>
      </header>
      <DialogContent
        showCloseButton={false}
        className="max-w-[400px] mx-auto p-0 flex flex-col border-none top-4 translate-y-0
            rounded-2xl overflow-hidden mr-2 ml-2
            data-[state=open]:animate-in data-[state=closed]:animate-out 
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
            data-[state=closed]:slide-out-to-top-16 
            data-[state=open]:slide-in-from-top-16"
      >
        <DialogHeader className="relative flex flex-row items-center justify-between h-13 px-6 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="sr-only">
            <DialogTitle>Navigation Menu</DialogTitle>
            <DialogDescription>
              Main navigation links for the website.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-6 w-6" />
            </Button>
          </DialogClose>
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="font-dotmatrix text-xl tracking-widest">
              POSX
            </Link>
          </div>

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
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-3">
          <Select
            onValueChange={(value) => {
              setFilterCategory(value);
              setIsMenuOpen(false);
            }}
          >
            <SelectTrigger className="w-full text-xl h-12">
              <SelectValue placeholder="เลือกหมวดหมู่..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="text-md">
                ทั้งหมด
              </SelectItem>
              {relatedData?.categories.map((item: any) => (
                <SelectItem
                  key={item.id}
                  value={item.categoryName}
                  className="text-md"
                >
                  {item.categoryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* <DialogFooter className="p-8 border-t">
          <nav className="flex items-center justify-center gap-4 text-xs font-medium">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

export default MenuOrderHeader;
