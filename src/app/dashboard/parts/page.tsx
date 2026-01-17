import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { PartsTable } from "./parts-table";
import { PartsHeader } from "./parts-header";

export default function PartsPage() {
    return (
        <div className="space-y-6">
            <PartsHeader />
            <Suspense fallback={<TableSkeleton columns={7} rows={10} />}>
                <PartsTable />
            </Suspense>
        </div>
    );
}
