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
        title: "เมนู (สั่งอาหาร) *ตัวอย่าง",
        url: "/orders?table=0",
      },
       {
        title: "ครัว",
        url: "/kitchen",
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
        title: "สูตรและตั้งค่าสินค้าในคลัง",
        url: "/stocks/stock_fomular",
      },
    ],
  },
];


const statusColor = (status: string) => {
  switch (status) {
    case "NEW":
      return "border-blue-500/50 shadow-blue-500/10 hover:border-blue-500";
    case "COOKING":
      return "border-orange-500/50 shadow-orange-500/10 hover:border-orange-500";
    case "PREPARING":
      return "border-orange-500/50 shadow-orange-500/10 hover:border-orange-500";
    case "READY":
      return "border-emerald-500/50 shadow-emerald-500/10 hover:border-emerald-500";
    case "COMPLETED":
      return "border-zinc-500/50 shadow-zinc-500/10 hover:border-zinc-500 opacity-75";
    case "CANCELLED":
      return "border-red-500/50 shadow-red-500/10 hover:border-red-500";
    default:
      return "border-zinc-200 dark:border-zinc-800";
  }
};

const getButtonActionColor = (currentStatus: string) => {
 switch (currentStatus) {
    case "NEW":
      return "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:border-blue-300";
      
    case "PREPARING":
      return "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-300";
      
    case "COOKING":
      return "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 hover:border-orange-300";
      
    case "READY":
      return "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-200 border-transparent";
      
    default:
      return "bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100";
  }
};

export default { menuList, statusColor, getButtonActionColor };
