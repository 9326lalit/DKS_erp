"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, ShieldCheck, Factory, Building2, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTenantStore } from "@/lib/store/use-tenant-store";

export default function Page() {
  const router = useRouter();
  const { tenants, login, loginSuperAdmin } = useTenantStore();
  const [email, setEmail] = useState("bhushan.dks@gmail.com");
  const [password, setPassword] = useState("password123");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (res.success) {
      toast.success(`Logged in to ${res.tenantName}!`);
      if (res.isSuperAdmin) {
        router.push("/dashboard/super-admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      toast.error("Invalid credentials.");
    }
  };

  const handleQuickLogin = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword("password123");
    const res = login(targetEmail, "password123");
    if (res.success) {
      toast.success(`Active Tenant: ${res.tenantName}`);
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex pb-8 lg:min-h-screen lg:pb-0 bg-slate-950 text-white">
      <div className="hidden w-1/2 relative lg:block bg-gradient-to-tr from-slate-900 to-emerald-950 p-12 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1.5 px-3 py-1">
            <ShieldCheck className="h-4 w-4" /> Multi-Tenant Textile ERP
          </Badge>
        </div>
        
        <div className="space-y-4 max-w-lg z-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Integrated Weaving, Sizing & Financial Control
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Multi-Tenant architecture supporting independent weaving clusters across Ichalkaranji, Surat, Bhiwandi, and Coimbatore.
          </p>
        </div>

        <Image
          width={1000}
          height={1000}
          src={`/images/extra/image4.jpg`}
          alt="Textile Weaving Mill"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          unoptimized
        />
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2 p-6">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Sign in to your Mill</h2>
            <p className="text-slate-400 mt-1.5 text-sm">Select your tenant organization or enter credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
                  placeholder="bhushan.dks@gmail.com"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/dashboard/forgot-password" className="text-xs text-emerald-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-10 cursor-pointer">
              Sign In
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/dashboard/register/v1" className="underline text-slate-300">
              Register New Tenant Mill
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
