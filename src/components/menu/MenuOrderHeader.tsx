import { useState } from "react";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const navLinks = [
  { href: "/shop-all", label: "สินค้าทั้งหมด" },
  { href: "/phone", label: "โทรศัพท์" },
  { href: "/audio", label: "อุปกรณ์เสียง" },
  { href: "/watch", label: "นาฬิกา" },
  { href: "/accessories", label: "อุปกรณ์เสริม" },
  { href: "/cmf", label: "CMF" },
];

const footerLinks = [
  { href: "/account", label: "ACCOUNT" },
  { href: "/support", label: "บริการช่วยเหลือ" },
];
const MenuOrderHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-zinc-950 mt-4 mr-2 ml-2">
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
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="font-dotmatrix text-xl tracking-widest">
              POSX
            </Link>
          </div>

          <Button variant="ghost" size="icon">
            <ShoppingBag className="h-6 w-6" />
            <span className="sr-only">Open Cart</span>
          </Button>
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
            <ShoppingBag className="h-6 w-6" />
            <span className="sr-only">Open Cart</span>
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8">
          <nav className="flex flex-col gap-8  text-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xl font-medium tracking-wide hover:text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <DialogFooter className="p-8 border-t">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuOrderHeader;
