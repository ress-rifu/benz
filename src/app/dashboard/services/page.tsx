import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { ServicesTable } from "./services-table";
import { ServicesHeader } from "./services-header";

export default function ServicesPage() {
    return (
        <div className="space-y-6">
            <ServicesHeader />
            <Suspense fallback={<TableSkeleton columns={5} rows={10} />}>
                <ServicesTable />
            </Suspense>
        </div>
    );
}
