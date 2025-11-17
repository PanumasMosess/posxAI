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
}

export interface FormularPayload {
  items: {
    pcs_update: number;
    status: string;
    stockId: number;
    menuId: number;
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
  };
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
    }[];
  };
}

export interface StockPageClientProps {
  initialItems: any[];
  relatedData: {
    categories: { id: number; categoryName: string }[];
    suppliers: { id: number; supplierName: string }[];
  };
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
    }[];
  };
  cartCount: number;
  menuItems: { id: number; menuName: string; img: string }[];
  onUpdateQuantity: (
    cartId: number,
    menuId: number,
    newQuantity: number,
    priceSum: number
  ) => void;
  onRemoveItem: (cartId: number, menuId: number) => void;
}

export type CartItem = {
  id: number;
  menuId: number;
  tableId: number;
  quantity: number;
  price_sum: any;
  price_pre_unit: any;
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
  menuItems: { id: number; menuName: string; img: string }[];
  carts: CartItem[];
  onUpdateQuantity: (
    cartId: number,
    menuId: number,
    newQuantity: number,
    priceSum: number
  ) => void;
  onRemoveItem: (cartId: number, menuId: number) => void;
}
