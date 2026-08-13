"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Factory,
  Layers,
  Sparkles,
  Crown,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Cpu,
  Zap,
  Check,
  UserCheck,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTenantStore } from "@/lib/store/use-tenant-store";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginV2Page() {
  const router = useRouter();
  const { tenants, login, loginSuperAdmin } = useTenantStore();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"standard" | "demo">("standard");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "bhushan.dks@gmail.com",
      password: "password123"
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const apiRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await apiRes.json();
      if (!apiRes.ok || !result.success) {
        toast.error(result.error || "Invalid login credentials.");
        return;
      }
      const res = login(data.email, data.password);
      if (res.success) {
        toast.success(`JWT Session Issued: Logged in as ${res.role || "User"} (${res.tenantName})`);
        if (res.isSuperAdmin) {
          router.push("/dashboard/super-admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to authenticate.");
    }
  };

  const handleQuickLogin = async (email: string, roleName?: string) => {
    setValue("email", email);
    setValue("password", "password123");
    try {
      const apiRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "password123" })
      });
      const result = await apiRes.json();
      if (!apiRes.ok || !result.success) {
        toast.error(result.error || "Failed to authenticate demo account.");
        return;
      }
      const res = login(email, "password123");
      if (res.success) {
        toast.success(`JWT Cookie Set: Authenticated as ${roleName || res.role} (${res.tenantName})`);
        if (res.isSuperAdmin) {
          router.push("/dashboard/super-admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to authenticate.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden font-sans p-4 lg:p-8">
      {/* Decorative Gradient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/6 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Enterprise Branding & System Specs */}
        <div className="lg:col-span-6 space-y-8 text-white">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
                <Factory className="h-6 w-6 text-slate-950" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white font-display block">
                  DKS TEXTILE ERP
                </span>
                <span className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">
                  Multi-Tenant SaaS Suite v2.4
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-100 leading-tight">
              Next-Gen Weaving <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                Cloud Intelligence
              </span>
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
              Enterprise management for textile weaving mills, multi-unit sheds, yarn procurement, sizing batch tracking, and isolated multi-tenant data governance.
            </p>
          </div>

          {/* Feature Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl space-y-1.5 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-bold text-slate-200">Strict Tenant Scoping</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Every mill operates in a isolated sandbox with dedicated looms, yarn stock, and financials.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl space-y-1.5 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-2 text-blue-400">
                <Cpu className="h-4 w-4" />
                <span className="text-xs font-bold text-slate-200">Real-Time Telemetry</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Monitor loom RPM speeds, shift output, pick counts, and maintenance alerts live.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl space-y-1.5 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-2 text-indigo-400">
                <Layers className="h-4 w-4" />
                <span className="text-xs font-bold text-slate-200">Procurement & Sizing</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Seamless Tana (Warp) POs, Bana (Weft) issue logs, and sizing mill billing.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl space-y-1.5 hover:border-purple-500/30 transition-colors">
              <div className="flex items-center gap-2 text-purple-400">
                <Crown className="h-4 w-4" />
                <span className="text-xs font-bold text-slate-200">Global Admin Portal</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Full platform subscription controls, cross-tenant registries, and security audit trails.
              </p>
            </div>
          </div>

          {/* Compliance Footer badges */}
          <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-800/60">
            <span className="flex items-center gap-1 text-slate-400 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> ISO 27001 Certified
            </span>
            <span className="flex items-center gap-1 text-slate-400 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> GST Taxation Ready
            </span>
            <span className="flex items-center gap-1 text-slate-400 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 24x7 Support
            </span>
          </div>
        </div>

        {/* Right Side: Ultra-Modern Glassmorphic Login Card */}
        <div className="lg:col-span-6">
          <Card className="border border-slate-800 bg-slate-900/85 text-slate-100 shadow-2xl backdrop-blur-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px] uppercase font-bold">
                      Secure Authentication
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">256-Bit SSL Encrypted</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">Welcome Back</h2>
                  <p className="text-xs text-slate-400">Enter your business email to access your textile mill dashboard.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Work Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="bhushan.dks@gmail.com"
                        className="pl-10 bg-slate-950/70 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20 h-11 text-xs rounded-xl"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-semibold text-slate-300">Password</Label>
                      <Link href="/dashboard/forgot-password" className="text-[11px] text-emerald-400 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-slate-950/70 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20 h-11 text-xs rounded-xl"
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 text-xs rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer transition-all gap-2"
                  >
                    {isSubmitting ? "Authenticating..." : "Sign In to ERP Dashboard"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
