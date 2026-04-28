"use client";

import { PositionContextType, PositionState } from "@/lib/type";
import { createContext, useContext, useState, ReactNode } from "react";

// สร้าง Context
const PositionContext = createContext<PositionContextType | undefined>(
  undefined,
);

// สร้าง Provider ไว้คลุม Layout
export const PositionProvider = ({ children }: { children: ReactNode }) => {
  const [position, setPositionState] = useState<PositionState>({
    positionId: null,
    positionName: null,
  });

  const setPosition = (id: number | null, name: string | null) => {
    setPositionState({ positionId: id, positionName: name });
  };

  const clearPosition = () => {
    setPositionState({ positionId: null, positionName: null });
  };

  return (
    <PositionContext.Provider
      value={{ ...position, setPosition, clearPosition }}
    >
      {children}
    </PositionContext.Provider>
  );
};

// สร้าง Hook ไว้เรียกใช้งานง่ายๆ
export const usePosition = () => {
  const context = useContext(PositionContext);
  if (!context) {
    throw new Error("usePosition ต้องถูกเรียกใช้ภายใต้ PositionProvider");
  }
  return context;
};
