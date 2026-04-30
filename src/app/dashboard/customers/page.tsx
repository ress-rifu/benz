import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { CustomersTable } from "./customers-table";
import { CustomersHeader } from "./customers-header";
import { CustomersSearch } from "./customers-search";
import { parsePagination } from "@/lib/pagination";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
    const sp = await searchParams;
    const { q } = sp;
    const { page, pageSize } = parsePagination(sp);

    return (
        <div className="space-y-6">
            <CustomersHeader />
            <CustomersSearch />
            <Suspense
                key={`${q || "all"}-${page}-${pageSize}`}
                fallback={<TableSkeleton columns={5} rows={Math.min(pageSize, 10)} />}
            >
                <CustomersTable searchQuery={q} page={page} pageSize={pageSize} />
            </Suspense>
        </div>
    );
}
