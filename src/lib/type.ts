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
  };
}
