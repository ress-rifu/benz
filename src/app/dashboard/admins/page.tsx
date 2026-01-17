import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { requireSuperAdmin } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";
import { AdminsHeader } from "./admins-header";
import { AdminsTable } from "./admins-table";

export default async function AdminsPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <AdminsHeader />
      <Suspense fallback={<TableSkeleton columns={4} rows={5} />}>
        <AdminsTable />
      </Suspense>
    </div>
  );
}
