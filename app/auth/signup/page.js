import { redirect } from "next/navigation";
import { SignupForm } from "@/app/auth/signup/signup-form";
import { validateUser } from "@/middlewares/validate-user";

export default async function SignupPage() {
  const { isValid } = await validateUser();

  if (isValid) {
    redirect("/dashboard");
  }

  return <SignupForm />;
}
