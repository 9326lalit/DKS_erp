import { NextResponse } from "next/server";
import { SEED_TENANTS, Tenant } from "@/lib/store/use-tenant-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get("x-tenant-id") || searchParams.get("tenantId");

    if (tenantId && tenantId !== "global-saas") {
      const tenant = SEED_TENANTS.find((t) => t.id === tenantId);
      if (!tenant) {
        return NextResponse.json({ success: false, error: "Tenant not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, tenant });
    }

    // Return list of all tenants for Super Admin
    return NextResponse.json({
      success: true,
      total: SEED_TENANTS.length,
      tenants: SEED_TENANTS.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        cluster: t.cluster,
        plan: t.plan,
        status: t.status,
        logo: t.logo,
        totalLooms: t.factoryDetails.totalLooms,
        ownerName: t.businessDetails.ownerName,
        email: t.businessDetails.email,
        phone: t.businessDetails.phone,
        gstNumber: t.businessDetails.gstNumber
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, ownerName, email, cluster, totalLooms } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Mill Name and Email are required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const city = cluster ? cluster.split(",")[0] : "Ichalkaranji";
    const newTenant: Tenant = {
      id: slug,
      name,
      slug,
      logo: "🏭",
      tagline: `${name} Weaving Mill`,
      cluster: cluster || "Ichalkaranji, Maharashtra",
      plan: "Standard",
      status: "Active",
      currency: "INR",
      businessDetails: {
        businessName: name,
        ownerName: ownerName || "Mill Admin",
        email,
        phone: "+91 98000 00000",
        addressLine1: "MIDC Textile Park",
        city,
        district: "Kolhapur",
        state: "Maharashtra",
        country: "India",
        pincode: "416115",
        gstNumber: "27AAAAA0000A1Z5",
        panNumber: "AAAAA0000A",
        businessType: "Proprietorship",
        industry: "Textile Weaving",
        currency: "INR",
        timezone: "Asia/Kolkata"
      },
      factoryDetails: {
        factoryName: `${name} Main Shed`,
        factoryCode: "U1",
        factoryType: "Weaving Shed",
        factoryAddress: `MIDC Textile Park, ${city}`,
        city,
        district: "Kolhapur",
        state: "Maharashtra",
        country: "India",
        pincode: "416115",
        factoryManager: ownerName || "Mill Admin",
        phone: "+91 98000 00000",
        email,
        totalLooms: Number(totalLooms) || 20,
        factoryStatus: "Active",
        workingHours: "24 Hours Continuous",
        shiftSystem: "2-Shift System (12 Hours each)",
        morningShiftStart: "08:00 AM",
        morningShiftEnd: "08:00 PM",
        nightShiftStart: "08:00 PM",
        nightShiftEnd: "08:00 AM"
      },
      financialYearDetails: {
        financialYear: "2026-2027",
        openingDate: "2026-04-01",
        closingDate: "2027-03-31",
        openingStockDate: "2026-04-01",
        currency: "INR",
        defaultTax: 5
      },
      units: [
        {
          id: `${slug}-u1`,
          name: `${name} Main Shed`,
          code: "U1",
          type: "Weaving Shed",
          location: cluster || "Ichalkaranji",
          status: "Operational",
          totalLooms: Number(totalLooms) || 20
        }
      ],
      users: [
        {
          id: `usr-${slug}`,
          name: ownerName || "Mill Admin",
          email,
          role: "Business Owner",
          avatarUrl: "/images/avatars/01.png",
          phone: "+91 98000 00000"
        }
      ]
    };

    SEED_TENANTS.push(newTenant);

    return NextResponse.json({
      success: true,
      message: `Registered new tenant business: ${name}`,
      tenant: newTenant
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
