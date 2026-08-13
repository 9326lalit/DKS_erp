import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TOKEN_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_COOKIE_NAME);

    return NextResponse.json({
      success: true,
      message: "Successfully logged out. JWT session cleared."
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
