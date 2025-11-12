"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SearchHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl) {
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);
  return null;
}
