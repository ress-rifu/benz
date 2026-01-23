import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { CustomersTable } from "./customers-table";
import { CustomersHeader } from "./customers-header";
import { CustomersSearch } from "./customers-search";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
    const { q } = await searchParams;
    
    return (
        <div className="space-y-6">
            <CustomersHeader />
            <CustomersSearch />
            <Suspense key={q || "all"} fallback={<TableSkeleton columns={5} rows={10} />}>
                <CustomersTable searchQuery={q} />
            </Suspense>
        </div>
    );
}
