import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { InvoicesTable } from "./invoices-table";
import { InvoicesHeader } from "./invoices-header";
import { InvoicesSearch } from "./invoices-search";
import { getUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";
import { parsePagination } from "@/lib/pagination";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
  const [sp, user] = await Promise.all([searchParams, getUser()]);

  if (!user) {
    redirect("/login");
  }

  const isSuperAdmin = user.role === "super_admin";
  const { q } = sp;
  const { page, pageSize } = parsePagination(sp);

  return (
    <div className="space-y-6">
      <InvoicesHeader />
      <InvoicesSearch />
      <Suspense
        key={`${q || "all"}-${page}-${pageSize}`}
        fallback={<TableSkeleton columns={5} rows={Math.min(pageSize, 10)} />}
      >
        <InvoicesTable
          searchQuery={q}
          isSuperAdmin={isSuperAdmin}
          page={page}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
}
