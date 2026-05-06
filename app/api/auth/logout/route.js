import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
} from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    error: false,
    message: "Logout successful",
  });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });

  return response;
}
