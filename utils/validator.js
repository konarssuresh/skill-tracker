import validator from "validator";

const SIGNUP_ALLOWED_KEYS = ["fullName", "email", "password"];

export const validateSignupReq = (req) => {
  const invalidKeys = Object.keys(req).filter(
    (key) => !SIGNUP_ALLOWED_KEYS.includes(key),
  );

  if (invalidKeys.length > 0) {
    throw new Error(`Invalid fields in request: ${invalidKeys.join(", ")}`);
  }

  const { fullName, email, password } = req;

  if (!fullName || validator.isEmpty(fullName.trim())) {
    throw new Error("Full name is required");
  }

  if (!email || !validator.isEmail(email)) {
    throw new Error("A valid email is required");
  }

  if (
    !password ||
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol",
    );
  }

  return true;
};

const LOGIN_ALLOWED_KEYS = ["email", "password"];

export const validateLoginRequest = (req) => {
  const invalidKeys = Object.keys(req).filter(
    (key) => !LOGIN_ALLOWED_KEYS.includes(key),
  );

  if (invalidKeys.length > 0) {
    throw new Error(`Invalid fields in request: ${invalidKeys.join(", ")}`);
  }

  const { email, password } = req;

  if (!email || !validator.isEmail(email)) {
    throw new Error("A valid email is required");
  }

  if (
    !password ||
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol",
    );
  }
};
