"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const VALID_USERS = new Set(["bhushan.dks@gmail.com", "lalit.dks@gmail.com"]);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const authString = window.localStorage.getItem("dks-erp-auth");

    if (!authString) {
      router.replace("/dashboard/login/v2");
      return;
    }

    try {
      const payload = JSON.parse(authString);
      if (!payload?.email || payload?.loggedIn !== true || !VALID_USERS.has(payload.email)) {
        throw new Error("unauthorized");
      }
      setReady(true);
    } catch {
      window.localStorage.removeItem("dks-erp-auth");
      router.replace("/dashboard/login/v2");
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="rounded-2xl border border-border/50 bg-muted/70 px-6 py-8 shadow-lg">
          <p className="text-center text-sm font-medium">Checking DKS ERP access…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
