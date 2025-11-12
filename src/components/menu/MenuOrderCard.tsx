"use client";

import { ProductCardProps } from "@/lib/type";
import Image from "next/image";
import { useParallax } from "react-scroll-parallax";

export const MenuOrderCard = ({ product, handelOpendetail }: ProductCardProps) => {
  const easeInQuad = useParallax<HTMLDivElement>({
    scale: [0.8, 1, "easeInQuad"],
  });
  return (
    <div onClick={() => {
       handelOpendetail(product.id);
      }} className="group block">
      <div className="w-full h-full  rounded-2xl overflow-hidden p-1.5 transition-all duration-300 hover:shadow-xl flex flex-col">
        <div
          className="relative h-60 md:h-95 w-full flex items-center justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 easeInQuad"
          ref={easeInQuad.ref}
        >
          <Image
            src={product.img || "/default-image-url.png"}
            alt={product.menuName}
            fill
            className="transition-transform duration-300 group-hover:scale-110 "
          />
        </div>

        <div className="mt-1 text-center flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-black dark:text-white">
              {product.menuName}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {product.description}
            </p>
          </div>

          {product.price_sale && (
            <p className="text-sm font-semibold mt-1">
              {product.price_sale.toLocaleString()} {product.unitPrice.label.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
