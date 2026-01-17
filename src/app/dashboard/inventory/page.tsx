import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { InventoryTable } from "./inventory-table";
import { InventoryHeader } from "./inventory-header";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <InventoryHeader />
      <Suspense fallback={<TableSkeleton columns={6} rows={10} />}>
        <InventoryTable />
      </Suspense>
    </div>
  );
}

