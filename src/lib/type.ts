import { Dispatch, SetStateAction } from "react";
import { MenuSchema } from "./formValidationSchemas";

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
    categories: { id: number; categoryName: string }[];
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
    priceSum: number
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
    priceSum: number
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
  }[];
  orderitems: {
    id: number;
    quantity: number;
    menu: {
      menuName: string;
      price_sale: number;
      img: string | null;
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
  }[];

  modifiers?: {
    id: number;
    modifierItem: {
      name: string;
    };
  }[];
};

export interface KitchecTicketProps {
  initialItems: KitchenTicketItem;
  onStatusChange: (id: number | number[], status: string) => void;
  isGrouped?: boolean;
  printerName?: string | null;
  id_user: number;
  organizationId: number;
}

export type HistoryOrder = {
  id: number;
  quantity: number;
  price_sum: number;
  price_pre_unit: number;
  createdAt: Date;
  status: string;
  menu: {
    menuName: string;
    img: string | null;
    unitPrice: {
      label: string;
    };
  };
  table: {
    tableName: string;
  };
};

export interface HistoryOrderProps {
  initialItems: HistoryOrder[];
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
  creator: {
    username: string;
  };
  runningRef: {
    runningCode: string;
    order: {
      id: number;
      quantity: number;
      price_sum: number;
      price_pre_unit: number;
      status: string;
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

export type SettingPositions = {
  id: number;
  position_name: string;
  status: string | null;
  creator: {
    id: number;
    name: string;
    surname: string;
  };
  organizationId: number | null;
};
