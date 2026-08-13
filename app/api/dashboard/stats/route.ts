import { NextResponse } from "next/server";
import { getMockData } from "@/lib/services/mock-api";
import { SEED_TENANTS } from "@/lib/store/use-tenant-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get("x-tenant-id") || searchParams.get("tenantId") || "dhandai-textiles";

    const tenant = SEED_TENANTS.find((t) => t.id === tenantId) || SEED_TENANTS[0];
    const data = getMockData(tenantId);

    const runningLooms = data.looms.filter((l: any) => l.status === "running").length;
    const idleLooms = data.looms.filter((l: any) => l.status === "idle").length;
    const maintenanceLooms = data.looms.filter((l: any) => l.status === "maintenance").length;

    const yarnStockKg = data.yarnLots
      .filter((l: any) => l.status === "active")
      .reduce((sum: number, l: any) => sum + l.balanceWeightKg, 0);

    const monthlyProdMeters = data.productionRecords.reduce((sum: number, r: any) => sum + r.metersProduced, 0);

    const runningLoomItems = data.looms.filter((l: any) => l.status === "running");
    const avgEfficiency = runningLoomItems.length
      ? Math.round(runningLoomItems.reduce((sum: number, l: any) => sum + l.efficiency, 0) / runningLoomItems.length)
      : 88;

    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
      tenantName: tenant.name,
      cluster: tenant.cluster,
      plan: tenant.plan,
      stats: {
        totalLooms: tenant.factoryDetails.totalLooms,
        runningLooms,
        idleLooms,
        maintenanceLooms,
        avgEfficiency: `${avgEfficiency}%`,
        yarnStockKg: `${yarnStockKg.toLocaleString()} KG`,
        monthlyProductionMeters: `${monthlyProdMeters.toLocaleString()} Mtr`,
        activeUnitsCount: tenant.units.length,
        usersCount: tenant.users.length
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
