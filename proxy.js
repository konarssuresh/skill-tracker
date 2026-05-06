import { NextResponse } from "next/server";
import { validateUser } from "@/middlewares/validate-user";

const AUTH_NEEDED_URL = ["skills"];
const UI_AUTH_NEEDED_URL = ["dashboard"];

export async function proxy(req) {
  const path = req.url;

  const isAuthNeededApi = AUTH_NEEDED_URL.some((route) => path.includes(route));
  const isUIAuthNeededRoute = UI_AUTH_NEEDED_URL.some((route) =>
    path.includes(route),
  );

  if (isAuthNeededApi) {
    const { isValid, message = "", user } = await validateUser(req);
    if (!isValid) {
      return NextResponse.json({ success: false, message }, { status: 400 });
    }
    req.user = user;
  }

  if (isUIAuthNeededRoute) {
    const { isValid, message } = await validateUser(req);
    console.log({ isValid, message });
    if (!isValid) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard"],
};
