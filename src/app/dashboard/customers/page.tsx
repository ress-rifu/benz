import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { CustomersTable } from "./customers-table";
import { CustomersHeader } from "./customers-header";

export default function CustomersPage() {
    return (
        <div className="space-y-6">
            <CustomersHeader />
            <Suspense fallback={<TableSkeleton columns={5} rows={10} />}>
                <CustomersTable />
            </Suspense>
        </div>
    );
}
