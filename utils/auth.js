import jwt from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "skilltrack_token";
export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

export const buildAuthToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.fullName,
    },
    getJwtSecret(),
    {
      expiresIn: AUTH_SESSION_MAX_AGE_SECONDS,
    },
  );
};

export const verifyAuthToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

export const getAuthCookieOptions = () => {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  };
};

export const getPublicUser = (user) => {
  if (!user) {
    return null;
  }

  if (typeof user.toSafeObject === "function") {
    return user.toSafeObject();
  }

  return {
    id: user._id?.toString?.() ?? user.id,
    fullName: user.fullName,
    email: user.email,
    verified: user.verified,
    timezone: user.timezone,
    preferences: user.preferences,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
