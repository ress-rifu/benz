import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "./components/sidebar";
import { Header } from "./components/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    // Sign out first to break the redirect loop between layout and middleware:
    // middleware sees a valid auth session → redirects /login back to /dashboard,
    // but getUser() returns null (e.g. missing users table row) → redirects to /login again.
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div
      id="dashboard-layout"
      className="flex h-screen bg-slate-50 print:block print:h-auto print:bg-white"
    >
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0 print:overflow-visible">{children}</main>
      </div>
    </div>
  );
}


