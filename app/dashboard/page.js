import { DashboardShell } from "@/app/dashboard/dashboard-shell";
import { validateUser } from "@/middlewares/validate-user";

export default async function DashboardPage() {
  const { user } = await validateUser();
  const safeUser = {
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
  };

  return <DashboardShell user={safeUser} />;
}
