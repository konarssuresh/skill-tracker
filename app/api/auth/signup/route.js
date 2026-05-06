import connectDb from "@/utils/init-db";
import User from "@/models/user";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getPublicUser,
} from "@/utils/auth";
import { validateSignupReq } from "@/utils/validator";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDb();
    const body = await request.json();
    validateSignupReq(body);

    const { fullName, email, password } = body;
    const user = new User({
      fullName,
      email: email.toLowerCase(),
      password,
    });

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    const res = await user.save();
    const token = res.generateAuthToken();

    const response = NextResponse.json(
      {
        created: true,
        error: false,
        user: getPublicUser(res),
        message: "Signup successful",
      },
      { status: 201 },
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        created: false,
        error: true,
        message: error?.message || "Something went wrong",
      },
      {
        status: 400,
      },
    );
  }
}
