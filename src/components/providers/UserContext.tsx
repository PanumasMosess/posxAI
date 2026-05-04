"use client";

import { UserContextType, UserState } from "@/lib/type";
import { createContext, useContext, useState, ReactNode } from "react";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserState>({
    employeeId: null,
    employeeName: null,
    positionId: null,
    positionName: null,
    img: null,
  });

  const setUser = (
    empId: number | null,
    empName: string | null,
    posId: number | null,
    posName: string | null,
    imgStr: string | null,
  ) => {
    setUserState({
      employeeId: empId,
      employeeName: empName,
      positionId: posId,
      positionName: posName,
      img: imgStr,
    });
  };

  const clearUser = () => {
    setUserState({
      employeeId: null,
      employeeName: null,
      positionId: null,
      positionName: null,
      img: null,
    });
  };

  return (
    <UserContext.Provider value={{ ...user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser ต้องถูกเรียกใช้ภายใต้ UserProvider");
  }
  return context;
};
