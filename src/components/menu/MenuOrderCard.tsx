"use client";

import Image from "next/image";
import Link from "next/link";
import { useParallax } from "react-scroll-parallax";

interface Product {
  id: string;
  name: string;
  subtext: string;
  price?: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

export const MenuOrderCard = ({ product }: ProductCardProps) => {
  const easeInQuad = useParallax<HTMLDivElement>({
    scale: [1, 2.0, "easeInQuad"],
  });
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="w-full  dark:bg-black rounded-2xl overflow-hidden p-3 transition-all duration-300 hover:shadow-xl ">
        <div
          className="relative h-40 md:h-80  flex items-center justify-center easeInQuad"
          ref={easeInQuad.ref}
        >
          <Image
            src={product.image}
            alt={product.name}
            width={140}
            height={140}
            className="object-contain transition-transform duration-300 group-hover:scale-110 "
          />
        </div>

        <div className="mt-1 text-center">
          <h3 className="text-lg font-medium text-black dark:text-white">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {product.subtext}
          </p>
          {product.price && (
            <p className="text-sm font-semibold mt-1">
              THB {product.price.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};
