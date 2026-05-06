import connectDb from "@/utils/init-db";
import User from "@/models/user";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/utils/auth";

const getRequestToken = async (request) => {
  if (request?.cookies) {
    return request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
  }

  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value ?? null;
};

export const validateUser = async (request) => {
  const token = await getRequestToken(request);

  if (!token) {
    return { isValid: false, message: "missing token" };
  }

  try {
    const payload = verifyAuthToken(token);
    await connectDb();
    const user = await User.findById(payload._id || payload.sub);
    if (!user) {
      return { isValid: false, message: "missing user" };
    }

    return {
      isValid: true,
      user,
      token,
      payload,
    };
  } catch {
    return { isValid: false, message: "invalid token" };
  }
};
