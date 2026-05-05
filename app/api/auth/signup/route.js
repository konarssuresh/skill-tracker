import connectDb from "@/utils/init-db";
import User from "@/models/user";
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
      email,
      password,
    });

    await user.hashPassword();

    const res = await user.save();
    return NextResponse.json(
      {
        created: true,
        error: false,
        data: res,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        created: false,
        error: true,
        data: error?.message || "Something went wrong",
      },
      {
        status: 400,
      },
    );
  }
}
