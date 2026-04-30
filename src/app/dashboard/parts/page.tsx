import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { PartsTable } from "./parts-table";
import { PartsHeader } from "./parts-header";
import { PartsSearch } from "./parts-search";

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function PartsPage({ searchParams }: PageProps) {
    const { q } = await searchParams;

    return (
        <div className="space-y-6">
            <PartsHeader />
            <PartsSearch />
            <Suspense key={q || "all"} fallback={<TableSkeleton columns={7} rows={10} />}>
                <PartsTable searchQuery={q} />
            </Suspense>
        </div>
    );
}
