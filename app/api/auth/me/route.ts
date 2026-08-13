import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/jwt";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ success: false, authenticated: false, error: "Unauthorized session token" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      session
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
