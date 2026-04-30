import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { QuotationsTable } from "./quotations-table";
import { QuotationsHeader } from "./quotations-header";
import { QuotationsSearch } from "./quotations-search";
import { getUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";
import { parsePagination } from "@/lib/pagination";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}

export default async function QuotationsPage({ searchParams }: PageProps) {
  const [sp, user] = await Promise.all([searchParams, getUser()]);

  if (!user) {
    redirect("/login");
  }

  const isSuperAdmin = user.role === "super_admin";
  const { q } = sp;
  const { page, pageSize } = parsePagination(sp);

  return (
    <div className="space-y-6">
      <QuotationsHeader />
      <QuotationsSearch />
      <Suspense
        key={`${q || "all"}-${page}-${pageSize}`}
        fallback={<TableSkeleton columns={5} rows={Math.min(pageSize, 10)} />}
      >
        <QuotationsTable
          searchQuery={q}
          isSuperAdmin={isSuperAdmin}
          page={page}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
}
