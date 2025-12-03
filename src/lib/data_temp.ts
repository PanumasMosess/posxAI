import {
  Computer,
  Home,
  ScrollText,
  Settings,
  Table,
  Wallet,
  Warehouse,
} from "lucide-react";

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
    title: "การชำระเงิน",
    url: "#",
    icon: Wallet,
    subItems: [
      {
        title: "ชำระเงิน",
        url: "/payments",
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
  {
    title: "ประวัติ",
    url: "#",
    icon: ScrollText,
    subItems: [
      {
        title: "ประวัติออเดอร์",
        url: "/history/order",
      },
      // {
      //   title: "สูตรและตั้งค่าสินค้าในคลัง",
      //   url: "/stocks/stock_fomular",
      // },
    ],
  },
];

const settingsMenu = {
  title: "ตั้งค่า",
  icon: Settings,
  subItems: [{ title: "จัดการโต๊ะ", url: "/settings/tables", icon: Table }],
};

const statusColor = (status: string) => {
  switch (status) {
    case "NEW":
      // สีฟ้า
      return "border-blue-500/50 shadow-blue-500/10 hover:border-blue-500";

    case "PREPARING":
      // สีเหลืองอำพัน (แก้จากเดิมที่เป็น Orange ให้ตรงกับปุ่ม)
      return "border-amber-500/50 shadow-amber-500/10 hover:border-amber-500";

    case "COOKING":
      // สีส้ม
      return "border-orange-500/50 shadow-orange-500/10 hover:border-orange-500";

    // case "READY":
    //   // สีเขียว
    //   return "border-emerald-500/50 shadow-emerald-500/10 hover:border-emerald-500";

    case "COMPLETED":
      // สีเทา Slate (แก้จาก Zinc ให้ตรงกับปุ่ม)
      return "border-slate-500/50 shadow-slate-500/10 hover:border-slate-500 opacity-75";

    case "CANCELLED":
      // สีแดง
      return "border-red-500/50 shadow-red-500/10 hover:border-red-500";

    default:
      return "border-zinc-200 dark:border-zinc-800";
  }
};

const getButtonActionColor = (currentStatus: string) => {
  switch (currentStatus) {
    case "NEW":
      // สีฟ้า
      return "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:border-blue-300";

    case "PREPARING":
      // สีเหลืองอำพัน
      return "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-300";

    case "COOKING":
      // สีส้ม
      return "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-200 border-transparent";

    // case "READY":
    //   // สีเขียว (Solid เพราะเป็นปุ่มสำคัญสุด)
    //   return "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-200 border-transparent";

    case "COMPLETED":
      // สีเทา Slate
      return "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:border-slate-300";

    case "CANCELLED":
      // สีแดง
      return "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300";

    default:
      return "bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100";
  }
};

const getNextStepConfig = (currentStatus: string) => {
  switch (currentStatus) {
    case "NEW":
      return {
        nextStatus: "PREPARING",
        label: "เริ่มเตรียมวัตถุดิบ",
      };

    case "PREPARING":
      return {
        nextStatus: "COOKING",
        label: "เริ่มปรุงอาหาร",
      };

    case "COOKING":
       return {
        nextStatus: "COMPLETED",
        label: "เสิร์ฟเรียบร้อย",
      };
      // return {
      //   nextStatus: "READY",
      //   label: "ปรุงเสร็จ / พร้อมเสิร์ฟ",
      // };

    // case "READY":
    //   return {
    //     nextStatus: "COMPLETED",
    //     label: "เสิร์ฟเรียบร้อย",
    //   };

    case "COMPLETED":
      return { nextStatus: null, label: "เสร็จสิ้น" };
    case "CANCELLED":
      return { nextStatus: null, label: "ยกเลิกแล้ว" };
    default:
      return {
        nextStatus: null,
        label: "เสร็จสิ้น",
      };
  }
};

const getStatusBadgeConfig = (status: string) => {
  switch (status) {
    case "NEW":
      return {
        label: "ใหม่",
        color:
          "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
      };
    case "PREPARING":
      return {
        label: "เตรียมของ",
        color:
          "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
      };
    case "COOKING":
      return {
        label: "กำลังปรุง",
        color:
          "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
      };
    // case "READY":
    //   return {
    //     label: "รอเสิร์ฟ",
    //     color:
    //       "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    //   };
    case "COMPLETED":
      return {
        label: "เสร็จสิ้น",
        color:
          "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
      };
    case "CANCELLED":
      return {
        label: "ยกเลิก",
        color:
          "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
      };
    default:
      return {
        label: status,
        color: "bg-gray-100 text-gray-700 border-gray-200",
      };
  }
};

const tableStatuses = [
  { label: "ว่าง (Available)", value: "AVAILABLE", color: "bg-green-500" },
  { label: "ไม่ว่าง (Occupied)", value: "OCCUPIED", color: "bg-red-500" },
  { label: "จองแล้ว (Reserved)", value: "RESERVED", color: "bg-yellow-500" },
  { label: "รอทำความสะอาด (Dirty)", value: "DIRTY", color: "bg-gray-500" },
  {
    label: "รอจอง (Wait Booking)",
    value: "WAIT_BOOKING",
    color: "bg-blue-500",
  },
];

export default {
  menuList,
  settingsMenu,
  tableStatuses,
  statusColor,
  getButtonActionColor,
  getNextStepConfig,
  getStatusBadgeConfig,
};
