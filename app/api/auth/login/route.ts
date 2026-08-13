import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SEED_TENANTS, GLOBAL_SUPER_ADMIN_USER } from "@/lib/store/use-tenant-store";
import { signJWT, TOKEN_COOKIE_NAME, JWTPayload } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email address is required" }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();

    // 1. Check for Global Super Admin Login
    if (normalized === "superadmin@dks-erp.com" || normalized === "superadmin") {
      const payload: JWTPayload = {
        userId: GLOBAL_SUPER_ADMIN_USER.id,
        email: GLOBAL_SUPER_ADMIN_USER.email,
        name: GLOBAL_SUPER_ADMIN_USER.name,
        role: "Global Super Admin",
        tenantId: "global-saas",
        tenantName: "Global SaaS Control Center",
        isSuperAdmin: true
      };

      const token = signJWT(payload);
      const cookieStore = await cookies();

      cookieStore.set(TOKEN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/"
      });

      return NextResponse.json({
        success: true,
        message: "Authenticated as Global Platform Super Admin",
        isSuperAdmin: true,
        role: "Global Super Admin",
        tenantName: "Global SaaS Control Center",
        tenantId: "global-saas",
        user: GLOBAL_SUPER_ADMIN_USER,
        token
      });
    }

    // 2. Search Tenant Business accounts
    for (const tenant of SEED_TENANTS) {
      const foundUser = tenant.users.find((u) => u.email.toLowerCase() === normalized);
      if (foundUser) {
        const payload: JWTPayload = {
          userId: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          tenantId: tenant.id,
          tenantName: tenant.name,
          isSuperAdmin: false
        };

        const token = signJWT(payload);
        const cookieStore = await cookies();

        cookieStore.set(TOKEN_COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/"
        });

        return NextResponse.json({
          success: true,
          message: `Authenticated as ${foundUser.role} (${tenant.name})`,
          isSuperAdmin: false,
          role: foundUser.role,
          tenantName: tenant.name,
          tenantId: tenant.id,
          user: foundUser,
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            cluster: tenant.cluster,
            plan: tenant.plan,
            businessDetails: tenant.businessDetails
          },
          token
        });
      }
    }

    // 3. Fallback tenant owner lookup
    const targetTenant = SEED_TENANTS.find((t) => t.businessDetails.email.toLowerCase() === normalized);
    if (targetTenant) {
      const ownerUser = targetTenant.users[0];
      const payload: JWTPayload = {
        userId: ownerUser.id,
        email: ownerUser.email,
        name: ownerUser.name,
        role: ownerUser.role,
        tenantId: targetTenant.id,
        tenantName: targetTenant.name,
        isSuperAdmin: false
      };

      const token = signJWT(payload);
      const cookieStore = await cookies();

      cookieStore.set(TOKEN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
      });

      return NextResponse.json({
        success: true,
        message: `Authenticated as ${ownerUser.role} (${targetTenant.name})`,
        isSuperAdmin: false,
        role: ownerUser.role,
        tenantName: targetTenant.name,
        tenantId: targetTenant.id,
        user: ownerUser,
        tenant: {
          id: targetTenant.id,
          name: targetTenant.name,
          slug: targetTenant.slug,
          cluster: targetTenant.cluster,
          plan: targetTenant.plan,
          businessDetails: targetTenant.businessDetails
        },
        token
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid email or password credentials." },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentication error" },
      { status: 500 }
    );
  }
}
