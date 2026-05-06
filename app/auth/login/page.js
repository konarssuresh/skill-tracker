import { redirect } from "next/navigation";
import { LoginForm } from "@/app/auth/login/login-form";
import { validateUser } from "@/middlewares/validate-user";

export default async function LoginPage() {
  const { isValid } = await validateUser();

  if (isValid) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
