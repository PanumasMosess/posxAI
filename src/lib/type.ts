import { Dispatch, SetStateAction } from "react";
import { MenuSchema } from "./formValidationSchemas";
import { ColumnDef } from "@tanstack/react-table";

export type StocksFormularRunning = {
  id: number;
  menuName: string;
  productName: string;
  pcs_update: number;
  menuId: number;
  stockId: number;
};

export type CurrentState = { success: boolean; error: boolean };

export type BillItem = {
  productName: string;
  description: string;
  unit: string;
  quantity: number;
  price: number;
  img?: string;
};

export interface CreateStockPayload {
  items: BillItem[];
  creator_id: number;
  category_id: number;
  supplier_id: number;
  organizationId: number;
}

export interface FormularPayload {
  items: {
    pcs_update: number;
    status: string;
    stockId: number;
    menuId: number;
    organizationId: number;
  }[];
}

export interface StockPageFormularProps {
  initialItems: any[];
  relatedData: {
    categories: {
      id: number;
      categoryName: string;
      requiresKitchen: boolean;
    }[];
    suppliers: { id: number; supplierName: string }[];
    menu: { id: number; menuName: string }[];
    formular: {
      id: number;
      stockId: number;
      menuId: number;
      menu: {
        menuName: string;
      };
      stock: {
        productName: string;
      };
    }[];
    modifiergroup: {
      id: number;
      name: string;
      minSelect: number;
      maxSelect: number;
    }[];
    mofifieritemgroup: {
      id: number;
      name: string;
      price: number;
      groupId: number;
      organizationId: number | null;
      group?: {
        id: number;
        name: string;
      } | null;
    }[];
  };
  id_user: number;
  organizationId: number;
}

type MenuFormular = {
  id: number;
  menuName: string;
  img: string;
  description: string;
};

export interface MenuScrollerProps {
  menuItems: MenuFormular[];
  selectedMenu: string | null;
  onSelectMenu: (menuId: string | null) => void;
}

export interface MenuPOSPageClientProps {
  initialItems: any[];
  relatedData: {
    categories: {
      id: number;
      categoryName: string;
      requiresKitchen: boolean;
    }[];
    tabledatas: { id: number; tableName: string }[];
    cartdatas: {
      id: number;
      menuId: number;
      tableId: number;
      quantity: number;
      price_sum: number;
      price_pre_unit: number;
      organizationId: number | null;
      note: string | null;
      modifiers: {
        id: number;
        name: string;
        price: number;
        modifierItemId: number;
      }[];
    }[];
    orders?: {
      id: number;
      quantity: number;
      price_sum: number;
      price_pre_unit: number;
      orderDetail: any | null;
      status: string;
      createdAt: Date | string;
      updatedAt: Date | string;
      menuId: number;
      tableId: number;
      organizationId: number | null;
      order_running_code: string | null;
      menu: {
        id: number;
        menuName: string;
        price_sale: number;
        price_cost: number;
        unit: string;
        img: string | null;
        description: string | null;
        status: string;
        createdAt: Date | string;
        updatedAt: Date | string;
        createdById: number;
        categoryMenuId: number;
        unitPriceId: number;
        organizationId: number | null;
      };
      table: {
        id: number;
        status: string;
        tableName: string;
        tableBookingBy: string | null;
        cashType: string | null;
        createdAt: Date | string;
        updatedAt: Date | string;
        closeById: number | null;
        organizationId: number | null;
      };
    }[];
  };
  id_user: number;
  organizationId: number;
}

export interface StockPageClientProps {
  initialItems: any[];
  relatedData: {
    categories: { id: number; categoryName: string }[];
    suppliers: { id: number; supplierName: string }[];
  };
  id_user: number;
  organizationId: number;
}

export interface MenuItemCardProps {
  item: MenuSchema;
  relatedData: any;
  stateSheet: Dispatch<SetStateAction<boolean>>;
  handelDetail: (item: MenuSchema) => void;
  handleGenerateImage: (item: MenuSchema) => void;
  isLoading: boolean;
}

interface Product {
  id: string;
  menuName: string;
  description: string;
  price_sale?: number;
  img: string;
  unitPrice: any;
}

export interface ProductCardProps {
  product: Product;
  handelOpendetail: (item: any) => void;
}

export interface ProductPageProps {
  product: Product[];
  handelOpendetail: (item: any) => void;
}

export interface MenuOrderHeaderProps {
  carts: CartItem[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  filterCategory: string;
  setFilterCategory: Dispatch<SetStateAction<string>>;
  relatedData: {
    categories: { id: number; categoryName: string }[];
    tabledatas: { id: number; tableName: string }[];
    cartdatas: {
      id: number;
      menuId: number;
      tableId: number;
      quantity: number;
      price_sum: any;
      price_pre_unit: any;
      organizationId: number | null;
    }[];
  };
  cartCount: number;
  menuItems: {
    id: number;
    menuName: string;
    img: string;
    unitPrice: {
      label: string;
    };
  }[];
  onUpdateQuantity: (
    cartId: number,
    menuId: number,
    newQuantity: number,
    priceSum: number,
  ) => void;
  onRemoveItem: (cartId: number, menuId: number) => void;
  onConfirmOrder: () => void;
}

export type CartItem = {
  id: number;
  menuId: number;
  tableId: number;
  quantity: number;
  price_sum: any;
  price_pre_unit: any;
  organizationId: number | null;
  modifiers: any[];
  note: string;
};

export type CartDetailItem = {
  menuId: number;
  tableId: number;
  menuName: string;
  priceUnit: string;
  quantity: number;
  totalPrice: number;
};

export interface MenuOrderDetailProps {
  open: boolean;
  stateDialog: Dispatch<SetStateAction<boolean>>;
  menuDetail: any;
  tableNumber: number;
  dataTable: {
    id: number;
    tableName: string;
  }[];
  onAddToCart: (cartItem: CartItem) => void;
}

export interface OrderHandlerProps {
  setTableNumber: (tableId: number) => void;
}

export interface OrderCartProps {
  cartCount: number;
  menuItems: {
    id: number;
    menuName: string;
    img: string;
    unitPrice: {
      label: string;
    };
  }[];
  carts: CartItem[];
  onUpdateQuantity: (
    cartId: number,
    menuId: number,
    newQuantity: number,
    priceSum: number,
  ) => void;
  onRemoveItem: (cartId: number, menuId: number) => void;
  onConfirmOrder: () => void;
}

export interface CartItemPayload {
  id: number;
  menuId: number;
  tableId: number;
  quantity: number;
  price_sum: number;
  price_pre_unit: number;
  organizationId: number | null;
  note: string | null;
  employeeId?: string | null;
  modifiers?: {
    modifierItemId: number;
    name: string;
    price: number;
  }[];
}

export type KitchenOrder = {
  id: number;
  quantity: number;
  price_sum: number;
  price_pre_unit: number;
  createdAt: Date;
  status: string;
  order_running_code: string | null;
  note: string | null;
  table: {
    id: number;
    tableName: string;
  };
  totalQuantity?: number;
  orderIds?: number[];
  orders?: {
    id: number;
    tableName: string;
    quantity: number;
    status: string;
    order_running_code: string | null;
    createdAt: Date | string;
  }[];
  orderitems: {
    id: number;
    quantity: number;
    menu: {
      menuName: string;
      price_sale: number;
      img: string | null;
      price_package?: number | null;
      package_hours?: number | null;
      unitPrice: {
        label: string;
      };
    };

    selectedModifiers: {
      id: number;
      modifierItem: {
        name: string;
      };
    }[];
  }[];
};

export interface KitchecOrderList {
  initialItems: KitchenOrder[];
  id_user: number;
  organizationId: number;
}

export type KitchenTicketItem = {
  menu: {
    id: number;
    menuName: string;
    img: string | null;
    unitPrice: {
      label: string;
    };
  };
  status: string;

  totalQuantity: number;
  orderIds: number[];
  orders: {
    id: number;
    tableName: string;
    quantity: number;
    status: string;
    order_running_code: string | null;
    createdAt: Date | string;
  }[];

  modifiers?: {
    id: number;
    modifierItem: {
      name: string;
    };
  }[];
  createdAt: Date | string;
};

export interface KitchecTicketProps {
  initialItems: KitchenTicketItem;
  onStatusChange: (id: number | number[], status: string) => void;
  isGrouped?: boolean;
  printerName?: string | null;
  id_user: number;
  organizationId: number;
}

export interface HistoryOrder {
  id: string | number;
  order_running_code: string;
  price_sum: number;
  quantity: number;
  menusList?: { name: string; image: string | null; prName?: string | null }[];
  status: string;
  table?: {
    tableName: string;
  } | null;
  updatedAt: Date;
  employeeName?: string;
  paymentInfo?: {
    shift: {
      id: number;
      shiftSequence?: number;
    } | null;
    creator: { name: string } | null;
  } | null;
}

export interface HistoryOrderProps {
  initialItems: any[];
  id_user: number;
  organizationId: number;
}

export type SettingTable = {
  id: number;
  status: string;
  tableName: string;
  creator: {
    name: string;
    surname: string;
  };
  tableBookingBy: string | null;
  cashType: string | null;
  updatedAt: Date;
};

export interface SettingTableProps {
  initialItems: SettingTable[];
  userId: number;
  organizationId: number;
}
export interface ReceiptProps {
  orderId: string;
  table: string;
  date: string;
  items: any[];
  total: number;
  currency: string;
  cashReceived?: number;
  change?: number;
  paymentMethod: string;
}

export type HistoryPayment = {
  id: number;
  cashReceived: number;
  change: number;
  totalAmount: number;
  paymentMethod: string;
  createdAt: Date;
  shift: {
    id: number;
    shiftSequence?: number;
    createdAt?: Date;
  } | null;
  creator: {
    name: string;
    surname: string;
  } | null;
  runningRef: {
    runningCode: string;
    order: {
      id: number;
      quantity: number;
      price_sum: number;
      price_pre_unit: number;
      status: string;
      note?: string | null;
      menu: {
        id: number;
        menuName: string;
        img: string | null;
        price_sale: number;
        unit: string;
        unitPrice: {
          label: string;
        };
      };
    }[];
  } | null;
  table: {
    tableName: string;
  } | null;
};

export interface HistoryPaymentProps {
  initialItems: HistoryPayment[];
  userId: number;
  organizationId: number;
}

export type PropsUrl = {
  searchParams: Promise<{
    table?: string;
    organizationId?: string;
  }>;
};

export interface PrintTicketData {
  menuName: string;
  totalQuantity: number | undefined;
  orders: any[];
  printerName: string;
  modifiers?: string;
  createdAt: Date | string;
}

export type Printer = {
  id: number;
  printerName: string | null;
  urlCertificate: string | null;
  urlSignature: string | null;
  stationUse: string | null;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    name: string;
    surname: string;
  };
};

export type Station = {
  id: number;
  stationName: string | null;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    name: string;
    surname: string;
  };
};

export interface PrinterProps {
  initialItems: Printer[];
  reationData: Station[];
  id_user: number;
  organizationId: number;
}

export interface OrderHistoryList {
  id: number;
  quantity: number;
  price_sum: number;
  price_pre_unit: number;
  status: string;
  createdAt: Date | string;
  tableId: number;
  order_running_code: string | null;
  menu: {
    id: number;
    menuName: string;
    img: string | null;
    unitPrice?: {
      label: string;
    };
  };
  table: {
    tableName: string;
  };
}

export interface MenuOrderHistorySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  relatedData: {
    categories: { id: number; categoryName: string }[];
    tabledatas: { id: number; tableName: string }[];
    cartdatas: {
      id: number;
      menuId: number;
      tableId: number;
      quantity: number;
      price_sum: number;
      price_pre_unit: number;
      organizationId: number | null;
    }[];
    orders?: {
      id: number;
      quantity: number;
      price_sum: number;
      price_pre_unit: number;
      orderDetail: any | null;
      status: string;
      createdAt: Date | string;
      updatedAt: Date | string;
      menuId: number;
      tableId: number;
      organizationId: number | null;
      order_running_code: string | null;
      menu: {
        id: number;
        menuName: string;
        price_sale: number;
        price_cost: number;
        unit: string;
        img: string | null;
        description: string | null;
        status: string;
        createdAt: Date | string;
        updatedAt: Date | string;
        createdById: number;
        categoryMenuId: number;
        unitPriceId: number;
        organizationId: number | null;
        unitPrice?: {
          label: string;
        };
      };
      table: {
        id: number;
        status: string;
        tableName: string;
        tableBookingBy: string | null;
        cashType: string | null;
        createdAt: Date | string;
        updatedAt: Date | string;
        closeById: number | null;
        organizationId: number | null;
      };
    }[];
  };
  tableNumber: number;
}

export type SettingEmployee = {
  id: number;
  username: string;
  name: string;
  surname: string;
  email: string | null;
  img: string | null;
  status: string;
  position_id: number | null;
  login_fail: number;
  created_by: string | null;
  createdAt: Date;
  updatedAt: Date;
  birthday: Date | null;
  id_google: string | null;
  organizationId: number | null;
};

export interface SettingEmployeeProps {
  initialItems: SettingEmployee[];
  userId: number;
  organizationId: number;
  relatedData: {
    positions: {
      id: number;
      position_name: string;
      status: string | null;
      creator: {
        id: number;
        name: string;
        surname: string;
      };
      organizationId: number | null;
    }[];
  };
}

export type PositionType = {
  id: number;
  position_name: string;
};

export type SettingPositions = {
  id: number;
  position_name: string;
  pin: string | null;
  status: string | null;
  creator: {
    id: number;
    name: string;
    surname: string;
  };
  organizationId: number | null;
};

export type Menu = {
  id: number;
  menuName: string;
  price_sale: number;
  price_cost: number;
  unit: string;
  img: string | null;
  description: string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdById: number | null;
  categoryMenuId: number | null;
  unitPriceId: number | null;
  organizationId: number | null;
};

export type OrderItem = {
  id: number;
  orderId: number;
  menuId: number;
  quantity: number;
  price: number;
  organizationId: number | null;
  menu: Menu;
  note?: string | null;
  price_package?: number | null;
  package_hours?: number | null;
};

export type Order = {
  id: number;
  order_running_code: string | null;
  status: string;
  tableId: number;
  menuId: number;
  organizationId: number | null;
  quantity: number;
  price_sum: number;
  price_pre_unit: number;
  orderDetail: string | null;
  note?: string | null;
  price_package?: number | null;
  package_hours?: number | null;

  createdAt: Date | string;
  updatedAt: Date | string;

  orderitems: OrderItem[];
};

export type StatusTable = {
  id: number;
  tableName: string;
  status: string;
  organizationId: number | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  posX: number;
  posY: number;
  width: number;
  height: number;
  rotation: number;
  floorPlanLocked: boolean;
  shape: string;
  seatCount?: number;

  order: Order[];
  creator?: {
    id: number;
    name: string;
  };
};

export interface StatusTableProps {
  initialItems: StatusTable[];
  userId: number;
  organizationId: number | null;
  relatedData: {
    orderRunning: KitchenOrder[];
  };
}
export type TableItem = {
  id: number;
  tableName: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
};

export interface MoveTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: TableItem;
  allTables: TableItem[];
  onConfirm: (fromId: number, toId: number) => void;
}

export interface UserState {
  employeeId: number | null;
  employeeName: string | null;
  positionId: number | null;
  positionName: string | null;
  img: string | null;
}
export interface UserContextType extends UserState {
  setUser: (
    empId: number | null,
    empName: string | null,
    posId: number | null,
    posName: string | null,
    imgStr: string | null,
  ) => void;
  clearUser: () => void;
}

export interface PaymentMethodsPanelProps {
  paymentMethod: "QR" | "CASH" | "CARD" | "MEMBER";
  setPaymentMethod: (method: "QR" | "CASH" | "CARD" | "MEMBER") => void;
  qrType: "THAI" | "LAO";
  setQrType: (type: "THAI" | "LAO") => void;
  finalTotal: number;
  change: number;
  cashReceived: string;
  setCashReceived: (val: string) => void;
  discount: string;
  setDiscount: (val: string) => void;
  memberPhone: string;
  setMemberPhone: (val: string) => void;
  currency: string;
  handleNumpadClick: (val: string) => void;
  handleExactAmount: () => void;
  handleQuickAmount: (amt: number) => void;
  memberData: any;
  setMemberData: (data: any) => void;
  isLoadingMember: boolean;
  handleCheckMember: () => void;
}

export interface MemberTransactionProps {
  data: any[];
}

export type Permission = {
  id: number;
  permissionKey: string;
  permissionName: string;
  positions: {
    allowed: boolean;
  }[];
};

export type SettingPermissions = {
  id: number;
  permissionKey: string;
  permissionName: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  userId: number;
  organizationId: number;
}

export interface OrderMenu {
  id: number;
  menuName: string;
  quantity: number;
  price_sum: number;
  isMC: boolean;
}

export interface OrderData {
  orderNumber: string;
  tableName: string;
  totalAmount: number;
  discount: number;
  paymentMethod: string;
  status: string;
  createdAt: Date;
  menus: OrderMenu[];
}

export interface ProfileClientProps {
  profileData: any;
  positionData: any;
  orders?: OrderData[];
}

export interface CountdownTimerProps {
  startTime: string | Date;
  packageHours: number;
  quantity: number;
  unit: string;
}

export interface ProfilleMainProps {
  orders: any[];
  allEmployees?: { id: number | string; name: string; surname: string }[];
}

export interface SettingBackdropProps {
  initialItems: any[];
  organizationId: number;
}

export interface SettingFormBackdropProps {
  backdropId: number | null;
  organizationId: number;
  stateSheet: (open: boolean) => void;
  userId: number;
}

export interface BackdropItem {
  id: number;
  imageUrl: string;
  duration: number;
  title: string | null;
}

export interface TableGridProps {
  tables: StatusTable[];
  editMode: boolean;
}

export interface EditModeProps {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
}

export interface TableCardProps {
  table: StatusTable;
  containerWidth: number;
  onClick?: () => void;
}

export interface TableEditorProps {
  open: boolean;
  onClose: () => void;
  table: StatusTable | null;
  onSaved: (table: StatusTable) => void;
}

export interface TableDataListProps {
  columns: any;
  data: StatusTable[];
  userId: number;
  organizationId: number;
}

export interface OpenShiftModalProps {
  isOpen: boolean;
  organizationId: number;
  employeeId: number;
  employeeName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export interface CloseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftId: number | null;
  employeeId: number;
}

export interface ShoutoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: number;
}

export interface SalesSummaryProps {
  dailyData: any[];
  monthlyData: any[];
  yearlyData?: any[];
  todayTotal: number;
  yesterdayTotal: number;
  thisMonthTotal: number;
  lastMonthTotal: number;
  thisYearTotal?: number;
  lastYearTotal?: number;
  currencyLabel?: string;
}

export interface EmployeeStat {
  id: string;
  name: string;
  todaySales: number;
  monthSales: number;
  yearSales: number;
  totalSales: number;
  todayItems: number;
  monthItems: number;
  yearItems: number;
  totalItems: number;
}

export interface OrderCardProps {
  employee: EmployeeStat;
  currencyLabel: string;
  period: "daily" | "monthly" | "yearly";
}
