import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    return NextResponse.json({ data: ["dummy skill"] });
  } catch (e) {}
};
