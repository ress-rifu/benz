import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { requireSuperAdmin } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";
import { AdminsHeader } from "./admins-header";
import { AdminsTable } from "./admins-table";
import { parsePagination } from "@/lib/pagination";

interface PageProps {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default async function AdminsPage({ searchParams }: PageProps) {
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  const { page, pageSize } = parsePagination(sp);

  return (
    <div className="space-y-6">
      <AdminsHeader />
      <Suspense
        key={`${page}-${pageSize}`}
        fallback={<TableSkeleton columns={4} rows={Math.min(pageSize, 10)} />}
      >
        <AdminsTable page={page} pageSize={pageSize} />
      </Suspense>
    </div>
  );
}
