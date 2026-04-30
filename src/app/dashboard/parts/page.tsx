import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { PartsTable } from "./parts-table";
import { PartsHeader } from "./parts-header";
import { PartsSearch } from "./parts-search";
import { parsePagination } from "@/lib/pagination";

interface PageProps {
    searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}

export default async function PartsPage({ searchParams }: PageProps) {
    const sp = await searchParams;
    const { q } = sp;
    const { page, pageSize } = parsePagination(sp);

    return (
        <div className="space-y-6">
            <PartsHeader />
            <PartsSearch />
            <Suspense
                key={`${q || "all"}-${page}-${pageSize}`}
                fallback={<TableSkeleton columns={7} rows={Math.min(pageSize, 10)} />}
            >
                <PartsTable searchQuery={q} page={page} pageSize={pageSize} />
            </Suspense>
        </div>
    );
}
