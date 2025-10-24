import { Computer, Home, Warehouse } from "lucide-react";

const menuList = [
  {
    title: "หน้าหลัก",
    url: "/home",
    icon: Home,
  },
  {
    title: "เมนู (POS)",
    url: "#",
    icon: Computer,
    subItems: [
      {
        title: "เมนู (POS)",
        url: "/menu/pos",
      },
      // {
      //   title: "เมนู (Kiosk)",
      //   url: "/menu/kiosk",
      // },
    ],
  },
  {
    title: "คลังสินค้า",
    url: "#",
    icon: Warehouse,
    subItems: [
      {
        title: "สินค้าทั้งหมด",
        url: "/stocks",
      },
      {
        title: "สูตรและตั้งค่าสินค้าในคลัง",
        url: "/stocks/stock_fomular",
      },
    ],
  },
];

// ข้อมูลตัวอย่างสำหรับเมนู
const menuItems = [
  {
    name: "Super Delicious Pizza",
    price: 15,
    image:
      "https://imgcp.aacdn.jp/img-a/1440/auto/global-aaj-front/article/2019/01/5c35764ceeb39_5c35764136a54_283103980.jpg",
  },
  {
    name: "Super Delicious Chicken",
    price: 12,
    image:
      "https://imgcp.aacdn.jp/img-a/1440/auto/global-aaj-front/article/2019/01/5c35764ceeb39_5c35764136a54_283103980.jpg",
  },
  {
    name: "Super Delicious Burger",
    price: 10,
    image:
      "https://imgcp.aacdn.jp/img-a/1440/auto/global-aaj-front/article/2019/01/5c35764ceeb39_5c35764136a54_283103980.jpg",
  },
  {
    name: "Super Delicious Chips",
    price: 5,
    image:
      "https://imgcp.aacdn.jp/img-a/1440/auto/global-aaj-front/article/2019/01/5c35764ceeb39_5c35764136a54_283103980.jpg",
  },
  {
    name: "Super Delicious Chips2",
    price: 5,
    image:
      "https://imgcp.aacdn.jp/img-a/1440/auto/global-aaj-front/article/2019/01/5c35764ceeb39_5c35764136a54_283103980.jpg",
  },
  {
    name: "Super Delicious Chips3",
    price: 5,
    image:
      "https://imgcp.aacdn.jp/img-a/1440/auto/global-aaj-front/article/2019/01/5c35764ceeb39_5c35764136a54_283103980.jpg",
  },
  // ... add more items
];

export default { menuList, menuItems };
