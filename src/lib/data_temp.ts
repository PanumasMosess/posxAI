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
      {
        title: "เมนู (Kiosk)",
        url: "/menu/kiosk",
      },
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
        title: "สูตรตัดสินค้า",
        url: "/stocks/stock_fomular",
      },
    ],
  },
];
export default menuList;
