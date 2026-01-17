import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { InvoicesTable } from "./invoices-table";
import { InvoicesHeader } from "./invoices-header";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <InvoicesHeader />
      <Suspense fallback={<TableSkeleton columns={6} rows={10} />}>
        <InvoicesTable />
      </Suspense>
    </div>
  );
}

