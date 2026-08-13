import { NextResponse } from "next/server";
import { useMastersStore, Factory } from "@/lib/store/use-masters-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get("x-tenant-id") || searchParams.get("tenantId") || "dhandai-textiles";
    const isSuperAdmin = request.headers.get("x-is-super-admin") === "true";

    const allFactories = useMastersStore.getState().factories;

    if (isSuperAdmin || tenantId === "global-saas") {
      return NextResponse.json({ success: true, total: allFactories.length, factories: allFactories });
    }

    const scopedFactories = allFactories.filter(
      (f) => f.tenantId === tenantId || (!f.tenantId && tenantId === "dhandai-textiles")
    );

    return NextResponse.json({
      success: true,
      tenantId,
      total: scopedFactories.length,
      factories: scopedFactories
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get("x-tenant-id") || body.tenantId || "dhandai-textiles";

    const newFactory: Factory = {
      id: `FAC-ID-${Date.now().toString().slice(-4)}`,
      tenantId,
      factoryId: body.factoryId || `FAC-${Math.floor(100 + Math.random() * 900)}`,
      factoryName: body.factoryName || "New Weaving Shed",
      ownerName: body.ownerName || "Mill Owner",
      plotNo: body.plotNo || "Plot 1",
      addressLine1: body.addressLine1 || "MIDC Industrial Zone",
      cityVillage: body.cityVillage || "Ichalkaranji",
      taluka: body.taluka || "Shirol",
      district: body.district || "Kolhapur",
      state: body.state || "Maharashtra",
      pincode: body.pincode || "416115",
      shedLength: Number(body.shedLength) || 100,
      shedWidth: Number(body.shedWidth) || 50,
      totalArea: (Number(body.shedLength) || 100) * (Number(body.shedWidth) || 50),
      shedType: body.shedType || "RCC",
      contactNumber: body.contactNumber || "+91 98000 00000",
      email: body.email || "owner@mill.com",
      activeStatus: "Active",
      notes: body.notes || ""
    };

    useMastersStore.getState().createFactory(newFactory);

    return NextResponse.json({
      success: true,
      message: `Created Factory Shed ${newFactory.factoryName}`,
      factory: newFactory
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
