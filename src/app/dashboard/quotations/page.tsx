import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { QuotationsTable } from "./quotations-table";
import { QuotationsHeader } from "./quotations-header";
import { QuotationsSearch } from "./quotations-search";
import { getUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function QuotationsPage({ searchParams }: PageProps) {
  const [{ q }, user] = await Promise.all([
    searchParams,
    getUser(),
  ]);
  
  if (!user) {
    redirect("/login");
  }
  
  const isSuperAdmin = user.role === "super_admin";
  
  return (
    <div className="space-y-6">
      <QuotationsHeader />
      <QuotationsSearch />
      <Suspense key={q || "all"} fallback={<TableSkeleton columns={5} rows={10} />}>
        <QuotationsTable searchQuery={q} isSuperAdmin={isSuperAdmin} />
      </Suspense>
    </div>
  );
}
