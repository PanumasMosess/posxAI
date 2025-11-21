import {  ProductPageProps } from "@/lib/type";
import HTMLFlipBook from "react-pageflip";

const MenuOrderBook = ({ product, handelOpendetail }: ProductPageProps) => {
  return (
    <HTMLFlipBook
      width={370}
      height={500}
      flippingTime={1000}
      maxShadowOpacity={0.5}
      drawShadow={true}
      showCover={true}
      size="fixed"
      {...({} as any)}
    >
      <div className="cardPage">Page 1</div>
      
    </HTMLFlipBook>
  );
};

export default MenuOrderBook;
