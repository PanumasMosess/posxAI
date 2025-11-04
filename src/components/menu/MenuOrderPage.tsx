"use client";

import { MenuPOSPageClientProps } from "@/lib/type";
import MenuOrderHeader from "./MenuOrderHeader";
import { MenuOrderCard } from "./MenuOrderCard";

const products = [
  {
    id: "1",
    name: "Phone",
    subtext: "(3)",
    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "2",
    name: "Phone",
    subtext: "(3)",
    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "3",
    name: "Headphone",
    subtext: "(1)",
    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "4",
    name: "Headphone",
    subtext: "(1)",
    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "5",
    name: "Ear",
    subtext: "(20)",
    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "6",
    name: "Phone",
    subtext: "(3)",
    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "7",
    name: "Phone",
    subtext: "(3)",
    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "8",
    name: "Headphone",
    subtext: "(1)",
    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "9",
    name: "Headphone",
    subtext: "(1)",
    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "10",
    name: "Ear",
    subtext: "(20)",
    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "11",
    name: "Phone",
    subtext: "(3)",
    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "12",
    name: "Phone",
    subtext: "(3)",
    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "13",
    name: "Headphone",
    subtext: "(1)",

    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "14",
    name: "Headphone",
    subtext: "(1)",

    price: 5790,
    image: "/default-image-url.png",
  },
  {
    id: "15",
    name: "Ear",
    subtext: "(20)",
    price: 5790,
    image: "/default-image-url.png",
  },
];


const MenuOrderPage = ({
  initialItems,
  relatedData,
}: MenuPOSPageClientProps) => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <MenuOrderHeader />
      <main className="container mx-auto px-2 pt-15 pb-10 relative z-10">
        <h2 className="text-5xl text-center mb-10 tracking-wide">
          สินค้าทั้งหมด
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 md:gap-6 ">
          {products.map((product, index) => (  
              <MenuOrderCard product={product} key={product.id}/>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MenuOrderPage;
