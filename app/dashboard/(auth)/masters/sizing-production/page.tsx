"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SizingProductionRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/masters/open-stock");
  }, [router]);

  return null;
}
