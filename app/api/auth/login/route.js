import User from "@/models/user";
import connectDb from "@/utils/init-db";
import { validateLoginRequest } from "@/utils/validator";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getPublicUser,
} from "@/utils/auth";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await connectDb();
    const body = await req.json();
    validateLoginRequest(body);
    const { email, password } = body;

    const savedUser = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!savedUser) {
      throw new Error("Combination of email and password is not matching");
    }

    const isValid = await savedUser.comparePassword(password);
    if (!isValid) {
      throw new Error("Combination of email and password is not matching");
    }

    const token = savedUser.generateAuthToken();

    const response = NextResponse.json(
      {
        loggedIn: true,
        error: false,
        message: "Login successful",
        user: getPublicUser(savedUser),
      },
      {
        status: 200,
      },
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return response;
  } catch (e) {
    return NextResponse.json(
      {
        loggedIn: false,
        error: true,
        message: e?.message || "Something went wrong",
      },
      {
        status: 400,
      },
    );
  }
};
