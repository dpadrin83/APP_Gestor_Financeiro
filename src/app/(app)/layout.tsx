import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { getUpcomingAndOverdueBills, alertsBadgeCount } from "@/lib/bills/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let alertsCount = 0;
  try {
    const { overdue, upcoming } = await getUpcomingAndOverdueBills(7);
    alertsCount = alertsBadgeCount(overdue, upcoming);
  } catch {
    // Tabelas de bills podem ainda não existir antes da migração 0002 ser
    // executada — não é fatal, apenas ignoramos o badge.
  }

  return (
    <div className="flex min-h-svh flex-col">
      <AppNav email={user.email ?? undefined} alertsCount={alertsCount} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
