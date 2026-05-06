import validator from "validator";

export const signupPasswordMessage =
  "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol";

export function validateEmail(value) {
  if (!value || validator.isEmpty(value.trim())) {
    return "Email is required";
  }

  if (!validator.isEmail(value.trim())) {
    return "Enter a valid email address";
  }

  return true;
}

export function validatePasswordForLogin(value) {
  if (!value || validator.isEmpty(value)) {
    return "Password is required";
  }

  return true;
}

export function validateFullName(value) {
  if (!value || validator.isEmpty(value.trim())) {
    return "Full name is required";
  }

  return true;
}

export function validatePasswordForSignup(value) {
  if (!value || validator.isEmpty(value)) {
    return "Password is required";
  }

  if (
    !validator.isStrongPassword(value, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return signupPasswordMessage;
  }

  return true;
}
