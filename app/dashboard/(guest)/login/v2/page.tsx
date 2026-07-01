"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const VALID_CREDENTIALS: Record<string, { password: string; name: string }> = {
  "bhushan.dks@gmail.com": { password: "123123123", name: "Bhushan DKS" },
  "lalit.dks@gmail.com": { password: "123123123", name: "Lalit DKS" }
};

export default function Page() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "bhushan.dks@gmail.com",
      password: "123123123"
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    const user = VALID_CREDENTIALS[data.email.toLowerCase()];
    if (!user || user.password !== data.password) {
      toast.error("Invalid credentials. Use the provided DKS ERP login details.");
      return;
    }

    window.localStorage.setItem(
      "dks-erp-auth",
      JSON.stringify({ email: data.email.toLowerCase(), name: user.name, loggedIn: true, timestamp: Date.now() })
    );
    toast.success(`Welcome back, ${user.name}! Redirecting to your dashboard.`);
    router.push("/dashboard/default");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <Card className="w-full max-w-md border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
        <CardHeader>
          <CardTitle className="text-3xl">DKS ERP Login</CardTitle>
          <CardDescription>Sign in with your DKS ERP email and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="bhushan.dks@gmail.com" {...register("email")} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/dashboard/forgot-password" className="text-sm text-slate-500 underline">
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" placeholder="123123123" {...register("password")} />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Login to DKS ERP"}
            </Button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 mt-6">
            <p className="font-semibold text-slate-900">Use fixed credentials</p>
            <p className="mt-2">bhushan.dks@gmail.com / 123123123</p>
            <p>lalit.dks@gmail.com / 123123123</p>
          </div>

          <div className="mt-4 text-center text-sm text-slate-500">
            DKS ERP makes procurement, manufacturing and finance easy for textile teams.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
