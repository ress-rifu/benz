import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { DashboardContent } from "./dashboard-content";
import { getUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  const isSuperAdmin = user.role === "super_admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">
          Welcome to Benz Automobile management system
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent isSuperAdmin={isSuperAdmin} />
      </Suspense>
    </div>
  );
}

