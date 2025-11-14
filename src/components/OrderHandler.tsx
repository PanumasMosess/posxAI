"use client";
import { OrderHandlerProps } from "@/lib/type";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function OrderHandler({ setTableNumber }: OrderHandlerProps) {
  const searchParams = useSearchParams();
 useEffect(() => {
    const tableStr = searchParams.get("table"); 
    if (tableStr) {
      const tableNum = parseInt(tableStr);
      if (!isNaN(tableNum)) {
        setTableNumber(tableNum);
      }
    }
  }, [searchParams, setTableNumber]); 

  return null; 
}
