import { NextResponse } from "next/server";
import { SEED_TENANTS } from "@/lib/store/use-tenant-store";
import { useMastersStore } from "@/lib/store/use-masters-store";

export async function POST(request: Request) {
  try {
    // Reset Masters Store seeds
    useMastersStore.getState().initializeSeeds();

    return NextResponse.json({
      success: true,
      message: "Database & Seed state successfully reset to initial clean state!",
      tenantsCount: SEED_TENANTS.length,
      tenants: SEED_TENANTS.map((t) => ({
        id: t.id,
        name: t.name,
        owner: t.businessDetails.ownerName,
        email: t.businessDetails.email,
        totalUsers: t.users.length
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
