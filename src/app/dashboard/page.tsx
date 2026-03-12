import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { DashboardContent } from "./dashboard-content";
import { DashboardHeader } from "./dashboard-header";
import { getUser } from "@/lib/auth/get-user";

export default async function DashboardPage() {
  const user = await getUser();
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <div className="space-y-6">
      <DashboardHeader />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent isSuperAdmin={isSuperAdmin} />
      </Suspense>
    </div>
  );
}
