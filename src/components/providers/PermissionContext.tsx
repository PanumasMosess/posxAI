"use client";

import { fetchPositionPermissions } from "@/lib/actions/actionPermission";
import { createContext, useContext, ReactNode, useState } from "react";

type PermissionContextType = {
  permissions: string[];
  hasPermission: (key: string) => boolean;
  loadPermissions: (positionId: number) => Promise<void>;
  clearPermissions: () => void;
};

const Context = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const [permissions, setPermissions] = useState<string[]>([]);

  const hasPermission = (key: string) => permissions.includes(key);

  const loadPermissions = async (positionId: number) => {
    const keys = await fetchPositionPermissions(positionId);
    setPermissions(keys);
  };

  const clearPermissions = () => {
    setPermissions([]);
  };

  return (
    <Context.Provider
      value={{ permissions, hasPermission, loadPermissions, clearPermissions }}
    >
      {children}
    </Context.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("usePermission must be used within a PermissionProvider");
  }
  return context;
};
