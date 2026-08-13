import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dks-textile-erp-super-secret-jwt-key-2026";
export const TOKEN_COOKIE_NAME = "auth_token";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  isSuperAdmin: boolean;
  tenantName?: string;
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err) {
    return null;
  }
}

export async function getAuthSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJWT(token);
  } catch (err) {
    return null;
  }
}
