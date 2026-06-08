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
    organizationName: null,
    img: null,
  });

  const setUser = (
    empId: number | null,
    empName: string | null,
    posId: number | null,
    posName: string | null,
    orgName: string | null,
    imgStr: string | null,
  ) => {
    setUserState({
      employeeId: empId,
      employeeName: empName,
      positionId: posId,
      positionName: posName,
      organizationName: orgName,
      img: imgStr,
    });
  };

  const clearUser = () => {
    setUserState({
      employeeId: null,
      employeeName: null,
      positionId: null,
      positionName: null,
      organizationName: null,
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
    return {
      employeeId: null,
      employeeName: "ลูกค้า",
      positionId: null,
      positionName: null,
      organizationName: null,
      img: null,
      setUser: () => {},
      clearUser: () => {},
    };
  }
  return context;
};
