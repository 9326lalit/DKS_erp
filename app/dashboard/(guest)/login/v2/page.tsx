"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, CheckCircle2, ArrowRight, ShieldCheck, Factory, Layers, Sparkles, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTenantStore } from "@/lib/store/use-tenant-store";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Page() {
  const router = useRouter();
  const { tenants, login, loginSuperAdmin } = useTenantStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "owner@dhandaitextiles.com",
      password: "password123"
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    const res = login(data.email, data.password);
    if (res.success) {
      toast.success(`Logged in to ${res.tenantName || "Tenant Mill"}! Redirecting...`);
      if (res.isSuperAdmin) {
        router.push("/dashboard/super-admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      toast.error(res.error || "Invalid login credentials.");
    }
  };

  const handleQuickTenantLogin = (email: string, pass: string) => {
    setValue("email", email);
    setValue("password", pass);
    const res = login(email, pass);
    if (res.success) {
      toast.success(`1-Click Switch: Active Tenant set to ${res.tenantName}!`);
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 p-4 lg:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Form & Multi-Tenant Credentials */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-emerald-500/20 bg-slate-900/90 text-white shadow-2xl backdrop-blur-xl">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 gap-1.5 px-3 py-1 text-xs">
                  <ShieldCheck className="h-3.5 w-3.5" /> Multi-Tenant Enterprise ERP
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[11px]">v1.3.0 Ready</Badge>
              </div>
              <CardTitle className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100">
                Textile Weaving ERP Login
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                Sign in to access your mill's live loom monitoring, yarn inventory, & financial analytics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-300 font-medium">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="owner@dhandaitextiles.com"
                      className="bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                      {...register("email")}
                    />
                    {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-slate-300 font-medium">Password</Label>
                      <Link href="/dashboard/forgot-password" className="text-xs text-emerald-400 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                      {...register("password")}
                    />
                    {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
                  </div>
                </div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-11 font-semibold text-base shadow-lg shadow-emerald-950/50 cursor-pointer" disabled={isSubmitting}>
                  {isSubmitting ? "Authenticating..." : "Sign In to ERP Dashboard"}
                </Button>
              </form>

              {/* Multi-Tenant Quick Demo Login Cards */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    Role-Based Access Testing (1-Click Login)
                  </span>
                  <span className="text-[11px] text-slate-500">Password: password123</span>
                </div>

                {/* Global Super Admin 1-Click Button */}
                <button
                  type="button"
                  onClick={() => {
                    loginSuperAdmin();
                    toast.success("Logged in as Global Platform Super Admin!");
                    router.push("/dashboard/super-admin");
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent hover:border-amber-400 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                      <Crown className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
                        Global Super Admin Portal <Badge className="bg-amber-500 text-slate-950 text-[10px] font-extrabold">FULL SAAS ACCESS</Badge>
                      </span>
                      <span className="text-xs text-slate-400">superadmin@dks-erp.com • View & Manage All 4 Tenant Businesses</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-300 group-hover:translate-x-0.5 transition-transform shrink-0">
                    Control Center →
                  </span>
                </button>

                {/* Role Quick Selector Buttons */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Dhandai Textiles — Test Specific Roles:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickTenantLogin("owner@dhandaitextiles.com", "password123")}
                      className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-left text-xs cursor-pointer"
                    >
                      <div className="font-bold">Super Admin</div>
                      <div className="text-[9px] opacity-75 truncate">owner@...</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickTenantLogin("manager@dhandaitextiles.com", "password123")}
                      className="p-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-left text-xs cursor-pointer"
                    >
                      <div className="font-bold">Mill Manager</div>
                      <div className="text-[9px] opacity-75 truncate">manager@...</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickTenantLogin("production@dhandaitextiles.com", "password123")}
                      className="p-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-left text-xs cursor-pointer"
                    >
                      <div className="font-bold">Production</div>
                      <div className="text-[9px] opacity-75 truncate">production@...</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickTenantLogin("accountant@dhandaitextiles.com", "password123")}
                      className="p-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-left text-xs cursor-pointer"
                    >
                      <div className="font-bold">Accountant</div>
                      <div className="text-[9px] opacity-75 truncate">accountant@...</div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tenants.map((t) => {
                    const user = t.users[0];
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleQuickTenantLogin(user.email, "password123")}
                        className="group flex flex-col p-3 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-emerald-500/40 transition-all text-left cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{t.logo}</span>
                            <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 truncate max-w-[130px]">
                              {t.name}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-700/60 text-slate-300">
                            {t.plan}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{t.cluster}</p>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-400 font-mono pt-1.5 border-t border-slate-800/60">
                          <span>{user.role}</span>
                          <span className="group-hover:translate-x-0.5 transition-transform">Login →</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Multi-Tenant Architecture Specs */}
        <div className="lg:col-span-5 text-white space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
              Enterprise Textile Multi-Tenant System
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Switch seamlessly between independent textile manufacturing organizations, high-speed weaving sheds, yarn sizing units, and financial fiscal years.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Factory className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Isolated Organization Data</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Each tenant operates with dedicated looms, yarn lots, beams, employees, customer invoices, and P&L charts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Multi-Unit & Shed Switching</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage multiple weaving sheds, sizing plants, and quality lab units under a single company account.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">4 Ready-to-Test Mill Profiles</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ichalkaranji Cotton (Dhandai), Surat Jacquard (Royal), Bhiwandi Denim (SilverThread), & Coimbatore Export (Mahadev).
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
