import { NextResponse } from "next/server";
import { useMastersStore, Loom } from "@/lib/store/use-masters-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get("x-tenant-id") || searchParams.get("tenantId") || "dhandai-textiles";
    const isSuperAdmin = request.headers.get("x-is-super-admin") === "true";

    const allLooms = useMastersStore.getState().looms;

    if (isSuperAdmin || tenantId === "global-saas") {
      return NextResponse.json({ success: true, total: allLooms.length, looms: allLooms });
    }

    const scopedLooms = allLooms.filter(
      (l) => l.tenantId === tenantId || (!l.tenantId && tenantId === "dhandai-textiles")
    );

    return NextResponse.json({
      success: true,
      tenantId,
      total: scopedLooms.length,
      looms: scopedLooms
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get("x-tenant-id") || body.tenantId || "dhandai-textiles";

    const newLoom: Loom = {
      id: `LOM-ID-${Date.now().toString().slice(-4)}`,
      tenantId,
      loomId: body.loomId || `LOM-${Math.floor(100 + Math.random() * 900)}`,
      factoryId: body.factoryId || "FAC-ID-001",
      factoryName: body.factoryName || "Weaving Shed",
      loomNumber: body.loomNumber || `L-${Math.floor(10 + Math.random() * 90)}`,
      loomType: body.loomType || "Power Loom",
      reedCount: Number(body.reedCount) || 120,
      widthInches: Number(body.widthInches) || 60,
      rpmSpeed: Number(body.rpmSpeed) || 680,
      makeBrand: body.makeBrand || "Picanol",
      yearOfPurchase: Number(body.yearOfPurchase) || 2023,
      status: body.status || "Active",
      remarks: body.remarks || ""
    };

    useMastersStore.getState().createLoom(newLoom);

    return NextResponse.json({
      success: true,
      message: `Created Loom ${newLoom.loomNumber} for tenant ${tenantId}`,
      loom: newLoom
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
