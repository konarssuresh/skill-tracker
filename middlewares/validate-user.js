import connectDb from "@/utils/init-db";
import User from "@/models/user";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const validateUser = async () => {
  const store = await cookies();
  const token = store.get("token");

  if (!token || !token?.value) {
    return { isValid: false, message: "missing token" };
  }

  const { _id } = jwt.verify(token?.value, process.env.JWT_SECRET);

  const user = await User.findById(_id);

  if (!user) {
    return { isValid: false, message: "missing user" };
  }

  return {
    isValid: true,
    user,
  };
};
