import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { ServicesTable } from "./services-table";
import { ServicesHeader } from "./services-header";
import { parsePagination } from "@/lib/pagination";

interface PageProps {
    searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default async function ServicesPage({ searchParams }: PageProps) {
    const sp = await searchParams;
    const { page, pageSize } = parsePagination(sp);

    return (
        <div className="space-y-6">
            <ServicesHeader />
            <Suspense
                key={`${page}-${pageSize}`}
                fallback={<TableSkeleton columns={5} rows={Math.min(pageSize, 10)} />}
            >
                <ServicesTable page={page} pageSize={pageSize} />
            </Suspense>
        </div>
    );
}
