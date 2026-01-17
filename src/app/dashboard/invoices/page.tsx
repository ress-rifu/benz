import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { InvoicesTable } from "./invoices-table";
import { InvoicesHeader } from "./invoices-header";
import { InvoicesSearch } from "./invoices-search";
import { getUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
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
      <InvoicesHeader />
      <InvoicesSearch />
      <Suspense key={q || "all"} fallback={<TableSkeleton columns={5} rows={10} />}>
        <InvoicesTable searchQuery={q} isSuperAdmin={isSuperAdmin} />
      </Suspense>
    </div>
  );
}
