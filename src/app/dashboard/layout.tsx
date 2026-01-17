import { getUser } from "@/lib/auth/get-user";
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
        <main className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible">{children}</main>
      </div>
    </div>
  );
}

